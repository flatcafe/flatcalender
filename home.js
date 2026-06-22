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

      const bubblePromises = {};

　　　["waka", "yuzu", "lily", "toru"].forEach(name => {
 　　　 bubblePromises[name] = getDoc(
    　　doc(db, "bubbleComments", `${dateStr}_${name}`)
 　　　　 );
　　　});
      
      for (const item of document.querySelectorAll('.char-item')) {
        const name = item.getAttribute('data-name');
        const bubble = item.querySelector('.speech-box');
        
        const charSchedules = todaysSchedules.filter(s => 
          s.characterName === name || (s.members && s.members.includes(name))
        );
        
        let msg = "今日は何の日？";

let hasCustomBubble = false;

const bubbleDoc = await bubblePromises[name];

if (bubbleDoc.exists()) {
  msg = bubbleDoc.data().comment;
  hasCustomBubble = true;
}
        
　　　
        
       let latestSched = null;

if (charSchedules.length > 0 && !hasCustomBubble) {
  charSchedules.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA;
  });

  latestSched = charSchedules[0];

  if (latestSched.detail && latestSched.detail.trim() !== "") {
    msg = latestSched.detail;
  } else {
    msg = shiftMessages[latestSched.text] || latestSched.text;
  }
}
        
        bubble.style.fontSize = getDynamicFontSize(msg.length);
bubble.textContent = msg;

bubble.style.cursor = "pointer";

bubble.onclick = async () => {

  const newComment = prompt("吹き出しコメントを入力", msg);

  if (newComment === null) return;

if (!latestSched) {

  await setDoc(
    doc(db, "bubbleComments", `${dateStr}_${name}`),
    {
      date: dateStr,
      characterName: name,
      comment: newComment,
      updatedAt: new Date().toISOString()
    }
  );

} else {

  await updateDoc(
    doc(db, "schedules", latestSched.id),
    {
      detail: newComment
    }
  );

}


// 🔔 通知
await addDoc(
  collection(db, "notifications"),
  {
    type: "bubble",
    author: document.getElementById('display-user-name').textContent,
    authorUid: auth.currentUser.uid,
    title: "吹き出しを変更しました",
    createdAt: new Date().toISOString()
  }
);


bubble.textContent = newComment;



};
      }
}
