import './StatusBadge.css';

export default function StatusBadge({ status }) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <span className={`status-badge status--${normalizedStatus}`}>
      {status}
    </span>
  );
}
