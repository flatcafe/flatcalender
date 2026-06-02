let selectedChar = {
  name: null,
  color: null,
  img: null
};

document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // 選択状態のスタイル（ボタン自体にクリックイベントがくるようclosestで判定）
    const target = e.currentTarget;
    document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('ring-4', 'ring-amber-400'));
    target.classList.add('ring-4', 'ring-amber-400');
    
    selectedChar = {
      name: target.getAttribute('data-name'),
      color: target.getAttribute('data-color'),
      img: target.getAttribute('data-img')
    };
  });
});

document.getElementById('enterBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  if (!username || !selectedChar.name) {
    alert("お名前とキャラを選んでね！");
    return;
  }

  const user = {
    name: username,
    characterName: selectedChar.name,
    characterColor: selectedChar.color,
    characterImg: selectedChar.img,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('cafe_user', JSON.stringify(user));
  window.location.href = 'index.html';
});
