document.addEventListener("DOMContentLoaded", () => {
  // 1. ユーザー名の表示処理
  const userData = JSON.parse(localStorage.getItem('cafe_user'));
  const userDisplay = document.getElementById('user-display');
  const logoutModal = document.getElementById('logout-modal');
  const cancelLogout = document.getElementById('cancel-logout');
  const confirmLogout = document.getElementById('confirm-logout');
  
  if (userData && userDisplay) {
    userDisplay.textContent = `${userData.name}でログイン中`;
  } else if (userDisplay) {
    userDisplay.textContent = "ゲストでログイン中";
  }

  // 2. モーダルの表示・非表示ロジック
  userDisplay.addEventListener('click', () => {
    logoutModal.classList.remove('hidden');
  });

  cancelLogout.addEventListener('click', () => {
    logoutModal.classList.add('hidden');
  });

  // 3. ログアウト実行
  confirmLogout.addEventListener('click', () => {
    localStorage.removeItem('cafe_user');
    window.location.href = 'welcome.html';
  });

  // 4. キャラクターのフェードイン表示
  const characters = document.querySelectorAll(".character");
  characters.forEach((char, index) => {
    setTimeout(() => {
      char.classList.add("fade-in");
    }, index * 400);
  });
});
