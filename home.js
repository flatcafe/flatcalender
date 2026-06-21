import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
 document.getElementById('cancel-logout').addEventListener('click', () => {
      document.getElementById('logout-modal').classList.add('hidden');
    });
    
    document.getElementById('confirm-logout').addEventListener('click', async () => {
      try {
        await signOut(auth); 
        window.location.href = 'welcome.html';
      } catch (error) {
        console.error("ログアウトエラー:", error);
      }
    });

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            document.getElementById('display-user-name').textContent = userData.name || "ゲスト";
          }
        } catch (error) {
          console.error("ユーザー情報取得エラー:", error);
        }

        updateBubbles();
      }
    });
