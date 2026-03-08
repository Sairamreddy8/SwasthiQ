import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import MedicineModal from '../components/MedicineModal';
import './Inventory.css';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [meds, sum] = await Promise.all([
        inventoryApi.listMedicines({ search, status: statusFilter }),
        inventoryApi.getSummary(),
      ]);
      setMedicines(meds);
      setSummary(sum);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleSave(data) {
    if (editingMedicine) {
      await inventoryApi.updateMedicine(editingMedicine.id, data);
    } else {
      await inventoryApi.createMedicine(data);
    }
    setModalOpen(false);
    setEditingMedicine(null);
    fetchData();
  }

  function openAddModal() {
    setEditingMedicine(null);
    setModalOpen(true);
  }

  function openEditModal(medicine) {
    setEditingMedicine(medicine);
    setModalOpen(true);
  }

  async function handleStatusChange(medicine, newStatus) {
    try {
      await inventoryApi.updateStatus(medicine.id, newStatus);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  const statuses = ['', 'Active', 'Low Stock', 'Expired', 'Out of Stock'];

  return (
    <div className="inventory">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Inventory</h1>
            <p>Manage your medicine inventory and stock levels</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal} id="add-medicine-btn">
            ➕ Add Medicine
          </button>
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────── */}
      {summary && (
        <div className="stats-grid">
          <StatCard
            icon="💊"
            title="Total Medicines"
            value={summary.total_medicines}
            subtitle={`₹${summary.total_inventory_value.toLocaleString()} total value`}
            color="primary"
          />
          <StatCard
            icon="✅"
            title="Active"
            value={summary.active_count}
            color="success"
          />
          <StatCard
            icon="⚠️"
            title="Low Stock"
            value={summary.low_stock_count}
            color="warning"
          />
          <StatCard
            icon="❌"
            title="Expired / Out of Stock"
            value={summary.expired_count + summary.out_of_stock_count}
            subtitle={`${summary.expired_count} expired, ${summary.out_of_stock_count} out of stock`}
            color="danger"
          />
        </div>
      )}

      {/* ── Filters ───────────────────────────────────── */}
      <div className="table-container">
        <div className="table-header">
          <h3>Medicine List</h3>
          <div className="filters-row">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                className="input"
                placeholder="Search medicines..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                id="search-medicines"
              />
            </div>
            <div className="filter-group">
              {statuses.map((s) => (
                <button
                  key={s || 'all'}
                  className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span className="loading-text">Loading inventory…</span>
          </div>
        ) : medicines.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>No medicines found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Expiry</th>
                <th>Manufacturer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id}>
                  <td className="td-medicine">{med.name}</td>
                  <td>
                    <span className="category-tag">{med.category}</span>
                  </td>
                  <td>₹{med.price.toLocaleString()}</td>
                  <td>
                    <span className={med.quantity < 10 ? 'qty-low' : ''}>
                      {med.quantity}
                    </span>
                  </td>
                  <td className="td-time">
                    {new Date(med.expiry_date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td>{med.manufacturer}</td>
                  <td>
                    <StatusBadge status={med.status} />
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(med)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {med.status !== 'Expired' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatusChange(med, 'Expired')}
                          title="Mark Expired"
                        >
                          🚫
                        </button>
                      )}
                      {med.status !== 'Out of Stock' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatusChange(med, 'Out of Stock')}
                          title="Mark Out of Stock"
                        >
                          📭
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────── */}
      {modalOpen && (
        <MedicineModal
          medicine={editingMedicine}
          onClose={() => {
            setModalOpen(false);
            setEditingMedicine(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
