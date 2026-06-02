// welcome.js
import { auth, db } from './firebase-config.js';
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let selectedChar = {
  name: null,
  color: null,
  img: null
};

document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget;
    
    // 1. 全てのキャラの「ぴょこぴょこ」を止め、選択枠やジャンプを解除し、暗くする
    document.querySelectorAll('.char-btn').forEach(b => {
      b.classList.remove('idle-bounce', 'ring-4', 'ring-amber-400', 'jump');
      b.classList.add('dimmed'); 
    });

    // 2. 選択されたキャラだけ明るく戻し、枠をつけてジャンプさせる
    target.classList.remove('dimmed');
    
    // アニメーションを確実に再発火させるためのリセット処理
    void target.offsetWidth; 
    
    target.classList.add('jump', 'ring-4', 'ring-amber-400', 'rounded-2xl');
    
    // 3. データを保存
    selectedChar = {
      name: target.getAttribute('data-name'),
      color: target.getAttribute('data-color'),
      img: target.getAttribute('data-img')
    };
  });
});

document.getElementById('enterBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  if (!username || !selectedChar.name) {
    alert("お名前とキャラを選んでね！");
    return;
  }

  try {
    // 匿名ログインを実行
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    // Firestoreにユーザー情報を保存
    await setDoc(doc(db, "users", user.uid), {
      name: username,
      characterName: selectedChar.name,
      characterColor: selectedChar.color,
      characterImg: selectedChar.img,
      createdAt: new Date().toISOString()
    });

    // ログイン成功したらメイン画面へ
    window.location.href = 'index.html';
  } catch (error) {
    console.error("入店エラー:", error);
    alert("入店に失敗しました。もう一度試してください。");
  }
});
