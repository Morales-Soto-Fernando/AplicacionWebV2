import { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../api/products.api';
import type { Product } from '../api/types';
import { centsToMoney } from '../utils/money';

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

function getCategoryBadgeClass(category: string) {
  switch (category) {
    case 'CONSOLE':
      return 'badge badge-category-console';
    case 'GAME':
      return 'badge badge-category-game';
    case 'ACCESSORY':
      return 'badge badge-category-accessory';
    default:
      return 'badge badge-ACTIVE';
  }
}

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const data = await getProducts();
      setItems(data);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message?.toString?.() ??
        e?.message ??
        'Error cargando productos';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => items, [items]);

  const totalProducts = rows.length;
  const totalActive = rows.filter((p) => p.isActive).length;
  const totalConsoles = rows.filter((p) => p.category === 'CONSOLE').length;
  const totalGames = rows.filter((p) => p.category === 'GAME').length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <button className="btn btn-secondary" onClick={load}>
          Refrescar
        </button>
      </div>

      <p className="helper-text">
        Catálogo general de productos disponibles para renta.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Productos totales</div>
          <div className="stat-value">{totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Activos</div>
          <div className="stat-value">{totalActive}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Consolas</div>
          <div className="stat-value">{totalConsoles}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Juegos</div>
          <div className="stat-value">{totalGames}</div>
        </div>
      </div>

      {loading && <p className="helper-text">Cargando…</p>}
      {err && <p className="error-text">{err}</p>}

      {!loading && !err && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="item-stack">
                      <strong>{p.name}</strong>
                      {p.description ? (
                        <span className="subtle">{p.description}</span>
                      ) : null}
                    </div>
                  </td>

                  <td>{p.brand}</td>

                  <td>{p.model ?? '-'}</td>

                  <td>
                    <span className={getCategoryBadgeClass(p.category)}>
                      {getCategoryLabel(p.category)}
                    </span>
                  </td>

                  <td>{centsToMoney(p.priceCents, p.currency)}</td>

                  <td>
                    {p.isActive ? (
                      <span className="badge badge-COMPLETED">Activo</span>
                    ) : (
                      <span className="badge badge-CANCELLED">No disponible</span>
                    )}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No hay productos en el catálogo.
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