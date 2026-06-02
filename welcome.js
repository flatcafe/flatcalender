let selectedChar = null;

document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('ring-4', 'ring-amber-400'));
    e.target.classList.add('ring-4', 'ring-amber-400');
    selectedChar = e.target.getAttribute('data-char');
  });
});

document.getElementById('enterBtn').addEventListener('click', () => {
  const name = document.getElementById('username').value;
  if (!name || !selectedChar) {
    alert("お名前とキャラを選んでね！");
    return;
  }

  const user = {
    name: name,
    character: selectedChar,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('cafe_user', JSON.stringify(user));
  window.location.href = 'index.html';
});
