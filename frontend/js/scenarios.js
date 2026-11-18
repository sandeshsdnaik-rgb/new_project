document.addEventListener('DOMContentLoaded', async () => {
  const scenarioList = document.getElementById('scenario-list');
  try {
    const result = await apiFetch('/api/scenarios/demo_decision', {
      method: 'GET',
      headers: setAuthHeader()
    });
    if (scenarioList) {
      scenarioList.innerHTML = (result.scenarios || []).map((scenario) => `
        <div class="scenario-row">
          <div>
            <strong>${scenario.name}</strong><br>
            <span class="muted">${scenario.description || 'Scenario description'}</span>
          </div>
          <span class="badge">${scenario.input_overrides ? Object.keys(scenario.input_overrides).length : 0} vars</span>
        </div>
      `).join('') || '<div class="muted">No scenarios yet.</div>';
    }
  } catch (error) {
    if (scenarioList) scenarioList.innerHTML = `<div class="alert">${error.message}</div>`;
  }
});
