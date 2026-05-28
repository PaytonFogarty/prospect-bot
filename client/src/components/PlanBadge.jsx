const STYLES = {
  trialing: { background: '#dbeafe', color: '#1d4ed8', label: 'Trial' },
  active: { background: '#dcfce7', color: '#16a34a', label: 'Active' },
  expired: { background: '#fee2e2', color: '#dc2626', label: 'Expired' },
  cancelled: { background: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
  past_due: { background: '#fef3c7', color: '#d97706', label: 'Past Due' },
};

export default function PlanBadge({ status }) {
  const style = STYLES[status] || STYLES.expired;
  return (
    <span style={{
      background: style.background,
      color: style.color,
      padding: '0.25rem 0.75rem',
      borderRadius: 12,
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      {style.label}
    </span>
  );
}
