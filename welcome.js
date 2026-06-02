import { auth, db } from './firebase-config.js';
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let selectedChar = { name: null, color: null, img: null };

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
      color: target.getAttribute('data-color'),
      img: target.getAttribute('data-img')
    };
  });
});

// 入店ボタンの処理
document.getElementById('enterBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  
  if (!username) { alert("名前を入力してね！"); return; }
  if (!selectedChar.name) { alert("キャラを選んでね！"); return; }

  try {
    const userCredential = await signInAnonymously(auth);
    
    // Firestoreへ保存
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: username,
      characterName: selectedChar.name,
      characterColor: selectedChar.color,
      characterImg: selectedChar.img,
      updatedAt: new Date().toISOString()
    });

    window.location.href = 'index.html';
  } catch (error) {
    console.error("入店エラー:", error);
    alert("入店に失敗しました。再試行してください。");
  }
});
