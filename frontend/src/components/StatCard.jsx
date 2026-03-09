import './StatCard.css';

export default function StatCard({ icon, title, value, subtitle, badge, color = 'primary' }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__header">
        <div className={`stat-card__icon stat-card__icon--${color}`}>
          <span>{icon}</span>
        </div>
        {badge && (
          <div className={`stat-card__badge stat-card__badge--${color}`}>
            {badge}
          </div>
        )}
      </div>
      <div className="stat-card__content">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__title">{title}</div>
        {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}
