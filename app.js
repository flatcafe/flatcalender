// app.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const userDisplay = document.getElementById('user-display');
  const logoutModal = document.getElementById('logout-modal');
  const cancelLogout = document.getElementById('cancel-logout');
  const confirmLogout = document.getElementById('confirm-logout');
  
  // Firebaseのログイン状態を監視して表示を更新
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ログイン中：Firestoreからユーザー名を取得して表示
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDisplay) {
          const userData = userDoc.data();
          userDisplay.textContent = `${userData.name}でログイン中`;
        }
      } catch (error) {
        console.error("ユーザー情報の取得に失敗:", error);
      }
    } else if (userDisplay) {
      userDisplay.textContent = "ゲストでログイン中";
    }
  });

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
    confirmLogout.addEventListener('click', async () => {
      // Firebaseログアウト処理
      await signOut(auth);
      window.location.href = 'welcome.html';
    });
  }

  // キャラクターのフェードイン表示
  const characters = document.querySelectorAll(".character");
  characters.forEach((char, index) => {
    setTimeout(() => {
      char.classList.add("fade-in");
    }, index * 400);
  });
});
