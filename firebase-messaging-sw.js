importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAYZ4KTcgU1Ngwk1XFXTJy-VPLqs8Nk6NM",
  authDomain: "flcacarender.firebaseapp.com",
  projectId: "flcacarender",
  storageBucket: "flcacarender.firebasestorage.app",
  messagingSenderId: "833839239658",
  appId: "1:833839239658:web:3f016efa76ff170297e293"
});

const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
  console.log("バックグラウンド通知:", payload);
  // 表示命令（showNotification）をここでは実行しないようにします
});


// 既存のコードは一切消さずに、ファイルの最下部にこれを追加してください
/*
self.addEventListener('push', function(event) {
  if (!event.data) return;
  try {
    const data = event.data.json();
    // すでに動いている場合は重複表示を防ぐため、onBackgroundMessage側と共通の処理を走らせます
    const notificationTitle = data.notification?.title || data.data?.title || "ふらっとCafe";
const notificationOptions = {
  body: data.notification?.body || data.data?.body || "新しい通知があります",
  icon: "/flatcalender/images/logo.png"
};
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (e) {
    console.error('Push parse error:', e);
  }
});
*/
