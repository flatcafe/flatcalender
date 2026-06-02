document.addEventListener("DOMContentLoaded", () => {
  const monthDisplay = document.getElementById("month-display");
  const calendarDays = document.getElementById("calendar-days");
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");

  let currentDate = new Date();
  const today = new Date();
  
  // ログインしているキャラクターのデータを取得
  const userData = JSON.parse(localStorage.getItem('cafe_user'));
  const charColor = userData ? userData.characterColor : "#DFC6B0"; // データがない場合の予備色

  // ※祝日判定のプレースホルダー（JavaScriptには標準の祝日データがないため、仮で固定日を設定）
  // 実際にはAPIや年ごとの祝日リストを追加する必要があります。
  const holidays = ["01-01", "05-03", "05-04", "05-05", "11-03", "11-23"];

  function renderCalendar() {
    calendarDays.innerHTML = "";
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 年月の表示
    monthDisplay.textContent = `${year}年 ${month + 1}月`;

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 月の初日（0:日, 1:月...）
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 今月の日数
    const daysInPrevMonth = new Date(year, month, 0).getDate(); // 先月の日数

    // 月曜始まりのための調整 (0:月, 1:火 ... 6:日 に変換)
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // カレンダーは常に6週分(42マス)表示してレイアウトを固定
    for (let i = 0; i < 42; i++) {
      const cell = document.createElement("div");
      // 各マスの黒細線設定
      cell.className = "border-r border-b border-black relative flex flex-col items-center p-1 min-h-[4rem] text-sm";

      let dayNum;
      let isCurrentMonth = false;

      // --- 日付の計算と色の設定 ---
      if (i < startDay) {
        // 先月の日付
        dayNum = daysInPrevMonth - startDay + i + 1;
        cell.classList.add("text-gray-500", "bg-black/5"); // 灰色＆少し暗く
      } else if (i >= startDay && i < startDay + daysInMonth) {
        // 今月の日付
        dayNum = i - startDay + 1;
        isCurrentMonth = true;
        
        // 祝日の判定用 (MM-DD)
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(dayNum).padStart(2, '0');
        const dateRef = `${monthStr}-${dayStr}`;

        if (i % 7 === 5) {
          cell.classList.add("text-blue-700", "font-bold"); // 土曜（青）
        } else if (i % 7 === 6 || holidays.includes(dateRef)) {
          cell.classList.add("text-red-700", "font-bold"); // 日曜・祝日（赤）
        } else {
          cell.classList.add("text-black", "font-bold"); // 平日
        }

        // 今日の日付ならキャラの色の丸をつける
        if (year === today.getFullYear() && month === today.getMonth() && dayNum === today.getDate()) {
          const circle = document.createElement("div");
          // 透明度50%、数字が隠れるくらいの大きさ(w-8 h-8)で中央配置
          circle.className = "absolute top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full opacity-50 z-0";
          circle.style.backgroundColor = charColor;
          cell.appendChild(circle);
          cell.classList.add("text-black"); // 今日は曜日にかかわらず見やすく
        }
      } else {
        // 来月の日付
        dayNum = i - startDay - daysInMonth + 1;
        cell.classList.add("text-gray-500", "bg-black/5"); // 灰色＆少し暗く
      }

      // 数字部分を描画
      const numSpan = document.createElement("span");
      numSpan.className = "relative z-10 mt-1";
      numSpan.textContent = dayNum;
      
      cell.appendChild(numSpan);
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
});
