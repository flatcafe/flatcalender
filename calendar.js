document.addEventListener("DOMContentLoaded", () => {
  const monthDisplay = document.getElementById("month-display");
  const calendarDays = document.getElementById("calendar-days");
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");
  
  // スタンプメニュー関連
  const stampPopup = document.getElementById("stamp-popup");
  const actionModal = document.getElementById("schedule-action-modal");
  
  let currentDate = new Date();
  const today = new Date();
  
  // 現在選択されている日付 (YYYY-MM-DD)
  let selectedDateStr = null;

  // ログイン情報
  let userName = "ゲスト";
  let charColor = "#DFC6B0"; 
  try {
    const userDataStr = localStorage.getItem('cafe_user');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      userName = userData.name || "ゲスト";
      charColor = userData.characterColor || "#DFC6B0";
    }
  } catch (e) {
    console.error("データ読み込みエラー", e);
  }

  const holidays = ["01-01", "05-03", "05-04", "05-05", "11-03", "11-23"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // ロゴボタンを押したときの挙動（メニューバーが描画された後に取得）
  setTimeout(() => {
    const navLogo = document.getElementById("nav-logo");
    const navBar = document.querySelector("cafe-nav nav");
    
    if (navLogo && stampPopup && navBar) {
      // ポップアップをメニューバーの真上に配置
      const navHeight = navBar.offsetHeight;
      stampPopup.style.bottom = `${navHeight}px`;

      navLogo.addEventListener("click", (e) => {
        e.preventDefault(); // hrefへの遷移を防ぐ
        stampPopup.classList.toggle("translate-y-full");
      });
    }
  }, 100);

  // 日付のフォーマット (YYYY-MM-DD)
  function getFormatDate(year, monthIndex, day) {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // カレンダー描画
  function renderCalendar() {
    if (!calendarDays) return;
    calendarDays.innerHTML = "";
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const totalCellsNeeded = startDay + daysInMonth;
    const rows = Math.max(5, Math.ceil(totalCellsNeeded / 7));
    const totalCells = rows * 7;

    calendarDays.style.gridTemplateRows = `repeat(${rows}, minmax(3rem, 1fr))`;

    // 予定データの取得
    const schedules = JSON.parse(localStorage.getItem('cafe_schedules')) || [];

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      cell.className = "border-r border-b border-black relative overflow-hidden flex flex-col items-center cursor-pointer";
      
      if (i >= startDay && i < startDay + daysInMonth) {
        const dayNum = i - startDay + 1;
        const dateStr = getFormatDate(year, month, dayNum);
        const isToday = (year === today.getFullYear() && month === today.getMonth() && dayNum === today.getDate());

        // 枠が選択されている場合のデザイン
        if (dateStr === selectedDateStr) {
          cell.classList.add("ring-inset", "ring-4", "ring-amber-400", "bg-white/40");
        }

        // セルをタップしたら選択状態にする
        cell.addEventListener("click", () => {
          selectedDateStr = dateStr;
          renderCalendar();
        });

        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(dayNum).padStart(2, '0');
        const dateRef = `${monthStr}-${dayStr}`;

        let numClass = "text-xs z-10 relative font-bold";
        if (i % 7 === 5) { numClass += " text-blue-700"; } 
        else if (i % 7 === 6 || holidays.includes(dateRef)) { numClass += " text-red-700"; } 
        else { numClass += " text-black"; }

        // 数字ラッパー
        const wrapper = document.createElement("div");
        wrapper.className = "absolute top-1 left-1 w-5 h-5 flex items-center justify-center";

        if (isToday) {
          const circle = document.createElement("div");
          circle.className = "absolute inset-0 rounded-full opacity-50 z-0";
          circle.style.backgroundColor = charColor;
          wrapper.appendChild(circle);
        }

        const span = document.createElement("span");
        span.className = numClass;
        span.textContent = dayNum;
        wrapper.appendChild(span);
        cell.appendChild(wrapper);

        // --- 予定の表示エリア ---
        const daySchedules = schedules.filter(s => s.date === dateStr);
        const schedContainer = document.createElement("div");
        schedContainer.className = "mt-6 flex flex-col gap-[2px] px-0.5 w-full items-center z-20 pointer-events-none"; // pointer-events-noneで子要素にイベントを渡す

        daySchedules.forEach(sched => {
          const pill = document.createElement("div");
          pill.className = "pointer-events-auto text-[10px] w-full rounded-full leading-tight font-bold text-black py-[2px] px-1 truncate text-center shadow-sm cursor-pointer";
          pill.textContent = sched.text;
          
          // シフト系はキャラカラー、動画系は固定色
          if (sched.type === 'shift') {
            pill.style.backgroundColor = sched.authorColor;
          } else {
            pill.style.backgroundColor = "#AFC8E1";
          }

          // スマホ向けダブルタップ判定
          let lastTap = 0;
          pill.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
              e.preventDefault();
              e.stopPropagation();
              openActionModal(sched);
            }
            lastTap = currentTime;
          });

          // PC向けダブルクリック
          pill.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openActionModal(sched);
          });

          schedContainer.appendChild(pill);
        });

        cell.appendChild(schedContainer);
      }
      calendarDays.appendChild(cell);
    }
  }

  // --- 翌日へ自動移動する関数 ---
  function advanceSelectedDate() {
    if (!selectedDateStr) return;
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const nextDay = new Date(y, m - 1, d + 1);
    
    selectedDateStr = getFormatDate(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());

    // もし翌日が来月ならカレンダーの表示月もめくる
    if (nextDay.getMonth() !== currentDate.getMonth()) {
      currentDate = new Date(nextDay.getFullYear(), nextDay.getMonth(), 1);
    }
  }

  // --- スタンプ押下時の処理 ---
  document.querySelectorAll('.stamp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!selectedDateStr) {
        alert("カレンダーの日付をタップして、入力したい枠を選択してください！");
        return;
      }
      
      const type = btn.getAttribute('data-type');
      const text = btn.getAttribute('data-text');
      const schedules = JSON.parse(localStorage.getItem('cafe_schedules')) || [];
      
      schedules.push({
        id: Date.now().toString(),
        date: selectedDateStr,
        type: type,
        text: text,
        author: userName,
        authorColor: charColor
      });
      
      localStorage.setItem('cafe_schedules', JSON.stringify(schedules));
      
      advanceSelectedDate(); // 自動で翌日へ
      renderCalendar();      // 再描画
    });
  });

  // --- アクションモーダル制御 ---
  let activeScheduleId = null;
  const deleteBtn = document.getElementById("sched-delete-btn");
  const editBtn = document.getElementById("sched-edit-btn");
  const cancelBtn = document.getElementById("sched-cancel-btn");

  function openActionModal(schedule) {
    activeScheduleId = schedule.id;
    actionModal.classList.remove('hidden');

    const shiftTypes = ["休み", "日勤", "夜勤", "明け", "当直"];
    
    // 削除権限の判定（シフトかつ本人が書いたものでない場合は削除不可）
    if (shiftTypes.includes(schedule.text) && schedule.author !== userName) {
      deleteBtn.classList.add('hidden'); // ボタンを隠す
    } else {
      deleteBtn.classList.remove('hidden');
    }
  }

  cancelBtn.addEventListener('click', () => actionModal.classList.add('hidden'));
  
  deleteBtn.addEventListener('click', () => {
    let schedules = JSON.parse(localStorage.getItem('cafe_schedules')) || [];
    schedules = schedules.filter(s => s.id !== activeScheduleId);
    localStorage.setItem('cafe_schedules', JSON.stringify(schedules));
    actionModal.classList.add('hidden');
    renderCalendar();
  });

  editBtn.addEventListener('click', () => {
    // 将来的に詳細編集ページを作成したらパラメータを渡して遷移
    window.location.href = `schedule-edit.html?id=${activeScheduleId}`;
  });

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
