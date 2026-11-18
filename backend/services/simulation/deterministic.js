const { evaluateFormula } = require('./formulaParser');

function validateInput(variable) {
  const value = Number(variable.value);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric value for ${variable.name}: ${variable.value}`);
  }
  if (variable.minimum_value !== undefined && value < Number(variable.minimum_value)) {
    throw new Error(`${variable.name} is below its minimum.`);
  }
  if (variable.maximum_value !== undefined && value > Number(variable.maximum_value)) {
    throw new Error(`${variable.name} exceeds its maximum.`);
  }
  return value;
}

function runDeterministicModel(model) {
  if (!model || !Array.isArray(model.variables)) {
    throw new Error('Model variables are required.');
  }

  const variablesMap = {};
  for (const variable of model.variables) {
    variablesMap[variable.name] = validateInput(variable);
  }

  const outputs = {};
  for (const formula of model.formulas || []) {
    const { name, expression } = formula;
    outputs[name] = evaluateFormula(expression, { ...variablesMap, ...outputs });
    variablesMap[name] = outputs[name];
  }

  return {
    model_name: model.name || 'deterministic-model',
    variables: variablesMap,
    outputs,
    summary: {
      total_outputs: Object.keys(outputs).length,
      status: 'completed'
    }
  };
}

module.exports = {
  runDeterministicModel,
  validateInput
};
