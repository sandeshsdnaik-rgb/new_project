document.addEventListener('DOMContentLoaded', async () => {
  const riskResult = document.getElementById('risk-result');
  try {
    const result = await apiFetch('/api/risk/analyze', {
      method: 'POST',
      headers: setAuthHeader(),
      body: JSON.stringify({ riskResults: [{ level: 'High', metric: 'demand volatility' }] })
    });
    if (riskResult) {
      riskResult.innerHTML = `
        <div><strong>Overall risk:</strong> ${result.summary.overall_risk}</div>
        <div><strong>Explanation:</strong> ${result.summary.explanation}</div>
      `;
    }
  } catch (error) {
    if (riskResult) riskResult.innerHTML = `<div class="alert">${error.message}</div>`;
  }
});
