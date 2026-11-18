const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const { requireAuth } = require('./middleware/auth');
const { understandDecision, extractVariables, explainResults, compareScenarios, summarizeRisks, generateDecisionReport } = require('./config/aiProvider');
const { runSimulation } = require('./services/simulation/simulationEngine');
const store = require('./services/dataStore');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const PORT = Number(process.env.PORT || 3001);

app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests; please slow down.' }
});
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'WHATIF backend',
    mode: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/profile', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    profile: {
      id: req.user.id,
      full_name: req.user.name,
      email: req.user.email,
      created_at: new Date().toISOString()
    }
  });
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, full_name } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  return res.status(201).json({
    success: true,
    user: {
      id: `user_${Date.now()}`,
      email,
      full_name: full_name || 'New user'
    },
    message: 'Signup successful. Configure Supabase auth to persist users.'
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  return res.json({
    success: true,
    user: {
      id: 'dev-user-1',
      email,
      full_name: 'Demo User'
    },
    token: 'dev-token',
    message: 'Login successful in development mode.'
  });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/profile', requireAuth, (req, res) => {
  res.json({
    success: true,
    profile: {
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.name
    }
  });
});

app.post('/api/decisions', requireAuth, (req, res) => {
  const { title, description, domain } = req.body || {};
  if (!title) {
    return res.status(400).json({ success: false, message: 'Decision title is required.' });
  }
  const decision = store.createDecision({ userId: req.user.id, title, description, domain });
  res.status(201).json({ success: true, decision });
});

app.get('/api/decisions', requireAuth, (req, res) => {
  const decisions = store.listDecisions(req.user.id);
  res.json({ success: true, decisions });
});

app.get('/api/decisions/:id', requireAuth, (req, res) => {
  const decision = store.getDecisionById(req.params.id, req.user.id);
  if (!decision) {
    return res.status(404).json({ success: false, message: 'Decision not found.' });
  }
  return res.json({ success: true, decision });
});

app.patch('/api/decisions/:id', requireAuth, (req, res) => {
  const decision = store.getDecisionById(req.params.id, req.user.id);
  if (!decision) {
    return res.status(404).json({ success: false, message: 'Decision not found.' });
  }
  Object.assign(decision, { ...req.body, updated_at: new Date().toISOString() });
  res.json({ success: true, decision });
});

app.delete('/api/decisions/:id', requireAuth, (req, res) => {
  const decisionIndex = store.getStore().decisions.findIndex((decision) => decision.id === req.params.id && decision.user_id === req.user.id);
  if (decisionIndex < 0) {
    return res.status(404).json({ success: false, message: 'Decision not found.' });
  }
  store.getStore().decisions.splice(decisionIndex, 1);
  res.json({ success: true, message: 'Decision deleted.' });
});

app.post('/api/ai/understand-decision', requireAuth, async (req, res) => {
  try {
    const model = await understandDecision({ decisionText: req.body?.decisionText || '' });
    res.json({ success: true, model });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/ai/extract-variables', requireAuth, async (req, res) => {
  try {
    const result = await extractVariables({ decisionText: req.body?.decisionText || '' });
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/ai/explain-results', requireAuth, async (req, res) => {
  try {
    const result = await explainResults(req.body || {});
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/models', requireAuth, (req, res) => {
  const { decision_id, version, model_definition, assumptions, engine_version } = req.body || {};
  if (!decision_id) {
    return res.status(400).json({ success: false, message: 'decision_id is required.' });
  }
  const model = store.upsertModel({
    id: req.body.id || `model_${Date.now()}`,
    decision_id,
    version: version || 'v1',
    model_definition: model_definition || { variables: [], formulas: [] },
    assumptions: assumptions || [],
    engine_version: engine_version || '1.0.0',
    user_id: req.user.id
  });
  res.status(201).json({ success: true, model });
});

app.get('/api/models/:decisionId', requireAuth, (req, res) => {
  const models = store.listModels(req.params.decisionId);
  res.json({ success: true, models });
});

app.patch('/api/models/:id', requireAuth, (req, res) => {
  const model = store.getStore().models.find((entry) => entry.id === req.params.id);
  if (!model) {
    return res.status(404).json({ success: false, message: 'Model not found.' });
  }
  Object.assign(model, req.body, { updated_at: new Date().toISOString() });
  res.json({ success: true, model });
});

app.post('/api/models/:id/validate', requireAuth, (req, res) => {
  const model = store.getStore().models.find((entry) => entry.id === req.params.id);
  if (!model) {
    return res.status(404).json({ success: false, message: 'Model not found.' });
  }
  res.json({ success: true, valid: true, model });
});

app.post('/api/scenarios', requireAuth, (req, res) => {
  const { decision_id, name, description, input_overrides } = req.body || {};
  if (!decision_id) {
    return res.status(400).json({ success: false, message: 'decision_id is required.' });
  }
  const scenario = store.createScenario({ decisionId: decision_id, name, description, input_overrides });
  res.status(201).json({ success: true, scenario });
});

app.get('/api/scenarios/:decisionId', requireAuth, (req, res) => {
  res.json({ success: true, scenarios: store.listScenarios(req.params.decisionId) });
});

app.patch('/api/scenarios/:id', requireAuth, (req, res) => {
  const scenario = store.getStore().scenarios.find((entry) => entry.id === req.params.id);
  if (!scenario) {
    return res.status(404).json({ success: false, message: 'Scenario not found.' });
  }
  Object.assign(scenario, req.body, { updated_at: new Date().toISOString() });
  res.json({ success: true, scenario });
});

app.delete('/api/scenarios/:id', requireAuth, (req, res) => {
  const index = store.getStore().scenarios.findIndex((entry) => entry.id === req.params.id);
  if (index < 0) {
    return res.status(404).json({ success: false, message: 'Scenario not found.' });
  }
  store.getStore().scenarios.splice(index, 1);
  res.json({ success: true, message: 'Scenario deleted.' });
});

app.post('/api/simulations/run', requireAuth, (req, res) => {
  const { model, simulation_type = 'deterministic', changeMap = {}, config = {} } = req.body || {};
  if (!model) {
    return res.status(400).json({ success: false, message: 'Model data is required.' });
  }
  try {
    const result = runSimulation({ model, simulationType: simulation_type, changeMap, config });
    const simulation = store.createSimulation({
      decisionId: model.decision_id || 'demo_decision',
      scenarioId: 'scenario_demo',
      modelVersion: model.version || 'v1',
      simulationType: simulation_type,
      simulationConfiguration: config,
      randomSeed: config.random_seed || 42
    });
    res.json({ success: true, simulation, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/api/simulations/:id', requireAuth, (req, res) => {
  const simulation = store.getStore().simulations.find((entry) => entry.id === req.params.id);
  if (!simulation) {
    return res.status(404).json({ success: false, message: 'Simulation not found.' });
  }
  res.json({ success: true, simulation });
});

app.get('/api/simulations/:id/results', requireAuth, (req, res) => {
  const simulation = store.getStore().simulations.find((entry) => entry.id === req.params.id);
  if (!simulation) {
    return res.status(404).json({ success: false, message: 'Simulation results not found.' });
  }
  res.json({ success: true, result: { simulation_id: simulation.id, summary: simulation.simulation_configuration || {} } });
});

app.post('/api/simulations/sensitivity', requireAuth, (req, res) => {
  const { model, changeMap } = req.body || {};
  try {
    const result = runSimulation({ model, simulationType: 'sensitivity', changeMap });
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/simulations/monte-carlo', requireAuth, (req, res) => {
  const { model, config = {} } = req.body || {};
  try {
    const result = runSimulation({ model, simulationType: 'monte_carlo', config });
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/comparisons', requireAuth, async (req, res) => {
  const { scenarios = [] } = req.body || {};
  const comparison = await compareScenarios({ scenarios });
  res.json({ success: true, comparison });
});

app.post('/api/risk/analyze', requireAuth, async (req, res) => {
  const { riskResults = [] } = req.body || {};
  try {
    const summary = await summarizeRisks({ riskResults });
    res.json({ success: true, summary });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/journal', requireAuth, (req, res) => {
  const { decision_id, entry_type, content, actual_outcomes } = req.body || {};
  res.status(201).json({ success: true, entry: { id: 'journal_1', decision_id, user_id: req.user.id, entry_type, content, actual_outcomes } });
});

app.get('/api/journal/:decisionId', requireAuth, (req, res) => {
  res.json({ success: true, entries: [] });
});

app.post('/api/reports/generate', requireAuth, async (req, res) => {
  const { decision_id, title, summary } = req.body || {};
  try {
    const report = store.createReport({ decisionId: decision_id, userId: req.user.id, title, summary });
    const generated = await generateDecisionReport({ title, scenarioComparison: summary || 'Decision report generated.' });
    res.status(201).json({ success: true, report, generated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/api/reports/:id', requireAuth, (req, res) => {
  const report = store.getStore().reports.find((entry) => entry.id === req.params.id && entry.user_id === req.user.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found.' });
  }
  res.json({ success: true, report });
});

app.get('/api/dashboard/summary', requireAuth, (req, res) => {
  const decisions = store.listDecisions(req.user.id);
  const summary = {
    user: req.user,
    total_decisions: decisions.length,
    total_simulations: store.getStore().simulations.length,
    recent_decisions: decisions.slice(0, 5),
    active_projects: decisions.filter((decision) => decision.status !== 'archived').length,
    saved_scenarios: store.getStore().scenarios.filter((scenario) => scenario.decision_id && decisions.some((d) => d.id === scenario.decision_id)).length
  };
  res.json({ success: true, summary });
});

app.use(express.static(FRONTEND_DIR));
app.get('/login', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'signup.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'dashboard.html')));
app.get('/decision-studio', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'decision-studio.html')));
app.get('/model-builder', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'model-builder.html')));
app.get('/simulation-lab', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'simulation-lab.html')));
app.get('/scenario-explorer', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'scenario-explorer.html')));
app.get('/risk-analyzer', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'risk-analyzer.html')));
app.get('/decision-journal', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'decision-journal.html')));
app.get('/reports', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'reports.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'settings.html')));
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found.' });
  }
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WHATIF backend listening on http://localhost:${PORT}`);
  console.log('Development mode: local auth and in-memory persistence enabled when Supabase is not configured.');
});
