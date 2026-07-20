function togglePw(btn) {
  const input = btn.parentElement.querySelector('input');
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  btn.innerHTML = isPw ? ICONS.eyeOff : ICONS.eye;
}
