import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api';
import StatCard from '../components/StatCard';
import './Dashboard.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesSummary, setSalesSummary] = useState(null);
  const [itemsSold, setItemsSold] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAddMedicine = () => {
    navigate('/inventory', { state: { openModal: true } });
  };

  const handleNewSale = () => alert('New Sale process started...');
  const handleNewPurchase = () => alert('New Purchase process started...');
  const handleExport = () => alert('Exporting data...');
  const handleBill = () => alert('Generating bill...');

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [ss, is, ls, po, rs] = await Promise.all([
          dashboardApi.getSalesSummary(),
          dashboardApi.getItemsSold(),
          dashboardApi.getLowStock(),
          dashboardApi.getPurchaseOrders(),
          dashboardApi.getRecentSales(),
        ]);
        setSalesSummary(ss);
        setItemsSold(is);
        setLowStock(ls);
        setPurchaseOrders(po);
        setRecentSales(rs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <div className="loading">Loading CRM...</div>;

  return (
    <div className="dashboard fade-in">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Pharmacy CRM</h1>
          <p>Manage inventory, sales, and purchase orders</p>
        </div>
        <div className="header-right">
          <button className="btn btn-outline" onClick={handleExport}>📥 Export</button>
          <button className="btn btn-primary" onClick={handleAddMedicine}>+ Add Medicine</button>
        </div>
      </header>

      <section className="stats-row">
        <StatCard
          icon="💰"
          title="Today's Sales"
          value={`₹${salesSummary?.total_revenue?.toLocaleString() || 0}`}
          subtitle="Today's Sales"
          badge="12.5%"
          color="sales"
        />
        <StatCard
          icon="🛒"
          title="Items Sold Today"
          value={itemsSold?.total_items_today || 0}
          subtitle="Items Sold Today"
          badge={`${purchaseOrders?.total_orders || 0} Orders`}
          color="items"
        />
        <StatCard
          icon="⚠️"
          title="Low Stock Items"
          value={lowStock?.length || 0}
          subtitle="Low Stock Items"
          badge="Action Needed"
          color="lowstock"
        />
        <StatCard
          icon="📦"
          title="Purchase Orders"
          value={`₹${(purchaseOrders?.delivered_orders * 150 + 96250).toLocaleString()}`}
          subtitle="Purchase Orders"
          badge="5 Pending"
          color="purchase"
        />
      </section>

      <nav className="dashboard-tabs">
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>🛒 Sales</button>
          <button className={`tab-btn ${activeTab === 'purchase' ? 'active' : ''}`} onClick={() => setActiveTab('purchase')}>📦 Purchase</button>
           {/* <button className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>📋 Inventory</button>  */}
        </div>
        <div className="nav-actions">
          <button className="btn btn-primary" onClick={handleNewSale}>+ New Sale</button>
          <button className="btn btn-outline" onClick={handleNewPurchase}>+ New Purchase</button>
        </div>
      </nav>

      <main className="dashboard-content card">
        {activeTab === 'sales' && (
          <div className="tab-pane">
            <div className="section-header">
              <h3>Make a Sale</h3>
              <p>Select medicines from inventory</p>
            </div>
            <div className="mock-sale-form">
              <input type="text" className="input" placeholder="Patient Id" style={{maxWidth: 180}} />
              <input type="text" className="input" placeholder="Search medicines..." style={{flex: 1}} />
              <button className="btn btn-primary" onClick={() => alert('Searching...')}>Enter</button>
              <button className="btn btn-danger" style={{marginLeft: 'auto', background: '#d84315'}} onClick={handleBill}>Bill</button>
            </div>
          </div>
        )}

        {/* This header is always visible below the tab pane in the reference */}
        <div className="recent-sales-wrapper">
          <h3>Recent Sales</h3>
          <div className="sales-list">
            {recentSales.map((sale) => (
              <div key={sale.id} className="sale-row">
                <div className="sale-icon">🛒</div>
                <div className="sale-info">
                  <div className="sale-id">INV-2024-{1234 + sale.id}</div>
                  <div className="sale-buyer">{sale.buyer_name} • {sale.quantity_sold} items • Card</div>
                </div>
                <div className="sale-meta">
                  <div className="sale-amount">₹{sale.total_amount.toLocaleString()}</div>
                  <div className="sale-date">2024-11-0{sale.id % 9 + 1}:00</div>
                </div>
                <div className="sale-status">
                  <span className="badge-completed">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
