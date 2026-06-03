import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // 強制更新ボタンの処理
  const refreshBtn = document.getElementById('refresh-page-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      window.location.reload(true);
    });
  }

  const saveBtn = document.getElementById('save-colors-btn');
  const userDisplay = document.getElementById('display-user-name');
  
  const chars = ['waka', 'yuzu', 'lily', 'toru'];
  
  // 各メンバーの初期カラー（設定がない場合のデフォルト）
  const defaultColors = {
    waka: { main: "#abc888", sub: "#8fae6f" },
    yuzu: { main: "#fef263", sub: "#dfd344" },
    lily: { main: "#F0566E", sub: "#d13850" },
    toru: { main: "#968ABD", sub: "#786c9f" }
  };

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ユーザー名の取得と表示
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDisplay) {
          userDisplay.textContent = userDoc.data().name;
        }
      } catch (e) {}

      // Firebaseから共通のカラー設定を取得してフォームにセット
      try {
        const docSnap = await getDoc(doc(db, "settings", "colors"));
        let colors = defaultColors;
        if (docSnap.exists()) {
          colors = { ...defaultColors, ...docSnap.data() };
        }
        
        chars.forEach(char => {
          document.getElementById(`${char}-main`).value = colors[char]?.main || defaultColors[char].main;
          document.getElementById(`${char}-sub`).value = colors[char]?.sub || defaultColors[char].sub;
        });
      } catch (error) {
        console.error("カラー設定取得エラー:", error);
      }
    }
  });

  // 保存ボタンの処理
  saveBtn.addEventListener('click', async () => {
    saveBtn.textContent = "保存中...";
    saveBtn.disabled = true;
    
    // フォームの入力値から新しい設定データを作成
    const newColors = {};
    chars.forEach(char => {
      newColors[char] = {
        main: document.getElementById(`${char}-main`).value,
        sub: document.getElementById(`${char}-sub`).value
      };
    });

    try {
      // Firebaseにカラー設定を保存
      await setDoc(doc(db, "settings", "colors"), newColors);
      alert("メンバーのカラー設定を保存しました！");
    } catch (error) {
      console.error("カラー保存エラー:", error);
      alert("保存に失敗しました。");
    } finally {
      saveBtn.textContent = "設定を保存する";
      saveBtn.disabled = false;
    }
  });

  // ログアウト処理の紐付け
  document.getElementById('cancel-logout').addEventListener('click', () => {
    document.getElementById('logout-modal').classList.add('hidden');
  });
  document.getElementById('confirm-logout').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'welcome.html';
  });
});
