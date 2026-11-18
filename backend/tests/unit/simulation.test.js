const test = require('node:test');
const assert = require('node:assert/strict');
const { runDeterministicModel } = require('../../services/simulation/deterministic');
const { runSensitivityAnalysis } = require('../../services/simulation/sensitivity');
const { runMonteCarloSimulation } = require('../../services/simulation/monteCarlo');
const { evaluateFormula } = require('../../services/simulation/formulaParser');

test('deterministic model computes expected outputs', () => {
  const model = {
    name: 'Coffee shop example',
    variables: [
      { name: 'selling_price', value: 120, minimum_value: 10, maximum_value: 500 },
      { name: 'daily_customers', value: 50, minimum_value: 0, maximum_value: 200 },
      { name: 'monthly_rent', value: 20000, minimum_value: 0, maximum_value: 100000 }
    ],
    formulas: [
      { name: 'monthly_revenue', expression: 'selling_price * daily_customers * 30' },
      { name: 'monthly_profit', expression: 'monthly_revenue - monthly_rent - 150000' }
    ]
  };

  const result = runDeterministicModel(model);
  assert.equal(result.outputs.monthly_revenue, 180000);
  assert.equal(result.outputs.monthly_profit, 10000);
});

test('formula parser rejects division by zero safely', () => {
  assert.throws(() => evaluateFormula('10 / 0'), /Division by zero/);
});

test('sensitivity analysis modifies key variables', () => {
  const model = {
    name: 'Sensitivity check',
    variables: [
      { name: 'sales', value: 100 },
      { name: 'cost', value: 50 }
    ],
    formulas: [
      { name: 'profit', expression: 'sales - cost' }
    ]
  };

  const result = runSensitivityAnalysis(model, { sales: 10 });
  assert.equal(result.baseline.sales, 100);
  assert.ok(Math.abs(result.modified.sales - 110) < 1e-9);
});

test('monte carlo simulation returns expected summary metrics', () => {
  const result = runMonteCarloSimulation({
    variableDefinitions: [{ name: 'sales', value: 100, distribution: 'uniform', distribution_parameters: { min: 90, max: 110 } }],
    formula: { expression: 'sales' },
    runs: 50,
    randomSeed: 42,
    objective: 'revenue'
  });

  assert.equal(result.runs, 50);
  assert.ok(result.mean >= 0);
  assert.ok(result.std_dev >= 0);
});
