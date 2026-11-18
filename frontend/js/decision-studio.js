document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('decision-form');
  const outputBox = document.getElementById('ai-output');
  const variableList = document.getElementById('variable-list');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const decisionText = document.getElementById('decision-input').value;
      try {
        const model = await apiFetch('/api/ai/understand-decision', {
          method: 'POST',
          headers: setAuthHeader(),
          body: JSON.stringify({ decisionText })
        });
        if (outputBox) {
          outputBox.textContent = JSON.stringify(model.model, null, 2);
        }
        if (variableList) {
          const rows = (model.model.variables || []).map((variable) => `
            <div class="variable-item">
              <strong>${variable.name}</strong>
              <div class="muted">${variable.unit || 'unit'} • ${variable.type || 'currency'}</div>
              <div>Value: ${variable.value}</div>
            </div>
          `).join('');
          variableList.innerHTML = rows || '<div class="muted">No variables extracted.</div>';
        }
      } catch (error) {
        if (outputBox) outputBox.textContent = error.message;
      }
    });
  }
});
