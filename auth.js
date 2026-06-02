// 全ページで読み込むことでログインを強制・自動化
const user = localStorage.getItem('cafe_user');
const path = window.location.pathname;

// ログインしていない場合
if (!user && !path.includes('welcome.html')) {
  window.location.href = 'welcome.html';
}
// ログインしているのにwelcomeにいる場合
else if (user && path.includes('welcome.html')) {
  window.location.href = 'index.html';
}
