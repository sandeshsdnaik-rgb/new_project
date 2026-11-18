const { evaluateFormula } = require('./formulaParser');

function runSensitivityAnalysis(model, changeMap = {}) {
  if (!model || !Array.isArray(model.variables)) {
    throw new Error('Model variables are required.');
  }

  const baseline = {};
  for (const variable of model.variables) {
    baseline[variable.name] = Number(variable.value);
  }

  const modified = { ...baseline };
  for (const [key, percent] of Object.entries(changeMap)) {
    if (Object.prototype.hasOwnProperty.call(modified, key)) {
      modified[key] = baseline[key] * (1 + Number(percent) / 100);
    }
  }

  const outputs = {};
  for (const formula of model.formulas || []) {
    outputs[formula.name] = evaluateFormula(formula.expression, { ...baseline });
    outputs[`${formula.name}_sensitivity`] = evaluateFormula(formula.expression, { ...modified });
  }

  const comparison = Object.entries(outputs).filter(([key]) => key.includes('_sensitivity'));
  return {
    baseline,
    modified,
    outputs,
    comparison,
    summary: {
      variables_changed: Object.keys(changeMap),
      status: 'completed'
    }
  };
}

module.exports = {
  runSensitivityAnalysis
};
