// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ！！！ここに自分の設定を貼り付けてください！！！
const firebaseConfig ={
  apiKey: "AIzaSyAYZ4KTcgU1Ngwk1XFXTJy-VPLqs8Nk6NM",
  authDomain: "flcacarender.firebaseapp.com",
  projectId: "flcacarender",
  storageBucket: "flcacarender.firebasestorage.app",
  messagingSenderId: "833839239658",
  appId: "1:833839239658:web:3f016efa76ff170297e293",
  measurementId: "G-QNDS60ZXX7"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
