document.addEventListener("DOMContentLoaded", () => {
  // ユーザーデータの取得
  const userData = JSON.parse(localStorage.getItem('cafe_user'));
  const userDisplay = document.getElementById('user-display');
  const logoutModal = document.getElementById('logout-modal');
  const cancelLogout = document.getElementById('cancel-logout');
  const confirmLogout = document.getElementById('confirm-logout');
  
  // ユーザー名の表示
  if (userData && userDisplay) {
    userDisplay.textContent = `${userData.name}でログイン中`;
  } else if (userDisplay) {
    userDisplay.textContent = "ゲストでログイン中";
  }

  // モーダルの操作
  if (userDisplay) {
    userDisplay.addEventListener('click', () => {
      logoutModal.classList.remove('hidden');
    });
  }
  if (cancelLogout) {
    cancelLogout.addEventListener('click', () => {
      logoutModal.classList.add('hidden');
    });
  }
  if (confirmLogout) {
    confirmLogout.addEventListener('click', () => {
      localStorage.removeItem('cafe_user');
      window.location.href = 'welcome.html';
    });
  }

  // キャラクターのフェードイン表示（ここは既存の要素用）
  const characters = document.querySelectorAll(".character");
  characters.forEach((char, index) => {
    setTimeout(() => {
      char.classList.add("fade-in");
    }, index * 400);
  });
});
