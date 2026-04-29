import { useEffect, useMemo, useState } from 'react';
import {
  createInventory,
  deleteInventory,
  getInventory,
  updateInventory,
} from '../api/inventory.api';
import { getProducts } from '../api/products.api';
import type {
  InventoryCondition,
  InventoryStatus,
  InventoryUnit,
  Product,
} from '../api/types';

const STATUS: InventoryStatus[] = [
  'AVAILABLE',
  'RESERVED',
  'IN_RENT',
  'MAINTENANCE',
  'RETIRED',
];

const CONDITION: InventoryCondition[] = ['NEW', 'GOOD', 'FAIR', 'DAMAGED'];

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

function getStatusLabel(status: InventoryStatus) {
  switch (status) {
    case 'AVAILABLE':
      return 'Disponible';
    case 'RESERVED':
      return 'Reservado';
    case 'IN_RENT':
      return 'Rentado';
    case 'MAINTENANCE':
      return 'Mantenimiento';
    case 'RETIRED':
      return 'Retirado';
    default:
      return status;
  }
}

function getConditionLabel(condition: InventoryCondition) {
  switch (condition) {
    case 'NEW':
      return 'Nuevo';
    case 'GOOD':
      return 'Buena';
    case 'FAIR':
      return 'Regular';
    case 'DAMAGED':
      return 'Dañado';
    default:
      return condition;
  }
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<'ALL' | InventoryStatus>('ALL');

  const [productId, setProductId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<InventoryStatus>('AVAILABLE');
  const [condition, setCondition] = useState<InventoryCondition>('GOOD');
  const [notes, setNotes] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const [productsData, inventoryData] = await Promise.all([
        getProducts(),
        getInventory(),
      ]);

      setProducts(productsData);
      setUnits(inventoryData);

      if (!productId && productsData.length > 0) {
        setProductId(productsData[0].id);
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message?.toString?.() ??
        e?.message ??
        'Error cargando inventario';
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

  const filteredUnits = useMemo(() => {
    if (filterStatus === 'ALL') return units;
    return units.filter((u) => u.status === filterStatus);
  }, [units, filterStatus]);

  async function onCreate() {
    try {
      setErr(null);

      if (!productId) {
        setErr('Selecciona un producto');
        return;
      }

      if (!serialNumber.trim()) {
        setErr('El serial es obligatorio');
        return;
      }

      const created = await createInventory({
        productId,
        serialNumber: serialNumber.trim(),
        status,
        condition,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      setUnits((prev) => [created, ...prev]);
      setSerialNumber('');
      setNotes('');
      setStatus('AVAILABLE');
      setCondition('GOOD');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message?.toString?.() ??
        e?.message ??
        'Error creando unidad';
      setErr(msg);
    }
  }

  async function onUpdate(
    unit: InventoryUnit,
    patch: Partial<{
      status: InventoryStatus;
      condition: InventoryCondition;
      notes: string | null;
    }>,
  ) {
    try {
      setErr(null);

      const updated = await updateInventory(unit.id, {
        status: patch.status ?? unit.status,
        condition: patch.condition ?? unit.condition,
        notes:
          patch.notes !== undefined
            ? patch.notes
            : unit.notes ?? undefined,
      });

      setUnits((prev) => prev.map((u) => (u.id === unit.id ? updated : u)));
    } catch (e: any) {
      const msg =
        e?.response?.data?.message?.toString?.() ??
        e?.message ??
        'Error actualizando unidad';
      setErr(msg);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm('¿Eliminar unidad de inventario?');
    if (!ok) return;

    try {
      setErr(null);
      await deleteInventory(id);
      setUnits((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      const msg =
        e?.response?.data?.message?.toString?.() ??
        e?.message ??
        'Error eliminando unidad';
      setErr(msg);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Inventario</h2>
        <button className="btn btn-secondary" onClick={load}>
          Refrescar
        </button>
      </div>

      <p className="helper-text">
        Administra las unidades físicas disponibles para renta.
      </p>

      {loading && <p className="helper-text">Cargando…</p>}
      {err && <p className="error-text">{err}</p>}

      <div className="section-card">
        <h3 className="section-title">Crear unidad</h3>

        <div className="form-grid">
          <div className="field">
            <label>Producto</label>
            <select
              className="select"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({getCategoryLabel(p.category)})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Número de serie</label>
            <input
              className="input"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Ej. PS5SLIM-0006"
            />
          </div>

          <div className="field">
            <label>Estado</label>
            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as InventoryStatus)}
            >
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Condición</label>
            <select
              className="select"
              value={condition}
              onChange={(e) => setCondition(e.target.value as InventoryCondition)}
            >
              {CONDITION.map((c) => (
                <option key={c} value={c}>
                  {getConditionLabel(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="field form-grid-full">
            <label>Notas</label>
            <input
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Incluye cable de carga"
            />
          </div>

          <div className="form-grid-full">
            <button className="btn btn-primary btn-block" onClick={onCreate}>
              Crear unidad
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <span className="field-title">Filtrar por estado:</span>
        <select
          className="select"
          style={{ maxWidth: 220 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'ALL' | InventoryStatus)}
        >
          <option value="ALL">Todos</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(s)}
            </option>
          ))}
        </select>

        <span className="subtle">({filteredUnits.length} unidades)</span>
      </div>

      {!loading && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Serie</th>
                <th>Estado</th>
                <th>Condición</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((u) => {
                const product = productMap.get(u.productId);

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="item-stack">
                        <strong>{product ? product.name : u.productId}</strong>
                        <span className="subtle">
                          {product ? getCategoryLabel(product.category) : 'Sin categoría'}
                        </span>
                      </div>
                    </td>

                    <td>{u.serialNumber}</td>

                    <td>
                      <div className="item-stack">
                        <span className={`badge badge-${u.status}`}>
                          {getStatusLabel(u.status)}
                        </span>
                        <select
                          className="select"
                          value={u.status}
                          onChange={(e) =>
                            onUpdate(u, { status: e.target.value as InventoryStatus })
                          }
                        >
                          {STATUS.map((s) => (
                            <option key={s} value={s}>
                              {getStatusLabel(s)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td>
                      <div className="item-stack">
                        <span className="badge badge-ACTIVE">
                          {getConditionLabel(u.condition)}
                        </span>
                        <select
                          className="select"
                          value={u.condition}
                          onChange={(e) =>
                            onUpdate(u, {
                              condition: e.target.value as InventoryCondition,
                            })
                          }
                        >
                          {CONDITION.map((c) => (
                            <option key={c} value={c}>
                              {getConditionLabel(c)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td>
                      <input
                        className="input"
                        defaultValue={u.notes ?? ''}
                        onBlur={(e) => onUpdate(u, { notes: e.target.value })}
                        placeholder="(vacío)"
                      />
                    </td>

                    <td className="actions-cell">
                      <button
                        className="btn btn-danger"
                        onClick={() => onDelete(u.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No hay unidades con ese filtro.
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