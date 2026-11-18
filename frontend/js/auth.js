document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const statusBox = document.getElementById('auth-status');

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        full_name: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };
      try {
        const result = await apiFetch('/api/auth/signup', {
          method: 'POST',
          headers: setAuthHeader(),
          body: JSON.stringify(payload)
        });
        statusBox.textContent = result.message || 'Signup successful';
        statusBox.className = 'alert success';
        setTimeout(() => {
          window.location.href = '/login';
        }, 600);
      } catch (error) {
        statusBox.textContent = error.message;
        statusBox.className = 'alert';
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
      };
      try {
        const result = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: setAuthHeader(),
          body: JSON.stringify(payload)
        });
        localStorage.setItem('whatif_token', result.token || 'dev-token');
        localStorage.setItem('whatif_user', JSON.stringify(result.user));
        statusBox.textContent = result.message || 'Logged in';
        statusBox.className = 'alert success';
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 400);
      } catch (error) {
        statusBox.textContent = error.message;
        statusBox.className = 'alert';
      }
    });
  }
});
