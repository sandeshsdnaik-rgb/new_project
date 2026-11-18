const { runDeterministicModel } = require('./deterministic');
const { runSensitivityAnalysis } = require('./sensitivity');
const { runMonteCarloSimulation } = require('./monteCarlo');

function runSimulation({ model, simulationType = 'deterministic', changeMap = {}, config = {} }) {
  if (simulationType === 'sensitivity') {
    return runSensitivityAnalysis(model, changeMap);
  }

  if (simulationType === 'monte_carlo') {
    return runMonteCarloSimulation({
      variableDefinitions: model.variables,
      formula: { expression: config.formula || model.formulas?.[0]?.expression || '0' },
      runs: Number(config.runs || 1000),
      randomSeed: Number(config.random_seed || 42),
      objective: config.objective || 'profit'
    });
  }

  return runDeterministicModel(model);
}

module.exports = {
  runSimulation
};
