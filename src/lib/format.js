const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

export function timeAgo(date, now = Date.now()) {
  if (!date) return '';
  const diff = (new Date(date).getTime() - now) / 1000;
  for (const [unit, sec] of UNITS) {
    if (Math.abs(diff) >= sec) return rtf.format(Math.round(diff / sec), unit);
  }
  return 'vừa xong';
}

const compact = new Intl.NumberFormat('vi', { notation: 'compact', maximumFractionDigits: 1 });
export function formatNumber(n) {
  if (n === undefined || n === null) return '—';
  return compact.format(n);
}

export function formatRating(r) {
  if (!r && r !== 0) return '—';
  return Number(r).toFixed(2);
}
