/**
 * StoreVerse Global State
 * Manages currentUser, currentStore, and emits change events.
 */
const AppStore = {
  _listeners: {},

  /** Get the current user from sessionStorage */
  getUser() {
    try {
      return JSON.parse(sessionStorage.getItem('sv_user'));
    } catch { return null; }
  },

  /** Set user and persist */
  setUser(user) {
    sessionStorage.setItem('sv_user', JSON.stringify(user));
    this.emit('userChanged', user);
  },

  /** Get the active store */
  getStore() {
    try {
      return JSON.parse(sessionStorage.getItem('sv_store'));
    } catch { return null; }
  },

  /** Set active store and persist */
  setStore(store) {
    sessionStorage.setItem('sv_store', JSON.stringify(store));
    this.emit('storeChanged', store);
  },

  /** Get the user's store list */
  getStores() {
    try {
      return JSON.parse(sessionStorage.getItem('sv_stores')) || [];
    } catch { return []; }
  },

  setStores(stores) {
    sessionStorage.setItem('sv_stores', JSON.stringify(stores));
  },

  /** Clear session (logout) */
  clear() {
    sessionStorage.removeItem('sv_user');
    sessionStorage.removeItem('sv_store');
    sessionStorage.removeItem('sv_stores');
  },

  /** Simple event emitter */
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  },

  emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
  },

  /** Require auth — redirect to login if no user */
  requireAuth() {
    if (!this.getUser()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  /** Load stores for the current user */
  async loadStores() {
    const user = this.getUser();
    if (!user) return [];
    try {
      const data = await api.get(`/store/user-stores/${user.id}`);
      const stores = data.stores || [];
      this.setStores(stores);

      // If no store is selected, pick the first
      if (!this.getStore() && stores.length > 0) {
        this.setStore(stores[0]);
      }
      return stores;
    } catch (err) {
      console.error('Failed to load stores:', err);
      return [];
    }
  },
};

window.AppStore = AppStore;
