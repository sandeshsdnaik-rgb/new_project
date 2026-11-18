async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${window.appConfig.apiBase}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

function readToken() {
  return localStorage.getItem('whatif_token') || 'dev-token';
}

function setAuthHeader(headers = {}) {
  return {
    ...headers,
    Authorization: `Bearer ${readToken()}`
  };
}
