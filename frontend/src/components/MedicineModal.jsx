import { useState, useEffect } from 'react';
import './MedicineModal.css';

export default function MedicineModal({ medicine, onClose, onSave }) {
  const isEditing = !!medicine;

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    expiry_date: '',
    manufacturer: '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (medicine) {
      setForm({
        name: medicine.name || '',
        category: medicine.category || '',
        price: String(medicine.price || ''),
        quantity: String(medicine.quantity || ''),
        expiry_date: medicine.expiry_date || '',
        manufacturer: medicine.manufacturer || '',
      });
    }
  }, [medicine]);

  const categories = [
    'Pain Relief', 'Antibiotic', 'Allergy', 'Diabetes',
    'Gastric', 'Cardiac', 'Respiratory', 'Supplement',
  ];

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Valid price required';
    if (form.quantity === '' || Number(form.quantity) < 0) errs.quantity = 'Valid quantity required';
    if (!form.expiry_date) errs.expiry_date = 'Expiry date is required';
    if (!form.manufacturer.trim()) errs.manufacturer = 'Manufacturer is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        expiry_date: form.expiry_date,
        manufacturer: form.manufacturer.trim(),
      });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Medicine' : 'Add New Medicine'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div className="error-banner">⚠️ {errors.submit}</div>
            )}

            <div className="form-group">
              <label htmlFor="med-name">Medicine Name</label>
              <input
                id="med-name"
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Paracetamol 500mg"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="med-category">Category</label>
                <select
                  id="med-category"
                  className={`select ${errors.category ? 'input-error' : ''}`}
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  <option value="">Select category...</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <span className="field-error">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="med-manufacturer">Manufacturer</label>
                <input
                  id="med-manufacturer"
                  className={`input ${errors.manufacturer ? 'input-error' : ''}`}
                  placeholder="e.g. Sun Pharma"
                  value={form.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                />
                {errors.manufacturer && <span className="field-error">{errors.manufacturer}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="med-price">Price (₹)</label>
                <input
                  id="med-price"
                  type="number"
                  step="0.01"
                  className={`input ${errors.price ? 'input-error' : ''}`}
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                />
                {errors.price && <span className="field-error">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="med-quantity">Quantity</label>
                <input
                  id="med-quantity"
                  type="number"
                  className={`input ${errors.quantity ? 'input-error' : ''}`}
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                />
                {errors.quantity && <span className="field-error">{errors.quantity}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="med-expiry">Expiry Date</label>
              <input
                id="med-expiry"
                type="date"
                className={`input ${errors.expiry_date ? 'input-error' : ''}`}
                value={form.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
              />
              {errors.expiry_date && <span className="field-error">{errors.expiry_date}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
