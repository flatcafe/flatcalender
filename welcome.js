let selectedChar = {
  name: null,
  color: null,
  img: null
};

document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget;
    
    // 1. 全てのキャラの「ぴょこぴょこ」を止め、選択枠やジャンプを解除し、暗くする
    document.querySelectorAll('.char-btn').forEach(b => {
      b.classList.remove('idle-bounce', 'ring-4', 'ring-amber-400', 'jump');
      b.classList.add('dimmed'); 
    });

    // 2. 選択されたキャラだけ明るく戻し、枠をつけてジャンプさせる
    target.classList.remove('dimmed');
    
    // アニメーションを確実に再発火させるためのリセット処理
    void target.offsetWidth; 
    
    target.classList.add('jump', 'ring-4', 'ring-amber-400', 'rounded-2xl');
    
    // 3. データを保存
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
  } else {
    const user = {
      name: username,
      characterName: selectedChar.name,
      characterColor: selectedChar.color,
      characterImg: selectedChar.img,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('cafe_user', JSON.stringify(user));
    window.location.href = 'index.html';
  }
});
