const { isSupabaseConfigured } = require('./supabase');

function sanitizeJson(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Invalid payload' };
  }
  return { ok: true, value: payload };
}

async function understandDecision({ decisionText }) {
  const cleaned = String(decisionText || '').trim();
  if (!cleaned) {
    throw new Error('Decision text is required.');
  }
  const lower = cleaned.toLowerCase();
  const domain = lower.includes('coffee') || lower.includes('shop') ? 'small_business' : 'general_business';
  const candidate = {
    decision_title: cleaned.slice(0, 80) || 'New decision',
    domain,
    assumptions: [],
    variables: [
      { name: 'initial_investment', value: 500000, unit: 'INR', type: 'currency' },
      { name: 'monthly_revenue', value: 250000, unit: 'INR', type: 'currency' },
      { name: 'monthly_cost', value: 180000, unit: 'INR', type: 'currency' }
    ],
    outputs: ['monthly_profit', 'break_even_months', 'risk_level'],
    clarifying_questions: []
  };

  if (lower.includes('rent') || lower.includes('location')) {
    candidate.variables.push({ name: 'monthly_rent', value: 20000, unit: 'INR', type: 'currency' });
  }

  if (lower.includes('customer') || lower.includes('demand')) {
    candidate.variables.push({ name: 'daily_customers', value: 60, unit: 'customers', type: 'quantity' });
  }

  if (lower.includes('price')) {
    candidate.variables.push({ name: 'selling_price', value: 120, unit: 'INR', type: 'currency' });
  }

  const sanitized = sanitizeJson(candidate);
  if (!sanitized.ok) {
    throw new Error(sanitized.error);
  }
  return sanitized.value;
}

async function extractVariables({ decisionText }) {
  const model = await understandDecision({ decisionText });
  return { decision: model.decision_title, variables: model.variables };
}

async function explainResults({ resultSummary, scenarioName, objective }) {
  const target = String(objective || 'profitability');
  const summary = resultSummary || {};
  const baseline = Number(summary.baseline ?? 0);
  const expected = Number(summary.expected ?? 0);
  const risk = Number(summary.risk ?? 0);

  return {
    insight: `Under the current assumptions, the ${scenarioName || 'current'} scenario is expected to produce ${expected.toFixed(2)} for ${target}. The outcome is ${risk > 0.5 ? 'riskier than baseline' : 'moderately stable'} compared with the baseline value of ${baseline.toFixed(2)}.`,
    assumptions: ['Costs, pricing, and demand are modeled as fixed assumptions.', 'Scenario results are estimates based on the current model.'],
    follow_up_questions: [
      'What is the most acceptable downside for this decision?',
      'Which variable should be modeled more conservatively?'
    ]
  };
}

async function compareScenarios({ scenarios }) {
  return {
    winner: scenarios && scenarios.length ? scenarios[0].name : 'baseline',
    summary: 'The baseline scenario remains strongest when risk-adjusted profit is considered.',
    insights: ['Sensitivity is most impacted by demand variance.', 'Large fixed costs increase downside risk.']
  };
}

async function summarizeRisks({ riskResults }) {
  const highest = riskResults && riskResults.length ? riskResults[0] : { level: 'Moderate', metric: 'profitability' };
  return {
    overall_risk: highest.level || 'Moderate',
    explanation: `The highest risk area is ${highest.metric || 'profitability'} because the current assumptions create material downside exposure.`,
    mitigations: ['Reduce fixed-cost exposure.', 'Run a more conservative demand scenario.']
  };
}

async function generateDecisionReport({ title, scenarioComparison }) {
  return {
    title: title || 'Decision report',
    sections: ['Overview', 'Assumptions', 'Scenario comparison', 'Risk summary'],
    summary: scenarioComparison || 'This report summarizes the modeled decision outcomes.',
    confidence: 'Model-based estimate'
  };
}

module.exports = {
  understandDecision,
  extractVariables,
  explainResults,
  compareScenarios,
  summarizeRisks,
  generateDecisionReport,
  isSupabaseConfigured
};
