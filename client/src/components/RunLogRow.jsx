export default function RunLogRow({ run }) {
  const statusColor = run.status === 'success' ? '#16a34a' : run.status === 'error' ? '#dc2626' : '#d97706';

  return (
    <tr>
      <td>{new Date(run.started_at).toLocaleString()}</td>
      <td>{run.prospects_searched}</td>
      <td>{run.prospects_filtered}</td>
      <td>{run.prospects_skipped_dedup}</td>
      <td>{run.prospects_enriched}</td>
      <td>{run.prospects_pushed}</td>
      <td>
        <span style={{ color: statusColor, fontWeight: 600, textTransform: 'capitalize' }}>
          {run.status}
        </span>
      </td>
    </tr>
  );
}
