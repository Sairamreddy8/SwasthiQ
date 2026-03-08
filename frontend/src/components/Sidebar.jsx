import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">💊</div>
        <div>
          <h1 className="brand-name">SwasthiQ</h1>
          <span className="brand-tagline">Pharmacy Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-label">Main Menu</span>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">💉</span>
            <span>Inventory</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">SR</div>
          <div>
            <div className="user-name">Admin</div>
            <div className="user-role">Pharmacist</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
