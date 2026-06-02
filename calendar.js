document.addEventListener("DOMContentLoaded", () => {
  const monthDisplay = document.getElementById("month-display");
  const calendarDays = document.getElementById("calendar-days");
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");

  let currentDate = new Date();
  const today = new Date();
  
  // ログインしているキャラクターのデータを取得
  const userData = JSON.parse(localStorage.getItem('cafe_user'));
  const charColor = userData ? userData.characterColor : "#DFC6B0"; 

  const holidays = ["01-01", "05-03", "05-04", "05-05", "11-03", "11-23"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function renderCalendar() {
    calendarDays.innerHTML = "";
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 英語表記に変更 (例: June 2026)
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 月曜始まりのための調整 (0:月, 1:火 ... 6:日)
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // 必要な行数を計算 (月によって5行か6行になる)
    const totalCellsNeeded = startDay + daysInMonth;
    const rows = Math.ceil(totalCellsNeeded / 7);
    const totalCells = rows * 7;

    // 高さを均等に割るためにインラインスタイルでグリッドの行を設定
    calendarDays.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      // 各マス: 黒細線、余白なしで目一杯広く
      cell.className = "border-r border-b border-black relative";

      // 今月の日付のみを描画 (来月・先月分は枠線のみの空マス)
      if (i >= startDay && i < startDay + daysInMonth) {
        const dayNum = i - startDay + 1;
        
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(dayNum).padStart(2, '0');
        const dateRef = `${monthStr}-${dayStr}`;

        // 数字と丸をまとめるラッパー（左上に配置）
        const numWrapper = document.createElement("div");
        numWrapper.className = "absolute top-1 left-1 w-6 h-6 flex items-center justify-center";

        // 今日のハイライト
        const isToday = (year === today.getFullYear() && month === today.getMonth() && dayNum === today.getDate());
        
        if (isToday) {
          const circle = document.createElement("div");
          // 透明度50%、数字の背面に配置
          circle.className = "absolute inset-0 rounded-full opacity-50 z-0";
          circle.style.backgroundColor = charColor;
          numWrapper.appendChild(circle);
        }

        // 日付の数字
        const numSpan = document.createElement("span");
        numSpan.className = "text-xs z-10 relative"; // text-xs で小さく
        numSpan.textContent = dayNum;

        // 土・日・祝日・平日の色分け
        if (i % 7 === 5) {
          numSpan.classList.add("text-blue-700", "font-bold");
        } else if (i % 7 === 6 || holidays.includes(dateRef)) {
          numSpan.classList.add("text-red-700", "font-bold");
        } else {
          // 今日の場合は黒で太字にして見やすくする
          if(isToday) {
             numSpan.classList.add("text-black", "font-bold");
          } else {
             numSpan.classList.add("text-black");
          }
        }
        
        numWrapper.appendChild(numSpan);
        cell.appendChild(numWrapper);
      }
      
      calendarDays.appendChild(cell);
    }
  }

  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
});
