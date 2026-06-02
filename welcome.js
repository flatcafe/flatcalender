let selectedChar = null;

document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // 選択状態のスタイル
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

  // ユーザー情報を保存
  const user = {
    name: name,
    character: selectedChar,
    color: getCharColor(selectedChar) // 後述のキャラカラー関数
  };
  localStorage.setItem('cafe_user', JSON.stringify(user));
  window.location.href = 'index.html';
});

// キャラごとのメンカラ定義（後で自由に変更可能）
function getCharColor(char) {
  const colors = { '🌻': 'yellow', '🍃': 'green', '🌸': 'pink', '💎': 'blue' };
  return colors[char] || 'gray';
}
