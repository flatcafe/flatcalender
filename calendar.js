document.addEventListener("DOMContentLoaded", () => {
  try {
    const monthDisplay = document.getElementById("month-display");
    const calendarDays = document.getElementById("calendar-days");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");

    if (!calendarDays) return; // HTMLの読み込み失敗時の安全装置

    let currentDate = new Date();
    const today = new Date();
    
    // ログインしているキャラクターのデータを安全に取得
    let charColor = "#DFC6B0"; 
    try {
      const userDataStr = localStorage.getItem('cafe_user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.characterColor) {
          charColor = userData.characterColor;
        }
      }
    } catch (e) {
      console.error("データ読み込みエラー", e);
    }

    const holidays = ["01-01", "05-03", "05-04", "05-05", "11-03", "11-23"];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function renderCalendar() {
      calendarDays.innerHTML = "";
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // 英語表記に変更
      monthDisplay.textContent = `${monthNames[month]} ${year}`;

      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // 月曜始まりのための調整 (0:月, 1:火 ... 6:日)
      const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

      // 必要な行数を計算 (基本5行、はみ出る場合は6行に自動調整)
      const totalCellsNeeded = startDay + daysInMonth;
      const rows = Math.max(5, Math.ceil(totalCellsNeeded / 7));
      const totalCells = rows * 7;

      // 高さが潰れないように minmax で最低サイズ(3rem)を指定
      calendarDays.style.gridTemplateRows = `repeat(${rows}, minmax(3rem, 1fr))`;

      // 日付をマスに配置していく
      for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement("div");
        // 各マス: 黒細線と最低の高さ(min-h-[3rem])を保証
        cell.className = "border-r border-b border-black relative overflow-hidden min-h-[3rem]";

        // 今月の日付のみを描画 (来月・先月分は枠線のみの空マス)
        if (i >= startDay && i < startDay + daysInMonth) {
          const dayNum = i - startDay + 1;
          const monthStr = String(month + 1).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const dateRef = `${monthStr}-${dayStr}`;
          const isToday = (year === today.getFullYear() && month === today.getMonth() && dayNum === today.getDate());

          // 文字色の判定
          let numClass = "text-xs z-10 relative font-bold";
          if (i % 7 === 5) {
            numClass += " text-blue-700"; // 土曜
          } else if (i % 7 === 6 || holidays.includes(dateRef)) {
            numClass += " text-red-700"; // 日曜・祝日
          } else {
            numClass += " text-black"; // 平日
          }

          // 数字を囲むラッパー（左上に配置）
          const wrapper = document.createElement("div");
          wrapper.className = "absolute top-1 left-1 w-6 h-6 flex items-center justify-center";

          // 今日の場合はキャラカラーの丸をつける
          if (isToday) {
            const circle = document.createElement("div");
            circle.className = "absolute inset-0 rounded-full opacity-50 z-0";
            circle.style.backgroundColor = charColor;
            wrapper.appendChild(circle);
          }

          // 日付テキスト
          const span = document.createElement("span");
          span.className = numClass;
          span.textContent = dayNum;
          
          wrapper.appendChild(span);
          cell.appendChild(wrapper);
        }
        
        calendarDays.appendChild(cell);
      }
    }

    // 先月・来月ボタンのイベント
    prevBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    nextBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });

    // 初回描画
    renderCalendar();

  } catch (error) {
    console.error("カレンダーの生成中にエラーが発生しました:", error);
  }
});
