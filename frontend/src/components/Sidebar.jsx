import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">💊</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end title="Dashboard">
          <div className="nav-icon">📊</div>
          <span className="nav-label">Home</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Inventory">
          <div className="nav-icon">💉</div>
          <span className="nav-label">Stock</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar" title="Admin">SR</div>
      </div>
    </aside>
  );
}
