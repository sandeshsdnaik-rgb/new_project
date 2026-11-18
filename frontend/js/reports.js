document.addEventListener('DOMContentLoaded', async () => {
  const reportPanel = document.getElementById('report-panel');
  const generateBtn = document.getElementById('generate-report');
  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      try {
        const result = await apiFetch('/api/reports/generate', {
          method: 'POST',
          headers: setAuthHeader(),
          body: JSON.stringify({ decision_id: 'demo_decision', title: 'Coffee Shop Report', summary: 'Risk-adjusted decision estimate for a coffee shop launch.' })
        });
        if (reportPanel) {
          reportPanel.innerHTML = `
            <strong>${result.report.title}</strong>
            <p class="muted">${result.generated.summary}</p>
            <a class="btn primary" href="${result.report.file_url}">Download report</a>
          `;
        }
      } catch (error) {
        if (reportPanel) reportPanel.innerHTML = `<div class="alert">${error.message}</div>`;
      }
    });
  }
});
