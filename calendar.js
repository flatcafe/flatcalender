document.addEventListener("DOMContentLoaded", () => {
  try {
    const monthDisplay = document.getElementById("month-display");
    const calendarDays = document.getElementById("calendar-days");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");
    
    const stampPopup = document.getElementById("stamp-popup");
    const popupToggleBtn = document.getElementById("popup-toggle-btn");

    const detailModal = document.getElementById("schedule-detail-modal");
    const detailContentArea = document.getElementById("detail-content-area");
    const detailCloseBtn = document.getElementById("detail-close-btn");

    const actionModal = document.getElementById("schedule-action-modal");
    
    if (!calendarDays) return;

    let currentDate = new Date();
    const today = new Date();
    let selectedDateStr = null;
    let isPopupTop = false; 

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

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // ==========================================
    // 日本の祝日データを自動取得（API連携）
    // ==========================================
    let holidaysData = {};
    fetch('https://holidays-jp.github.io/api/v1/date.json')
      .then(response => response.json())
      .then(data => {
        holidaysData = data;
        renderCalendar(); // 取得後に再描画して赤色を反映
      })
      .catch(error => console.warn("祝日データの取得に失敗しました:", error));

    const sortOrder = { "lily": 1, "yuzu": 2, "waka": 3, "toru": 4 };

    // 並び順のスコア計算
    function getSortScore(sched) {
      if (sched.type === 'shift') {
        if (sched.characterName === 'lily') return 1;
        if (sched.characterName === 'yuzu') return 2;
        if (sched.characterName === 'waka') return 3;
        if (sched.characterName === 'toru') return 4;
        return 5;
      } else {
        if (sched.text === '横動画') return 10;
        if (sched.text === 'ショート') return 11;
        if (sched.text === 'コラボ') return 12;
        return 13; 
      }
    }

    function updatePopupPosition() {
      const navBar = document.querySelector("cafe-nav nav");
      const navHeight = navBar ? navBar.offsetHeight : 0;
      
      const isHiddenTop = stampPopup.classList.contains("-translate-y-full");
      const isHiddenBottom = stampPopup.classList.contains("translate-y-full");
      
      stampPopup.className = "fixed left-0 right-0 z-40 bg-[#E0D7C2] shadow-[0_0_20px_rgba(0,0,0,0.15)] p-4 transition-transform duration-300";
      
      if (isPopupTop) {
        stampPopup.classList.add("top-0", "rounded-b-3xl", "pb-6");
        stampPopup.style.bottom = "auto";
        if (isHiddenTop || isHiddenBottom) stampPopup.classList.add("-translate-y-full");
        if (popupToggleBtn) popupToggleBtn.textContent = "▼ 下へ移動";
      } else {
        stampPopup.classList.add("rounded-t-3xl", "pt-4", "pb-8");
        stampPopup.style.bottom = `${navHeight}px`;
        if (isHiddenTop || isHiddenBottom) stampPopup.classList.add("translate-y-full");
        if (popupToggleBtn) popupToggleBtn.textContent = "▲ 上へ移動";
      }
    }

    if (popupToggleBtn) {
      popupToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isPopupTop = !isPopupTop;
        updatePopupPosition();
      });
    }

    document.addEventListener("click", (e) => {
      const navLogo = e.target.closest ? e.target.closest("#nav-logo") : null;
      if (navLogo && stampPopup) {
        e.preventDefault();
        const isHidden = stampPopup.classList.contains("translate-y-full") || stampPopup.classList.contains("-translate-y-full");
        
        if (isHidden) {
          updatePopupPosition();
          setTimeout(() => {
            stampPopup.classList.remove("translate-y-full", "-translate-y-full");
          }, 10);
        } else {
          if (isPopupTop) {
            stampPopup.classList.add("-translate-y-full"); 
          } else {
            stampPopup.classList.add("translate-y-full"); 
          }
        }
      }
    });

    function getFormatDate(y, m, d) {
      return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    function getGradient(members) {
      const colorMap = { "waka": "#abc888", "yuzu": "#fef263", "lily": "#F0566E", "toru": "#968ABD" };
      const ordered = ["waka", "yuzu", "lily", "toru"].filter(m => members.includes(m));
      if (ordered.length === 0) return "#AFC8E1"; 
      if (ordered.length === 1) return colorMap[ordered[0]];
      let gradient = "linear-gradient(90deg, ";
      const step = 100 / ordered.length;
      const stops = [];
      ordered.forEach((m, i) => {
        stops.push(`${colorMap[m]} ${i * step}%`);
        stops.push(`${colorMap[m]} ${(i + 1) * step}%`);
      });
      return gradient + stops.join(", ") + ")";
    }

    function getSchedules() {
      try {
        let data = JSON.parse(localStorage.getItem('cafe_
