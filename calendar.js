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

    // グリッドの行数を動的に設定
    calendarDays.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;

    // 日付をマスに配置していく
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      // 各マス: 黒細線
      cell.className = "border-r border-b border-black relative overflow-hidden";

      // 今月の日付のみを描画 (来月・先月分は枠線のみの空マス)
      if (i >= startDay && i < startDay + daysInMonth) {
        const dayNum = i - startDay + 1;
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(dayNum).padStart(2, '0');
        const dateRef = `${monthStr}-${dayStr}`;
        const isToday = (year === today.getFullYear() && month === today.getMonth() && dayNum ===
