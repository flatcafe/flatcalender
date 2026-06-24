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

  console.log(
    "バックグラウンド通知:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "ふらっとCafe";

  const notificationOptions = {
    body:
      payload.notification?.body || "新しい通知があります",
    icon: "/flatcalender/images/logo.png"
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );

});
