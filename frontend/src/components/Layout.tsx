import { NavLink, Outlet } from 'react-router-dom';

function navClassName({ isActive }: { isActive: boolean }) {
  return `nav-link ${isActive ? 'active' : ''}`;
}

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">GameRent Admin</h1>
        <p className="app-subtitle">
          Gestión de productos, inventario y órdenes de renta
        </p>
      </header>

      <nav className="navbar">
        <NavLink to="/products" className={navClassName}>
          Productos
        </NavLink>

        <NavLink to="/inventory" className={navClassName}>
          Inventario
        </NavLink>

        <NavLink to="/orders" className={navClassName}>
          Órdenes
        </NavLink>
      </nav>

      <main className="page-card">
        <Outlet />
      </main>
    </div>
  );
}