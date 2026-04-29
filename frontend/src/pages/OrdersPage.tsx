import { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../api/products.api';
import { getInventory } from '../api/inventory.api';
import {
  createOrder,
  deleteOrder,
  getOrders,
  updateOrder,
  type Order,
  type OrderStatus,
} from '../api/orders.api';
import type { InventoryUnit, Product, ProductCategory } from '../api/types';
import { centsToMoney } from '../utils/money';

const ORDER_STATUS: OrderStatus[] = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
const PRODUCT_CATEGORIES: ProductCategory[] = ['CONSOLE', 'GAME', 'ACCESSORY'];

type DraftOrderItem = {
  productId: string;
  inventoryUnitId: string;
  quantity: number;
};

function getCategoryLabel(category: string) {
  switch (category) {
    case 'CONSOLE':
      return '🎮 Consola';
    case 'GAME':
      return '🕹️ Juego';
    case 'ACCESSORY':
      return '🎧 Accesorio';
    default:
      return category;
  }
}

function getOrderStatusLabel(status: OrderStatus) {
  switch (status) {
    case 'PENDING':
      return 'Pendiente';
    case 'ACTIVE':
      return 'Activa';
    case 'COMPLETED':
      return 'Completada';
    case 'CANCELLED':
      return 'Cancelada';
    default:
      return status;
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [productId, setProductId] = useState('');
  const [inventoryUnitId, setInventoryUnitId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [draftItems, setDraftItems] = useState<DraftOrderItem[]>([]);

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const [ordersData, productsData, inventoryData] = await Promise.all([
        getOrders(),
        getProducts(),
        getInventory(),
      ]);

      setOrders(ordersData);
      setProducts(productsData);
      setInventory(inventoryData);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message?.toString?.() ??
        e?.message ??
        'Error cargando órdenes';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const inventoryMap = useMemo(() => {
    const map = new Map<string, InventoryUnit>();
    inventory.forEach((u) => map.set(u.id, u));
    return map;
  }, [inventory]);

  const selectedDraftUnitIds = useMemo(() => {
    return new Set(draftItems.map((item) => item.inventoryUnitId));
  }, [draftItems]);

  const availableInventory = useMemo(() => {
    return inventory.filter((u) => u.status === 'AVAILABLE');
  }, [inventory]);

  const rentableProducts = useMemo(() => {
    const availableProductIds = new Set(
      availableInventory
        .filter((u) => !selectedDraftUnitIds.has(u.id))
        .map((u) => u.productId),
    );

    return products.filter(
      (p) =>
        availableProductIds.has(p.id) &&
        (category ? p.category === category : true),
    );
  }, [products, availableInventory, selectedDraftUnitIds, category]);

  useEffect(() => {
    if (rentableProducts.length === 0) {
      setProductId('');
      setInventoryUnitId('');
      return;
    }

    const exists = rentableProducts.some((p) => p.id === productId);
    if (!exists) {
      setProductId(rentableProducts[0].id);
    }
  }, [rentableProducts, productId]);

  const availableUnitsForProduct = useMemo(() => {
    return availableInventory.filter(
      (u) =>
        u.productId === productId &&
        !selectedDraftUnitIds.has(u.id),
    );
  }, [availableInventory, productId, selectedDraftUnitIds]);

  useEffect(() => {
    if (availableUnitsForProduct.length === 0) {
      setInventoryUnitId('');
      return;
    }

    const exists = availableUnitsForProduct.some((u) => u.id === inventoryUnitId);
    if (!exists) {
      setInventoryUnitId(availableUnitsForProduct[0].id);
    }
  }, [availableUnitsForProduct, inventoryUnitId]);

  function onAddItem() {
    setErr(null);

    if (!category) {
      setErr('Selecciona una categoría');
      return;
    }

    if (!productId) {
      setErr('Selecciona un producto');
      return;
    }

    if (!inventoryUnitId) {
      setErr('Selecciona una unidad disponible');
      return;
    }

    if (quantity <= 0) {
      setErr('La cantidad debe ser mayor a 0');
      return;
    }

    const duplicated = draftItems.some(
      (item) => item.inventoryUnitId === inventoryUnitId,
    );

    if (duplicated) {
      setErr('Esa unidad ya fue agregada a la orden');
      return;
    }

    setDraftItems((prev) => [
      ...prev,
      {
        productId,
        inventoryUnitId,
        quantity,
      },
    ]);

    setQuantity(1);
  }

  function onRemoveDraftItem(inventoryUnitIdToRemove: string) {
    setDraftItems((prev) =>
      prev.filter((item) => item.inventoryUnitId !== inventoryUnitIdToRemove),
    );
  }

  async function onCreate() {
    try {
      setErr(null);

      if (!customerName.trim()) return setErr('El nombre del cliente es obligatorio');
      if (!customerEmail.trim()) return setErr('El correo del cliente es obligatorio');
      if (!startDate) return setErr('La fecha de inicio es obligatoria');
      if (!endDate) return setErr('La fecha de fin es obligatoria');
      if (draftItems.length === 0) return setErr('Agrega al menos un item a la orden');

      const created = await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() ? customerPhone.trim() : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        items: draftItems.map((item) => ({
          productId: item.productId,
          inventoryUnitId: item.inventoryUnitId,
          quantity: item.quantity,
        })),
      });

      setOrders((prev) => [created, ...prev]);

      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setStartDate('');
      setEndDate('');
      setCategory('');
      setProductId('');
      setInventoryUnitId('');
      setQuantity(1);
      setDraftItems([]);

      await load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message?.toString?.() ??
        e?.message ??
        'Error creando orden';
      setErr(msg);
    }
  }

  async function onChangeStatus(order: Order, status: OrderStatus) {
    try {
      setErr(null);
      const updated = await updateOrder(order.id, { status });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      await load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message?.toString?.() ??
        e?.message ??
        'Error actualizando orden';
      setErr(msg);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm('¿Eliminar orden?');
    if (!ok) return;

    try {
      setErr(null);
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      await load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message?.toString?.() ??
        e?.message ??
        'Error eliminando orden';
      setErr(msg);
    }
  }

  const noAvailableInventory = rentableProducts.length === 0 && !!category;

  const draftTotal = useMemo(() => {
    return draftItems.reduce((acc, item) => {
      const product = productMap.get(item.productId);
      if (!product) return acc;
      return acc + product.priceCents * item.quantity;
    }, 0);
  }, [draftItems, productMap]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Órdenes</h2>
        <button className="btn btn-secondary" onClick={load}>
          Refrescar
        </button>
      </div>

      <p className="helper-text">
        Crea órdenes de renta y administra sus estados.
      </p>

      {loading && <p className="helper-text">Cargando…</p>}
      {err && <p className="error-text">{err}</p>}

      <div className="section-card">
        <h3 className="section-title">Crear orden</h3>

        <div className="form-grid">
          <div className="field">
            <label>Nombre del cliente</label>
            <input
              className="input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Correo del cliente</label>
            <input
              className="input"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Teléfono del cliente</label>
            <input
              className="input"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Fecha de inicio</label>
            <input
              className="input"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Fecha de fin</label>
            <input
              className="input"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <hr className="divider" />

        <h3 className="section-title">Agregar item</h3>

        <div className="form-grid">
          <div className="field">
            <label>Categoría</label>
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
            >
              <option value="">Selecciona categoría</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Producto</label>
            <select
              className="select"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={!category}
            >
              <option value="">Selecciona producto</option>
              {rentableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({getCategoryLabel(p.category)})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Unidad de inventario</label>
            <select
              className="select"
              value={inventoryUnitId}
              onChange={(e) => setInventoryUnitId(e.target.value)}
              disabled={!productId || availableUnitsForProduct.length === 0}
            >
              <option value="">Selecciona unidad</option>
              {availableUnitsForProduct.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.serialNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Cantidad</label>
            <input
              className="input"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="form-grid-full">
            <button
              className="btn btn-primary btn-block"
              onClick={onAddItem}
              disabled={!category || !productId || !inventoryUnitId}
            >
              Agregar item
            </button>
          </div>
        </div>

        {category && noAvailableInventory && (
          <p className="warning-text">
            No hay productos disponibles en la categoría seleccionada.
          </p>
        )}

        <div style={{ marginTop: 18 }}>
          <h3 className="section-title">Items de la orden</h3>

          {draftItems.length === 0 ? (
            <p className="helper-text">Aún no has agregado items.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Serie</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {draftItems.map((item) => {
                    const product = productMap.get(item.productId);
                    const unit = inventoryMap.get(item.inventoryUnitId);
                    const subtotal = product ? product.priceCents * item.quantity : 0;

                    return (
                      <tr key={item.inventoryUnitId}>
                        <td>{product ? product.name : item.productId}</td>
                        <td>{unit ? unit.serialNumber : item.inventoryUnitId}</td>
                        <td>{item.quantity}</td>
                        <td>{product ? centsToMoney(subtotal, product.currency) : '-'}</td>
                        <td className="actions-cell">
                          <button
                            className="btn btn-danger"
                            onClick={() => onRemoveDraftItem(item.inventoryUnitId)}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="summary-box">
                Total estimado: {centsToMoney(draftTotal, 'MXN')}
              </div>
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={onCreate}
          style={{ marginTop: 18 }}
          disabled={draftItems.length === 0}
        >
          Crear orden
        </button>
      </div>

      {!loading && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Fechas</th>
                <th>Items</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="item-stack">
                      <strong>{order.customerName}</strong>
                      <span className="subtle">{order.customerPhone ?? ''}</span>
                    </div>
                  </td>

                  <td>{order.customerEmail}</td>

                  <td>
                    <div className="item-stack">
                      <span className={`badge badge-${order.status}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      <select
                        className="select"
                        value={order.status}
                        onChange={(e) => onChangeStatus(order, e.target.value as OrderStatus)}
                      >
                        {ORDER_STATUS.map((s) => (
                          <option key={s} value={s}>
                            {getOrderStatusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td>
                    <div className="item-stack">
                      <span>Inicio: {new Date(order.startDate).toLocaleString()}</span>
                      <span>Fin: {new Date(order.endDate).toLocaleString()}</span>
                    </div>
                  </td>

                  <td>
                    <div className="item-stack">
                      {order.items.map((item) => {
                        const product = productMap.get(item.productId);
                        const unit = item.inventoryUnitId
                          ? inventoryMap.get(item.inventoryUnitId)
                          : null;

                        return (
                          <div key={item.id}>
                            <div>{product ? product.name : item.productId}</div>
                            <div className="subtle">
                              cant: {item.quantity}
                              {unit ? ` | serie: ${unit.serialNumber}` : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  <td>{centsToMoney(order.totalCents, order.currency)}</td>

                  <td className="actions-cell">
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(order.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No hay órdenes registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}