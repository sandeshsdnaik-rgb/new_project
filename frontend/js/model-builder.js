document.addEventListener('DOMContentLoaded', async () => {
  const modelForm = document.getElementById('model-form');
  const preview = document.getElementById('model-preview');

  if (modelForm) {
    modelForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        decision_id: 'demo_decision',
        version: 'v1',
        model_definition: {
          variables: [
            { name: 'selling_price', value: Number(document.getElementById('selling-price').value || 120), unit: 'INR' },
            { name: 'daily_customers', value: Number(document.getElementById('daily-customers').value || 50), unit: 'customers' },
            { name: 'monthly_rent', value: Number(document.getElementById('monthly-rent').value || 20000), unit: 'INR' }
          ],
          formulas: [
            { name: 'monthly_revenue', expression: 'selling_price * daily_customers * 30' },
            { name: 'monthly_profit', expression: 'monthly_revenue - monthly_rent - 150000' }
          ]
        },
        assumptions: ['Demand assumptions are estimate-based.', 'Rental cost remains constant.']
      };
      try {
        const result = await apiFetch('/api/models', {
          method: 'POST',
          headers: setAuthHeader(),
          body: JSON.stringify(payload)
        });
        if (preview) {
          preview.innerHTML = `
            <div class="preview-row"><span>Model ID</span><strong>${result.model.id}</strong></div>
            <div class="preview-row"><span>Version</span><strong>${result.model.version}</strong></div>
            <div class="preview-row"><span>Assumptions</span><strong>${payload.assumptions.length}</strong></div>
          `;
        }
      } catch (error) {
        if (preview) preview.innerHTML = `<div class="alert">${error.message}</div>`;
      }
    });
  }
});
