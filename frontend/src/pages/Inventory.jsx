import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { inventoryApi } from '../api';
import StatusBadge from '../components/StatusBadge';
import MedicineModal from '../components/MedicineModal';
import './Inventory.css';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openModal) {
      setModalOpen(true);
      // Optional: Clear state so it doesn't re-open on refresh if desired
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleSave(data) {
    try {
      if (editingMedicine) {
        await inventoryApi.updateMedicine(editingMedicine.id, data);
      } else {
        await inventoryApi.createMedicine(data);
      }
      setModalOpen(false);
      setEditingMedicine(null);
      fetchData();
    } catch (err) {
      alert(`Error saving medicine: ${err.message}`);
    }
  }

  async function handleStatusUpdate(id, status) {
    try {
      await inventoryApi.updateStatus(id, status);
      fetchData();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  }

  const handleEdit = (med) => {
    setEditingMedicine(med);
    setModalOpen(true);
  };

  return (
    <div className="inventory fade-in">
      <header className="inventory-header">
        <div className="header-left">
          <h1>Pharmacy CRM</h1>
          <p>Manage inventory, sales, and purchase orders</p>
        </div>
        <div className="header-right">
          <button className="btn btn-outline">📥 Export</button>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Medicine</button>
        </div>
      </header>

      <section className="inventory-overview card">
        <h3>Inventory Overview</h3>
        <div className="overview-grid">
          <div className="overview-card">
            <div className="card-top">
              <span className="label">Total Items</span>
              <span className="icon">📦</span>
            </div>
            <div className="value">{summary?.total_medicines || 0}</div>
          </div>
          <div className="overview-card">
            <div className="card-top">
              <span className="label">Active Stock</span>
              <span className="icon">✅</span>
            </div>
            <div className="value">{summary?.active_count || 0}</div>
          </div>
          <div className="overview-card">
            <div className="card-top">
              <span className="label">Low Stock</span>
              <span className="icon">⚠️</span>
            </div>
            <div className="value">{summary?.low_stock_count || 0}</div>
          </div>
          <div className="overview-card">
            <div className="card-top">
              <span className="label">Total Value</span>
              <span className="icon">💰</span>
            </div>
            <div className="value">₹{summary?.total_inventory_value?.toLocaleString() || 0}</div>
          </div>
        </div>
      </section>

      <section className="inventory-list-container fade-in">
        <div className="list-header">
          <h3>Complete Inventory</h3>
          <div className="list-actions">
            <div className="search-box">
              <input
                type="text"
                className="input"
                placeholder="Search medicines..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <select 
              className="input status-filter" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Expired">Expired</option>
            </select>
            <button className="btn btn-outline" onClick={() => {
              setSearchInput('');
              setStatusFilter('');
            }}>🔄 Reset</button>
          </div>
        </div>

        <div className="table-wrapper card">
          <table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Generic Name</th>
                <th>Category</th>
                <th>Batch No</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Cost Price</th>
                <th>MRP</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id}>
                  <td className="med-name">{med.name}</td>
                  <td className="generic-name">{med.name.split(' ')[0]}</td>
                  <td>{med.category}</td>
                  <td className="batch-no">PCM-2024-0892</td>
                  <td>{med.expiry_date}</td>
                  <td className={med.quantity < 10 ? 'text-warning' : ''}>{med.quantity}</td>
                  <td>₹{(med.price * 0.8).toFixed(2)}</td>
                  <td>₹{med.price.toFixed(2)}</td>
                  <td>{med.manufacturer}</td>
                  <td><StatusBadge status={med.status} /></td>
                  <td className="actions-cell">
                    <button className="icon-btn" title="Edit" onClick={() => handleEdit(med)}>✏️</button>
                    <button className="icon-btn" title="Mark Expired" onClick={() => handleStatusUpdate(med.id, 'Expired')}>⌛</button>
                    <button className="icon-btn" title="Out of Stock" onClick={() => handleStatusUpdate(med.id, 'Out of Stock')}>🚫</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
