/**
 * StoreVerse Hash Router
 * Manages hash-based navigation for the dashboard SPA.
 */
const Router = {
  routes: {},
  currentRoute: null,

  /** Register a route handler: Router.on('overview', renderFn) */
  on(hash, handler) {
    this.routes[hash] = handler;
  },

  /** Navigate to a hash route */
  navigate(hash) {
    window.location.hash = '#/' + hash;
  },

  /** Get the current route name */
  current() {
    const h = window.location.hash.replace('#/', '') || 'overview';
    return h.split('?')[0]; // Strip query params
  },

  /** Get query params from hash */
  getParams() {
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return {};
    const params = {};
    const search = hash.substring(qIndex + 1);
    search.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return params;
  },

  /** Initialize the router — listen for hash changes */
  init() {
    const handleRoute = () => {
      const route = this.current();
      const handler = this.routes[route];
      if (handler) {
        this.currentRoute = route;
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(el => {
          el.classList.toggle('active', el.dataset.route === route);
        });
        // Render page
        handler();
      } else if (this.routes['overview']) {
        // Fallback to overview
        this.navigate('overview');
      }
    };

    window.addEventListener('hashchange', handleRoute);
    // Initial route on load
    handleRoute();
  },
};

window.Router = Router;
