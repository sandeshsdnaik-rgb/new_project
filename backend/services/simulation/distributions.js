function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function uniform(min, max) {
  return min + (max - min) * Math.random();
}

function triangular(min, mode, max) {
  const u = Math.random();
  const c = (mode - min) / (max - min || 1);
  if (u < c) return min + Math.sqrt(u * (max - min) * (mode - min));
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

function normal(meanValue, stdDev) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return meanValue + z * stdDev;
}

function discrete(values) {
  const idx = Math.floor(Math.random() * values.length);
  return values[idx];
}

module.exports = {
  uniform,
  triangular,
  normal,
  discrete,
  clamp
};
