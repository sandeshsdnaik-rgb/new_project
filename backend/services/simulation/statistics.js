function mean(values) {
  if (!values || !values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function median(values) {
  if (!values || !values.length) return 0;
  const sorted = [...values].sort((a, b) => Number(a) - Number(b));
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (Number(sorted[mid - 1]) + Number(sorted[mid])) / 2;
  return Number(sorted[mid]);
}

function standardDeviation(values) {
  if (!values || values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + (Number(value) - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function percentile(values, p) {
  if (!values || !values.length) return 0;
  const sorted = [...values].sort((a, b) => Number(a) - Number(b));
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Number(sorted[index]);
}

module.exports = {
  mean,
  median,
  standardDeviation,
  percentile
};
