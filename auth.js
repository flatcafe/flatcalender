// auth.js
const user = localStorage.getItem('cafe_user');

// welcomeページにいる時
if (window.location.pathname.includes('welcome.html')) {
  if (user) window.location.href = 'index.html'; // 登録済みならindexへ
} else {
  // indexページ等にいる時
  if (!user) window.location.href = 'welcome.html'; // 未登録ならwelcomeへ
}
