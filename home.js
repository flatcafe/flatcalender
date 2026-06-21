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
    const shiftMessages = {
      "日勤": "お昼間はお仕事だよ",
      "休み": "お休みだー！！遊ぶぞ！！",
      "夜勤": "朝も昼もお仕事・・・",
      "明け": "明け！！やっとゲームできる！！",
      "当直": "当直だよ"
    };

    // スマホ・PC共通で安全なフォントサイズを計算
    function getDynamicFontSize(textLength) {
      if (textLength > 50) return "clamp(10px, 1.5vw + 8px, 14px)";
      if (textLength > 30) return "clamp(12px, 1.8vw + 8px, 16px)";
      if (textLength > 15) return "clamp(14px, 2.0vw + 8px, 20px)";
      return "clamp(16px, 2.5vw + 8px, 24px)";
    }

    async function updateBubbles() {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      
      let todaysSchedules = [];

      try {
        const q = query(collection(db, "schedules"), where("date", "==", dateStr));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((docSnap) => {
         todaysSchedules.push({
          id: docSnap.id,
          ...docSnap.data()
      });
     });
      } catch (error) {
        console.error("スケジュールの取得エラー:", error);
      }
