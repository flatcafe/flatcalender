document.addEventListener("DOMContentLoaded", () => {
  // 1. ユーザー名の表示処理
  const userData = JSON.parse(localStorage.getItem('cafe_user'));
  const userDisplay = document.getElementById('user-display');
  
  if (userData && userDisplay) {
    userDisplay.textContent = `${userData.name}でログイン中`;
  } else if (userDisplay) {
    userDisplay.textContent = "ゲストでログイン中";
  }

  // 2. キャラクターのフェードイン表示
  const characters = document.querySelectorAll(".character");
  characters.forEach((char, index) => {
    setTimeout(() => {
      char.classList.add("fade-in");
    }, index * 400);
  });
});
