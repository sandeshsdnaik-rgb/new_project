const { normal, uniform, triangular, discrete } = require('./distributions');
const { mean, median, standardDeviation, percentile } = require('./statistics');

function runMonteCarloSimulation({ variableDefinitions = [], formula, runs = 1000, randomSeed = 42, objective = 'profit' }) {
  const randomFactory = createSeededRandom(randomSeed);
  const samples = [];

  for (let i = 0; i < Number(runs); i += 1) {
    const sampleValues = {};
    for (const variable of variableDefinitions) {
      const distribution = variable.distribution || 'uniform';
      const params = variable.distribution_parameters || {};
      let value = Number(variable.value);
      if (distribution === 'uniform') {
        value = uniform(Number(params.min ?? variable.minimum_value ?? value * 0.9), Number(params.max ?? variable.maximum_value ?? value * 1.1));
      } else if (distribution === 'normal') {
        value = normal(Number(params.mean ?? variable.value), Number(params.stddev ?? 0.1 * Number(variable.value || 1)));
      } else if (distribution === 'triangular') {
        value = triangular(Number(params.min ?? variable.minimum_value ?? value * 0.9), Number(params.mode ?? variable.value), Number(params.max ?? variable.maximum_value ?? value * 1.1));
      } else if (distribution === 'discrete') {
        value = discrete(Array.isArray(params.values) ? params.values.map(Number) : [variable.value]);
      }
      sampleValues[variable.name] = value;
    }

    const output = evaluateFormulaValue(formula, sampleValues);
    samples.push(output);
  }

  return {
    runs: Number(runs),
    random_seed: Number(randomSeed),
    objective,
    mean: mean(samples),
    median: median(samples),
    std_dev: standardDeviation(samples),
    min: Math.min(...samples),
    max: Math.max(...samples),
    p10: percentile(samples, 10),
    p25: percentile(samples, 25),
    p75: percentile(samples, 75),
    p90: percentile(samples, 90),
    probability_negative: samples.filter((value) => value < 0).length / samples.length,
    samples
  };
}

function evaluateFormulaValue(formula, variables) {
  if (!formula || !formula.expression) {
    return 0;
  }
  const regex = /\b([A-Za-z_][A-Za-z0-9_]*)\b/g;
  let sanitized = formula.expression.replace(regex, (match, variableName) => {
    if (Object.prototype.hasOwnProperty.call(variables, variableName)) {
      return String(variables[variableName]);
    }
    return match;
  });
  sanitized = sanitized.replace(/\s+/g, '');
  const allowed = /^[0-9+\-*/().,%\sA-Za-z_]+$/;
  if (!allowed.test(sanitized)) {
    throw new Error('Formula contains unsupported characters.');
  }
  // Safe manual evaluation with a simple parser is preferred. The backend parser enforces safety.
  const { evaluateFormula } = require('./formulaParser');
  return evaluateFormula(sanitized, variables);
}

function createSeededRandom(seed) {
  let value = Number(seed) || 42;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

module.exports = {
  runMonteCarloSimulation,
  evaluateFormulaValue,
  createSeededRandom
};
