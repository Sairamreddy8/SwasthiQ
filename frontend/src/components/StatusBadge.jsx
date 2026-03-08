import './StatusBadge.css';

const STATUS_CONFIG = {
  Active: { className: 'success', label: 'Active' },
  'Low Stock': { className: 'warning', label: 'Low Stock' },
  Expired: { className: 'danger', label: 'Expired' },
  'Out of Stock': { className: 'muted', label: 'Out of Stock' },
  Pending: { className: 'warning', label: 'Pending' },
  Delivered: { className: 'success', label: 'Delivered' },
  Cancelled: { className: 'danger', label: 'Cancelled' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { className: 'muted', label: status };
  return (
    <span className={`status-badge status-badge--${config.className}`}>
      <span className="status-badge__dot" />
      {config.label}
    </span>
  );
}
