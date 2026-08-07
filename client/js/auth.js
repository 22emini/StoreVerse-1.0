/**
 * StoreVerse Auth Logic
 * Handles login, register, OTP, and password flows on auth pages.
 */
const Auth = {
  /** Login form handler */
  initLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const email = form.querySelector('#email').value.trim();
      const password = form.querySelector('#password').value;
      const msgEl = document.getElementById('auth-msg');

      if (!email || !password) {
        this.showMsg(msgEl, 'Please fill in all fields', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Signing in...';

      try {
        await api.post('/user/login', { email, password });
        // Save email for OTP page
        sessionStorage.setItem('sv_pending_email', email);
        this.showMsg(msgEl, 'OTP sent to your email!', 'success');
        setTimeout(() => window.location.href = 'verify-otp.html', 800);
      } catch (err) {
        this.showMsg(msgEl, err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Sign in';
      }
    });
  },

  /** Register form handler */
  initRegister() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const email = form.querySelector('#email').value.trim();
      const msgEl = document.getElementById('auth-msg');

      if (!email) {
        this.showMsg(msgEl, 'Please enter your email', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Sending...';

      try {
        await api.post('/user/register', { email });
        this.showMsg(msgEl, 'Verification email sent! Check your inbox.', 'success');
        btn.textContent = 'Email Sent ✓';
      } catch (err) {
        this.showMsg(msgEl, err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Send verification email';
      }
    });
  },

  /** Complete registration form handler */
  initCompleteRegistration() {
    const form = document.getElementById('complete-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const msgEl = document.getElementById('auth-msg');
      const email = form.querySelector('#email').value.trim();
      const name = form.querySelector('#name').value.trim();
      const password = form.querySelector('#password').value;
      const phoneNumber = form.querySelector('#phone').value.trim();

      if (!email || !name || !password) {
        this.showMsg(msgEl, 'Please fill in all required fields', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Completing...';

      try {
        await api.post('/user/complete-registration', { email, name, password, phoneNumber });
        this.showMsg(msgEl, 'Registration complete! You can now log in.', 'success');
        setTimeout(() => window.location.href = 'index.html', 1200);
      } catch (err) {
        this.showMsg(msgEl, err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Complete registration';
      }
    });
  },

  /** OTP verification handler */
  initOTP() {
    const digits = document.querySelectorAll('.otp-digit');
    const form = document.getElementById('otp-form');
    const msgEl = document.getElementById('auth-msg');
    if (!digits.length || !form) return;

    // Auto-focus and move between inputs
    digits.forEach((input, i) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val && i < digits.length - 1) {
          digits[i + 1].focus();
        }
        input.classList.toggle('filled', !!val);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) {
          digits[i - 1].focus();
        }
      });

      // Allow paste of full OTP
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
        for (let j = 0; j < digits.length && j < text.length; j++) {
          digits[j].value = text[j];
          digits[j].classList.add('filled');
        }
        if (text.length >= digits.length) digits[digits.length - 1].focus();
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const otp = Array.from(digits).map(d => d.value).join('');
      const email = sessionStorage.getItem('sv_pending_email');

      if (otp.length < 6) {
        this.showMsg(msgEl, 'Please enter the full 6-digit code', 'error');
        return;
      }

      if (!email) {
        this.showMsg(msgEl, 'Session expired. Please log in again.', 'error');
        setTimeout(() => window.location.href = 'index.html', 1000);
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Verifying...';

      try {
        await api.post('/user/verify-otp', { email, otp });

        // Fetch user data and save to session
        const userData = await api.get(`/user/getAll`);
        const users = userData.users || userData;
        const user = Array.isArray(users) 
          ? users.find(u => u.email === email) 
          : null;

        if (user) {
          AppStore.setUser(user);
        } else {
          // Fallback — store minimal info
          AppStore.setUser({ email });
        }

        sessionStorage.removeItem('sv_pending_email');
        this.showMsg(msgEl, 'Verified! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 600);
      } catch (err) {
        this.showMsg(msgEl, err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Verify';
        // Clear inputs
        digits.forEach(d => { d.value = ''; d.classList.remove('filled'); });
        digits[0].focus();
      }
    });
  },

  /** Forgot password handler */
  initForgotPassword() {
    const form = document.getElementById('forgot-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const email = form.querySelector('#email').value.trim();
      const msgEl = document.getElementById('auth-msg');

      if (!email) {
        this.showMsg(msgEl, 'Please enter your email', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Sending...';

      try {
        await api.post('/user/forgot-password', { email });
        this.showMsg(msgEl, 'Reset link sent to your email!', 'success');
        btn.textContent = 'Email Sent ✓';
      } catch (err) {
        this.showMsg(msgEl, err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Send reset link';
      }
    });
  },

  /** Reset password handler */
  initResetPassword() {
    const form = document.getElementById('reset-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const token = form.querySelector('#token').value.trim();
      const password = form.querySelector('#password').value;
      const msgEl = document.getElementById('auth-msg');

      if (!token || !password) {
        this.showMsg(msgEl, 'Please fill in all fields', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Resetting...';

      try {
        await api.post('/user/reset-password', { token, password });
        this.showMsg(msgEl, 'Password reset! You can now log in.', 'success');
        setTimeout(() => window.location.href = 'index.html', 1200);
      } catch (err) {
        this.showMsg(msgEl, err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Reset password';
      }
    });
  },

  /** Show message in auth forms */
  showMsg(el, text, type) {
    if (!el) return;
    el.className = 'auth-message ' + type;
    el.textContent = text;
    el.classList.remove('hidden');
  },

  /** Toggle password visibility */
  initPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.textContent = isPassword ? '🙈' : '👁️';
      });
    });
  },
};

window.Auth = Auth;
