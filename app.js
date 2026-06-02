// アプリ起動時の処理
document.addEventListener("DOMContentLoaded", () => {
  const characters = document.querySelectorAll(".character");
  
  // 順番にふわっとフェードインさせる
  characters.forEach((char, index) => {
    setTimeout(() => {
      char.classList.add("fade-in");
    }, index * 400); // 400ms間隔で次のキャラを表示
  });
});
