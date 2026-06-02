import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const path = window.location.pathname;

onAuthStateChanged(auth, (user) => {
  // ログインしていない場合
  if (!user && !path.includes('welcome.html')) {
    window.location.href = 'welcome.html';
  }
  // ログインしているのにwelcomeにいる場合
  else if (user && path.includes('welcome.html')) {
    window.location.href = 'calendar.html';
  }
});
