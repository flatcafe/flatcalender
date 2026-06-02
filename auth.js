// auth.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebaseでログイン状態を監視する
onAuthStateChanged(auth, (user) => {
  const path = window.location.pathname;
  const isWelcomePage = path.includes('welcome.html');

  // ログインしていない場合
  if (!user) {
    if (!isWelcomePage) {
      window.location.href = 'welcome.html';
    }
  } 
  // ログインしている場合
  else {
    if (isWelcomePage) {
      window.location.href = 'index.html';
    }
  }
});
