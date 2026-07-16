// Auth State Management
const Auth = {
  user: null,
  token: null,

  init() {
    this.token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedUser && this.token) {
      try {
        this.user = JSON.parse(storedUser);
      } catch {
        this.logout();
      }
    }
    this.updateUI();
  },

  login(userData, token) {
    this.user = userData;
    this.token = token;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    this.updateUI();
  },

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.updateUI();
    window.location.href = '/pages/login.html';
  },

  isAuthenticated() {
    return !!(this.user && this.token);
  },

  hasRole(...roles) {
    return this.user && roles.includes(this.user.role);
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  },

  requireRole(...roles) {
    if (!this.requireAuth()) return false;
    if (!this.hasRole(...roles)) {
      window.location.href = '/pages/dashboard.html';
      return false;
    }
    return true;
  },

  updateUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');

    if (this.isAuthenticated()) {
      if (authButtons) authButtons.style.display = 'none';
      if (userMenu) userMenu.style.display = 'block';
      if (userName) userName.textContent = this.user.name;
    } else {
      if (authButtons) authButtons.style.display = 'flex';
      if (userMenu) userMenu.style.display = 'none';
    }
  }
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();

  // Logout button handler
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }

  // User dropdown toggle
  const userDropdown = document.getElementById('user-dropdown');
  const dropdown = userDropdown?.closest('.dropdown');
  if (userDropdown && dropdown) {
    userDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }
});
