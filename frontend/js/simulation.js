document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('simulation-form');
  const resultBox = document.getElementById('simulation-result');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const model = {
        name: 'Coffee shop model',
        decision_id: 'demo_decision',
        version: 'v1',
        variables: [
          { name: 'selling_price', value: 120, unit: 'INR', minimum_value: 50, maximum_value: 250 },
          { name: 'daily_customers', value: 50, unit: 'customers', minimum_value: 10, maximum_value: 200 },
          { name: 'monthly_rent', value: 20000, unit: 'INR', minimum_value: 5000, maximum_value: 80000 }
        ],
        formulas: [
          { name: 'monthly_revenue', expression: 'selling_price * daily_customers * 30' },
          { name: 'monthly_profit', expression: 'monthly_revenue - monthly_rent - 150000' }
        ]
      };
      const payload = {
        model,
        simulation_type: 'deterministic',
        config: { runs: 1000, random_seed: 42 }
      };
      try {
        const result = await apiFetch('/api/simulations/run', {
          method: 'POST',
          headers: setAuthHeader(),
          body: JSON.stringify(payload)
        });
        if (resultBox) {
          resultBox.innerHTML = `
            <div><strong>Monthly revenue:</strong> ${result.result.outputs.monthly_revenue}</div>
            <div><strong>Monthly profit:</strong> ${result.result.outputs.monthly_profit}</div>
            <div><strong>Status:</strong> ${result.result.summary.status}</div>
          `;
        }
      } catch (error) {
        if (resultBox) resultBox.innerHTML = `<div class="alert">${error.message}</div>`;
      }
    });
  }
});
