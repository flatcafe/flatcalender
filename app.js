document.addEventListener("DOMContentLoaded", () => {
  const characters = document.querySelectorAll(".character");
  
  // 順番にふわっと表示
  characters.forEach((char, index) => {
    setTimeout(() => {
      char.classList.add("fade-in");
    }, index * 400);
  });

  // 設定ボタンでログアウト
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('cafe_user');
    window.location.href = 'welcome.html';
  });
});
