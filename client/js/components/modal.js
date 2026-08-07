/**
 * Modal Component
 * Usage: Modal.open({ title, body, onSubmit, submitText, size })
 */
const Modal = {
  backdrop: null,

  init() {
    if (this.backdrop) return;
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.id = 'modal-backdrop';
    this.backdrop.innerHTML = `
      <div class="modal" id="modal">
        <div class="modal-header">
          <h3 id="modal-title"></h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-footer" id="modal-footer"></div>
      </div>
    `;
    document.body.appendChild(this.backdrop);

    // Close on backdrop click
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    document.getElementById('modal-close-btn').addEventListener('click', () => this.close());

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.backdrop.classList.contains('active')) {
        this.close();
      }
    });
  },

  open({ title = '', body = '', footer = '', onSubmit = null, submitText = 'Save', cancelText = 'Cancel', size = '' }) {
    this.init();
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;

    const modal = document.getElementById('modal');
    modal.style.maxWidth = size === 'lg' ? '720px' : size === 'sm' ? '400px' : '560px';

    // Footer
    const footerEl = document.getElementById('modal-footer');
    if (footer) {
      footerEl.innerHTML = footer;
    } else {
      footerEl.innerHTML = `
        <button class="btn" id="modal-cancel">${cancelText}</button>
        <button class="btn btn-primary" id="modal-submit">${submitText}</button>
      `;
      document.getElementById('modal-cancel').addEventListener('click', () => this.close());
      if (onSubmit) {
        document.getElementById('modal-submit').addEventListener('click', async () => {
          const btn = document.getElementById('modal-submit');
          btn.disabled = true;
          btn.innerHTML = '<span class="spinner"></span> Saving...';
          try {
            await onSubmit();
          } catch (err) {
            Toast.error(err.message);
          } finally {
            if (btn) {
              btn.disabled = false;
              btn.textContent = submitText;
            }
          }
        });
      }
    }

    this.backdrop.classList.add('active');
    // Focus first input
    setTimeout(() => {
      const firstInput = document.querySelector('#modal-body input, #modal-body select, #modal-body textarea');
      if (firstInput) firstInput.focus();
    }, 200);
  },

  close() {
    if (this.backdrop) this.backdrop.classList.remove('active');
  },

  /** Helper: get form values from modal body */
  getFormData() {
    const data = {};
    document.querySelectorAll('#modal-body input, #modal-body select, #modal-body textarea').forEach(el => {
      if (el.name) {
        if (el.type === 'checkbox') {
          data[el.name] = el.checked;
        } else {
          data[el.name] = el.value;
        }
      }
    });
    return data;
  },
};

window.Modal = Modal;
