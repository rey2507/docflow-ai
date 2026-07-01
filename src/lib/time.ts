export function relativeTimeFrom(date?: string | Date | null): { label: string; full: string } {
  if (!date) return { label: '—', full: 'Unknown' };
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return { label: '—', full: 'Invalid date' };
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  const abs = Math.abs(diff);
  let label = '';
  if (abs < 60) label = `${abs}s ago`;
  else if (abs < 3600) label = `${Math.floor(abs / 60)}m ago`;
  else if (abs < 86400) label = `${Math.floor(abs / 3600)}h ago`;
  else label = `${Math.floor(abs / 86400)}d ago`;
  return { label, full: d.toISOString() };
}
