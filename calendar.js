document.addEventListener("DOMContentLoaded", () => {
  try {
    const monthDisplay = document.getElementById("month-display");
    const calendarDays = document.getElementById("calendar-days");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");
    
    const stampPopup = document.getElementById("stamp-popup");
    const actionModal = document.getElementById("schedule-action-modal");
    const modalContentArea = document.getElementById("modal-content-area");
    
    if (!calendarDays) return;

    let currentDate = new Date();
    const today = new Date();
    let selectedDateStr = null;

    let userName = "ゲスト";
    let charName = "";
    let charColor = "#DFC6B0"; 
    
    try {
      const userData = JSON.parse(localStorage.getItem('cafe_user'));
      if (userData) {
        userName = userData.name || "ゲスト";
        charName = userData.characterName || "";
        charColor = userData.characterColor || "#DFC6B0";
      }
    } catch (e) { console.error(e); }

    const holidays = ["01-01", "05-03", "05-04", "05-05", "11-03", "11-23"];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const sortOrder = { "lily": 1, "yuzu": 2, "waka": 3, "toru": 4 };

    // ==========================================
    // ロゴボタンでポップアップの開閉 (確実に動作するように修正)
    // ==========================================
    document.addEventListener("click", (e) => {
      const navLogo = e.target.closest("#nav-logo");
      if (navLogo) {
        e.preventDefault();
        
        // 現在ポップアップが隠れているかどうかの判定
        const isHidden = stampPopup.classList.contains("translate-y-full") || stampPopup.classList.contains("-translate-y-full");
        
        if (isHidden) {
          // 【開く】
          // 基準となるメニューバーの高さを取得
          const navBar = document.querySelector("cafe-nav nav");
          const navHeight = navBar ? navBar.offsetHeight : 0;
          
          if (!stampPopup.classList.contains("top-0")) {
            stampPopup.style.bottom = `${navHeight}px`;
          }
          stampPopup.classList.remove("translate-y-full", "-translate-y-full");
        } else {
          // 【閉じる】
          if (stampPopup.classList.contains("top-0")) {
            stampPopup.classList.add("-translate-y-full"); // 上に隠す
          } else {
            stampPopup.classList.add("translate-y-full"); // 下に隠す
          }
        }
      }
    });

    function getFormatDate(y, m, d) {
      return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    function getGradient(members) {
      const colorMap = { "waka": "#
