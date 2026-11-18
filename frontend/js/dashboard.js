document.addEventListener('DOMContentLoaded', async () => {
  const summaryEl = document.getElementById('dashboard-summary');
  const recentDecisionsEl = document.getElementById('recent-decisions');
  const activityEl = document.getElementById('recent-activity');
  try {
    const result = await apiFetch('/api/dashboard/summary', {
      method: 'GET',
      headers: setAuthHeader()
    });
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="summary-card card">
          <div class="label">Decisions</div>
          <div class="value">${result.summary.total_decisions}</div>
        </div>
        <div class="summary-card card">
          <div class="label">Simulations</div>
          <div class="value">${result.summary.total_simulations}</div>
        </div>
        <div class="summary-card card">
          <div class="label">Active projects</div>
          <div class="value">${result.summary.active_projects}</div>
        </div>
        <div class="summary-card card">
          <div class="label">Saved scenarios</div>
          <div class="value">${result.summary.saved_scenarios}</div>
        </div>
      `;
    }
    if (recentDecisionsEl) {
      const items = (result.summary.recent_decisions || []).map((decision) => `
        <div class="list-item">
          <div>
            <strong>${decision.title}</strong><br>
            <span class="muted">${decision.domain || 'small_business'}</span>
          </div>
          <span class="badge">${decision.status || 'draft'}</span>
        </div>
      `).join('');
      recentDecisionsEl.innerHTML = items || '<p class="muted">No decisions yet.</p>';
    }
    if (activityEl) {
      activityEl.innerHTML = '<li>AI model draft created.</li><li>Scenario comparison ran successfully.</li><li>Decision status updated.</li>';
    }
  } catch (error) {
    if (summaryEl) summaryEl.innerHTML = `<div class="alert">${error.message}</div>`;
  }
});
