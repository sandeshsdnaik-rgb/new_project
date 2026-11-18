const decisions = [];
const models = [];
const scenarios = [];
const simulations = [];
const reports = [];
const dashboardSummary = {
  total_decisions: 0,
  total_simulations: 0,
  total_users: 1,
  recent_decisions: []
};

function getStore() {
  return {
    decisions,
    models,
    scenarios,
    simulations,
    reports,
    dashboardSummary
  };
}

function createDecision({ userId, title, description, domain }) {
  const decision = {
    id: `decision_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    user_id: userId,
    title: title || 'Untitled decision',
    description: description || '',
    domain: domain || 'small_business',
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  decisions.unshift(decision);
  dashboardSummary.total_decisions = decisions.length;
  dashboardSummary.recent_decisions = decisions.slice(0, 5);
  return decision;
}

function listDecisions(userId) {
  return decisions.filter((decision) => decision.user_id === userId);
}

function getDecisionById(id, userId) {
  return decisions.find((decision) => decision.id === id && decision.user_id === userId);
}

function upsertModel(model) {
  const index = models.findIndex((entry) => entry.id === model.id);
  if (index >= 0) {
    models[index] = { ...models[index], ...model, updated_at: new Date().toISOString() };
    return models[index];
  }
  const newModel = {
    ...model,
    id: model.id || `model_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  models.unshift(newModel);
  return newModel;
}

function listModels(decisionId) {
  return models.filter((model) => model.decision_id === decisionId);
}

function createScenario({ decisionId, name, description, input_overrides }) {
  const scenario = {
    id: `scenario_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    decision_id: decisionId,
    name: name || 'Scenario',
    description: description || '',
    input_overrides: input_overrides || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  scenarios.unshift(scenario);
  return scenario;
}

function listScenarios(decisionId) {
  return scenarios.filter((scenario) => scenario.decision_id === decisionId);
}

function createSimulation({ decisionId, scenarioId, modelVersion, simulationType, simulationConfiguration, randomSeed }) {
  const simulation = {
    id: `simulation_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    decision_id: decisionId,
    scenario_id: scenarioId,
    model_version: modelVersion || 'v1',
    simulation_type: simulationType || 'deterministic',
    simulation_configuration: simulationConfiguration || {},
    random_seed: randomSeed || 42,
    status: 'completed',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  };
  simulations.unshift(simulation);
  dashboardSummary.total_simulations = simulations.length;
  return simulation;
}

function createReport({ decisionId, userId, title, summary }) {
  const report = {
    id: `report_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    decision_id: decisionId,
    user_id: userId,
    title: title || 'Decision Report',
    summary: summary || '',
    file_url: '/api/reports/' + `${Date.now()}`,
    report_type: 'pdf',
    created_at: new Date().toISOString()
  };
  reports.unshift(report);
  return report;
}

module.exports = {
  getStore,
  createDecision,
  listDecisions,
  getDecisionById,
  upsertModel,
  listModels,
  createScenario,
  listScenarios,
  createSimulation,
  createReport,
  dashboardSummary
};
