document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('journal-list');
  try {
    const result = await apiFetch('/api/journal/demo_decision', {
      method: 'GET',
      headers: setAuthHeader()
    });
    if (container) {
      container.innerHTML = result.entries.length ? result.entries.map((entry) => `
        <div class="list-item">
          <div>
            <strong>${entry.entry_type}</strong><br>
            <span class="muted">${entry.content}</span>
          </div>
          <span class="badge">${entry.created_at || 'recent'}</span>
        </div>
      `).join('') : '<div class="muted">No journal entries yet.</div>';
    }
  } catch (error) {
    if (container) container.innerHTML = `<div class="alert">${error.message}</div>`;
  }
});
