function showToast(title, description, type) {
  if (arguments.length === 2 && ['success', 'error', 'warning', 'info'].includes(description)) {
    type = description;
    description = '';
  }
  type = type || 'info';
  
  const icons = { success: 'check', error: 'x', warning: 'alertTriangle', info: 'info' };
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  
  let descHtml = description ? `<div class="toast-desc">${description}</div>` : '';
  
  el.innerHTML = `
    <div class="toast-icon-wrapper">
      <span class="toast-icon" style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">${ICONS[icons[type]] || ICONS.info}</span>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${descHtml}
    </div>
    <button type="button" class="toast-close" aria-label="Close" onclick="this.closest('.toast').remove()">
      <span style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; pointer-events: none;">${ICONS.x}</span>
    </button>
  `;

  // Attach explicit click listener
  const closeBtn = el.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      el.classList.add('out');
      setTimeout(() => {
        try { el.remove(); } catch(err){}
      }, 250);
    });
  }

  container.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) {
      el.classList.add('out');
      setTimeout(() => { try { el.remove(); } catch(err){} }, 250);
    }
  }, 5000);
}
