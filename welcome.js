let selectedChar = {
  name: null,
  color: null,
  img: null
};

document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget;

    // 1. 全キャラの「ぴょこぴょこ(idle)」を停止
    document.querySelectorAll('.char-btn').forEach(b => {
      b.classList.remove('idle-bounce', 'ring-4', 'ring-amber-400');
      b.classList.add('dimmed'); // 他のキャラを暗くする
    });

    // 2. タップされたキャラの設定
    target.classList.remove('dimmed');
    target.classList.add('jump', 'ring-4', 'ring-amber-400', 'rounded-2xl');
    
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
