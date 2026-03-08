import { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import './Dashboard.css';

export default function Dashboard() {
  const [salesSummary, setSalesSummary] = useState(null);
  const [itemsSold, setItemsSold] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Loading dashboard data…</span>
      </div>
    );
  }

  if (error) {
    return <div className="error-banner">⚠️ {error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here&rsquo;s your pharmacy overview for today.</p>
      </div>

      {/* ── Stats Cards ─────────────────────────────── */}
      <div className="stats-grid">
        <StatCard
          icon="💰"
          title="Today's Revenue"
          value={`₹${salesSummary?.total_revenue?.toLocaleString() || 0}`}
          subtitle={`${salesSummary?.total_sales_count || 0} sales today`}
          color="primary"
        />
        <StatCard
          icon="📦"
          title="Items Sold Today"
          value={itemsSold?.total_items_today || 0}
          subtitle={`${itemsSold?.total_items_this_week || 0} this week`}
          color="success"
        />
        <StatCard
          icon="⚠️"
          title="Low Stock Alerts"
          value={lowStock?.length || 0}
          subtitle="Items need restocking"
          color="warning"
        />
        <StatCard
          icon="🚚"
          title="Purchase Orders"
          value={purchaseOrders?.pending_orders || 0}
          subtitle={`${purchaseOrders?.total_orders || 0} total orders`}
          color="info"
        />
      </div>

      {/* ── Dashboard Grid ──────────────────────────── */}
      <div className="dashboard-grid">
        {/* Recent Sales */}
        <div className="table-container dashboard-recent-sales">
          <div className="table-header">
            <h3>Recent Sales</h3>
            <span className="table-badge">{recentSales.length} transactions</span>
          </div>
          {recentSales.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🛒</div>
              <p>No sales recorded yet</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Buyer</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="td-medicine">{sale.medicine_name}</td>
                    <td>{sale.buyer_name}</td>
                    <td>{sale.quantity_sold}</td>
                    <td className="td-amount">₹{sale.total_amount.toLocaleString()}</td>
                    <td className="td-time">
                      {sale.sale_date
                        ? new Date(sale.sale_date).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Stock + Purchase Orders */}
        <div className="dashboard-side-panel">
          {/* Low Stock Items */}
          <div className="card">
            <div className="card-header">
              <h3>⚠️ Low Stock</h3>
            </div>
            <div className="card-body">
              {lowStock.length === 0 ? (
                <p className="empty-text">All items well stocked!</p>
              ) : (
                <ul className="low-stock-list">
                  {lowStock.map((med) => (
                    <li key={med.id} className="low-stock-item">
                      <div>
                        <span className="low-stock-name">{med.name}</span>
                        <span className="low-stock-category">{med.category}</span>
                      </div>
                      <span className="low-stock-qty">{med.quantity} left</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Purchase Orders */}
          <div className="card">
            <div className="card-header">
              <h3>🚚 Active Orders</h3>
            </div>
            <div className="card-body">
              {purchaseOrders?.orders?.length === 0 ? (
                <p className="empty-text">No active orders</p>
              ) : (
                <ul className="orders-list">
                  {purchaseOrders?.orders?.slice(0, 5).map((order) => (
                    <li key={order.id} className="order-item">
                      <div>
                        <span className="order-medicine">{order.medicine_name}</span>
                        <span className="order-supplier">{order.supplier}</span>
                      </div>
                      <StatusBadge status={order.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
