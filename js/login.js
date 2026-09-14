// js/login.js — Login modal for landing page

const LoginModal = {
  init() {
    // Inject login modal HTML into body
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:400;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div class="glass-card" style="max-width:400px;width:90%;text-align:center;">
        <div style="font-size:3rem;margin-bottom:8px;">🔐</div>
        <h2 style="color:var(--gold);margin-bottom:4px;" id="loginTitle">Staff Login</h2>
        <p style="color:var(--text-muted);margin-bottom:20px;font-size:0.85rem;" id="loginSubtitle">Sign in to access your dashboard</p>
        <form id="loginForm" onsubmit="LoginModal.submit(event)">
          <div style="margin-bottom:12px;text-align:left;">
            <label style="display:block;font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">Email</label>
            <input type="email" class="input" id="loginEmail" required placeholder="your@email.com">
          </div>
          <div style="margin-bottom:16px;text-align:left;">
            <label style="display:block;font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">Password</label>
            <input type="password" class="input" id="loginPassword" required placeholder="••••••••">
          </div>
          <div id="loginError" style="color:var(--danger);font-size:0.85rem;margin-bottom:12px;display:none;"></div>
          <div style="display:flex;gap:8px;">
            <button type="button" onclick="LoginModal.close()" class="btn btn-secondary" style="flex:1;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1;" id="loginSubmit">Sign In</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });
  },

  open(role) {
    document.getElementById('loginTitle').textContent = role === 'kitchen' ? 'Kitchen Login' : 'Staff Login';
    document.getElementById('loginSubtitle').textContent = role === 'kitchen' ? 'Sign in to manage kitchen operations' : 'Sign in to manage orders';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginModal').style.display = 'flex';
    document.body.setAttribute('data-login-role', role);
    document.getElementById('loginEmail').focus();
  },

  close() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').style.display = 'none';
  },

  async submit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.body.getAttribute('data-login-role') || 'staff';
    const submitBtn = document.getElementById('loginSubmit');
    const errorEl = document.getElementById('loginError');

    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;
    errorEl.style.display = 'none';

    try {
      await Auth.signIn(email, password);

      // Verify role matches
      const expectedRole = role;
      if (Auth.userProfile?.role !== expectedRole) {
        errorEl.textContent = `Access denied. This login is for ${expectedRole} only.`;
        errorEl.style.display = 'block';
        await Auth.signOut();
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;
        return;
      }

      this.close();
      window.location.href = expectedRole === 'kitchen' ? 'kitchen.html' : 'staff.html';
    } catch (err) {
      errorEl.textContent = err.message || 'Invalid email or password';
      errorEl.style.display = 'block';
      submitBtn.textContent = 'Sign In';
      submitBtn.disabled = false;
    }
  }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => LoginModal.init());
