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
    <button class="toast-close" onclick="this.parentElement.classList.add('out');setTimeout(()=>this.parentElement.remove(),250)">
      <span style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">${ICONS.x}</span>
    </button>
  `;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, 5000);
}
