import { auth, db, messaging } from './firebase-config.js';

import { signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getToken } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";



let selectedChar = { name: null, color: null, img: null };
const charNames = {
  waka: "若凪",
  yuzu: "柚茶",
  lily: "Lily00",
  toru: "とるま"
};

// キャラクタ選択ロジック
document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget;
    
    // UIリセット
    document.querySelectorAll('.char-btn').forEach(b => {
      b.classList.remove('idle-bounce', 'ring-4', 'ring-amber-400', 'jump');
      b.classList.add('dimmed'); 
    });

    // 選択状態適用
    target.classList.remove('dimmed');
    target.classList.add('jump', 'ring-4', 'ring-amber-400', 'rounded-2xl');
    
    selectedChar = {
  name: target.getAttribute('data-name'),
  displayName: charNames[target.getAttribute('data-name')],
  color: target.getAttribute('data-color'),
  img: target.getAttribute('data-img')
};
  });
});

async function setupPushNotification(userId) {
  try {

    alert("① SW登録開始");

    const registration =
      await navigator.serviceWorker.register(
        '/flatcalender/firebase-messaging-sw.js'
      );

    alert("② SW登録成功");

    const permission =
      await Notification.requestPermission();

    alert("③ permission=" + permission);

    if (permission !== "granted") {
      return;
    }

    alert("④ getToken開始");

    const token = await getToken(messaging, {
      vapidKey: "あなたのVAPIDキー",
      serviceWorkerRegistration: registration
    });

    alert("⑤ getToken成功");

    console.log(token);

    await setDoc(
      doc(db, "users", userId),
      {
        fcmToken: token
      },
      { merge: true }
    );

    alert("⑥ Firestore保存成功");

  } catch (err) {

  alert(
    "FCMエラー\n\n" +
    err.message +
    "\n\n" +
    JSON.stringify(err)
  );

  console.error("FCMエラー:", err);
}
}
// 入店ボタンの処理
document.getElementById('enterBtn').addEventListener('click', async () => {
  
  if (!selectedChar.name) { alert("キャラを選んでね！"); return; }

  try {
const userCredential = await signInAnonymously(auth);

// Firestoreへ保存
await setDoc(doc(db, "users", userCredential.user.uid), {
  name: selectedChar.displayName,
  characterName: selectedChar.name,
  characterColor: selectedChar.color,
  characterImg: selectedChar.img,

  // 通知設定 初期ON
  notifyAdd: true,
  notifyEdit: true,
  notifyBubble: true,

  updatedAt: new Date().toISOString()
});

// ←ここ追加
await setupPushNotification(userCredential.user.uid);

    if (Notification.permission === "denied") {
  return;
}

const permission =
  Notification.permission === "granted"
    ? "granted"
    : await Notification.requestPermission();

window.location.href = 'index.html';
 } catch (error) {
  console.error("入店エラー:", error);

  alert(
    "入店エラー\n\n" +
    error.message
  );
}

  });
