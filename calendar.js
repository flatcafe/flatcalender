import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
    
    let allSchedules = []; // Firestoreから取得した全スケジュールを保持

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ユーザー情報の取得
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            userName = userData.name || "ゲスト";
            charName = userData.characterName || "";
            charColor = userData.characterColor || "#DFC6B0";
          }
        } catch (e) {
          console.error("ユーザー情報の取得エラー:", e);
        }
        
        // スケジュールのリアルタイム監視（追加・変更・削除が自動反映される）
        onSnapshot(collection(db, "schedules"), (snapshot) => {
          allSchedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          updatePopupPosition();
          renderCalendar();
        });
      }
    });

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let holidaysData = {};
    fetch('https://holidays-jp.github.io/api/v1/date.json')
      .then(response => response.json())
      .then(data => {
        holidaysData = data;
        if (allSchedules.length > 0) renderCalendar();
      })
      .catch(error => console.warn("祝日データの取得に失敗しました:", error));

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

    function renderCalendar() {
      calendarDays.innerHTML = "";
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      monthDisplay.textContent = `${monthNames[month]} ${year}`;

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startDay = firstDay === 0 ? 6 : firstDay - 1;
      const rows = Math.max(5, Math.ceil((startDay + daysInMonth) / 7));
      const totalCells = rows * 7;

      calendarDays.style.gridTemplateRows = `repeat(${rows}, minmax(3rem, 1fr))`;

      for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement("div");
        cell.className = "border-r border-b border-black relative overflow-hidden flex flex-col items-center cursor-pointer min-h-[3rem]";
        
        if (i >= startDay && i < startDay + daysInMonth) {
          const dayNum = i - startDay + 1;
          const dateStr = getFormatDate(year, month, dayNum);
          const isToday = (year === today.getFullYear() && month === today.getMonth() && dayNum === today.getDate());

          if (dateStr === selectedDateStr) {
            cell.classList.add("ring-inset", "ring-4", "ring-amber-400", "bg-white/40");
          }

          cell.addEventListener("click", () => {
            selectedDateStr = dateStr;
            updatePopupPosition();
            setTimeout(() => {
              stampPopup.classList.remove("translate-y-full", "-translate-y-full");
            }, 10);
            renderCalendar();
          });

          let numClass = "text-xs z-10 relative font-bold";
          if (i % 7 === 5) {
            numClass += " text-blue-700";
          } else if (i % 7 === 6 || holidaysData[dateStr]) {
            numClass += " text-red-700";
          } else {
            numClass += " text-black";
          }

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

          let daySchedules = allSchedules.filter(s => s.date === dateStr);
          daySchedules.sort((a, b) => getSortScore(a) - getSortScore(b));

          const schedContainer = document.createElement("div");
          schedContainer.className = "mt-6 flex flex-col gap-[2px] px-0.5 w-full items-center z-20 pointer-events-none";

          daySchedules.forEach(sched => {
            const pill = document.createElement("div");
            pill.className = "pointer-events-auto w-full rounded-full leading-tight font-bold text-black py-[2px] px-1 text-center shadow-sm cursor-pointer flex flex-col items-center justify-center";
            
            const hasDetail = sched.detail && sched.detail.trim() !== "";
            const hasTitle = sched.title && sched.title.trim() !== "";
            const hasTime = sched.time && sched.time.trim() !== "";
            const hasPartner = sched.partner && sched.partner.trim() !== "";
            const hasMembers = sched.members && sched.members.length > 0;
            const star = (hasDetail || hasTitle || hasTime || hasPartner || hasMembers) ? "☆" : "";

            let mainText = sched.text;
            let subTextHtml = "";
            
            if (['横動画', 'ショート', 'コラボ', 'その他', '×', '〇'].includes(sched.text)) {
              if (sched.text === 'その他' && sched.title) {
                mainText = sched.title;
              } else if (sched.title) {
                subTextHtml = `<div class="text-[9px] font-normal opacity-90 truncate w-full">${sched.title}</div>`;
              }
            }

            pill.innerHTML = `<div class="text-[10px] truncate w-full">${mainText}${star}</div>${subTextHtml}`;

            if (sched.type === 'shift') {
              pill.style.backgroundColor = sched.authorColor;
              // 「休み」と「明け」の時に明度を下げて少し濃くする
              if (sched.text === '休み' || sched.text === '明け') {
                pill.style.filter = 'brightness(0.80)';
              }
            } else {
              if (sched.members && sched.members.length > 0) {
                pill.style.background = getGradient(sched.members);
              } else if (sched.customColor) {
                pill.style.backgroundColor = sched.customColor;
              } else {
                if (sched.text === '横動画') pill.style.backgroundColor = '#F0CCB9'; 
                else if (sched.text === 'ショート') pill.style.backgroundColor = '#D9E4DD';
                else if (sched.text === '〇' || sched.text === '×') pill.style.backgroundColor = sched.authorColor;
                else pill.style.backgroundColor = '#AFC8E1'; 
              }
            }

            let tapTimer = null;
            pill.addEventListener('click', (e) => {
              e.stopPropagation();
              if (tapTimer === null) {
                tapTimer = setTimeout(() => {
                  tapTimer = null;
                  openDetailModal(sched);
                }, 250);
              } else {
                clearTimeout(tapTimer);
                tapTimer = null;
                openActionModal(sched);
              }
            });

            schedContainer.appendChild(pill);
          });
          cell.appendChild(schedContainer);
        }
        calendarDays.appendChild(cell);
      }
    }

    function advanceSelectedDate() {
      if (!selectedDateStr) return;
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const nextDay = new Date(y, m - 1, d + 1);
      selectedDateStr = getFormatDate(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());
      if (nextDay.getMonth() !== currentDate.getMonth()) {
        currentDate = new Date(nextDay.getFullYear(), nextDay.getMonth(), 1);
      }
    }

     document.querySelectorAll('.stamp-btn').forEach(btn => {
       btn.addEventListener('click', async () => {
         if (!selectedDateStr) {
           alert("入力したい枠を選択してください！");
           return;
         }
         const type = btn.getAttribute('data-type');
         const text = btn.getAttribute('data-text');
         const detail = prompt("コメントを入力してね");
        
        await addDoc(collection(db, "schedules"), {
   date: selectedDateStr,
   type: type,
   text: text,
   detail: detail || "",
   author: userName,
   characterName: charName,
   authorColor: charColor,
   createdAt: new Date().toISOString()
 });
         await loadSchedules();
    renderCalendar();
  });
});
      
          
          // 日付を進めた後、手動でカレンダーを再描画してカーソル位置を反映させる
          advanceSelectedDate();
          renderCalendar(); 
          
        } catch (error) {
          console.error("保存エラー:", error);
          alert("予定の保存に失敗しました。");
        }
      });
    });

    let activeScheduleId = null;
    const deleteBtn = document.getElementById("sched-delete-btn");
    const editBtn = document.getElementById("sched-edit-btn");
    const cancelBtn = document.getElementById("sched-cancel-btn");

    function openDetailModal(schedule) {
      if(!detailModal || !detailContentArea) return;
      
      let html = `<div class="font-bold text-lg border-b border-gray-600 pb-2 mb-2 text-center">${schedule.text}</div>`;
      if (schedule.title) html += `<p><strong>【タイトル】</strong><br>${schedule.title}</p>`;
      if (schedule.partner) html += `<p><strong>【コラボ相手】</strong><br>${schedule.partner}</p>`;
      if (schedule.time) html += `<p><strong>【時間】</strong><br>${schedule.time}</p>`;
      
      if (schedule.members && schedule.members.length > 0) {
        const names = { waka: "若凪", yuzu: "柚茶", lily: "Lily00", toru: "とるま" };
        const displayMembers = schedule.members.map(m => names[m] || m).join(', ');
        html += `<p><strong>【メンバー】</strong><br>${displayMembers}</p>`;
      }
      if (schedule.detail) html += `<p><strong>【詳細】</strong><br><span class="whitespace-pre-wrap">${schedule.detail}</span></p>`;
      
      if(!schedule.title && !schedule.partner && !schedule.time && (!schedule.members || schedule.members.length === 0) && !schedule.detail){
         html += `<p class="text-gray-600 text-center py-2">詳細情報はありません</p>`;
      }

      detailContentArea.innerHTML = html;
      detailModal.classList.remove('hidden');
    }

    if (detailCloseBtn) {
      detailCloseBtn.addEventListener('click', () => detailModal.classList.add('hidden'));
    }

    function openActionModal(schedule) {
      if(!actionModal) return;
      activeScheduleId = schedule.id; // FirestoreのドキュメントID
      actionModal.classList.remove('hidden');

      const shiftTypes = ["休み", "日勤", "夜勤", "明け", "当直"];
      if (shiftTypes.includes(schedule.text) && schedule.author !== userName) {
        deleteBtn.classList.add('hidden');
      } else {
        deleteBtn.classList.remove('hidden');
      }
    }

    if(cancelBtn) cancelBtn.addEventListener('click', () => actionModal.classList.add('hidden'));
    
    if(deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if(!confirm("本当に削除しますか？")) return;
        try {
          // Firestoreから削除
          await deleteDoc(doc(db, "schedules", activeScheduleId));
          actionModal.classList.add('hidden');
        } catch (error) {
          console.error("削除エラー:", error);
          alert("削除に失敗しました。");
        }
      });
    }

    if(editBtn) {
      editBtn.addEventListener('click', () => {
        window.location.href = `schedule-edit.html?id=${activeScheduleId}`;
      });
    }

    if(prevBtn) prevBtn.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    if(nextBtn) nextBtn.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

  } catch (error) {
    alert("カレンダーの描画中にエラーが発生しました！\n" + error.message);
    console.error("カレンダーエラー:", error);
  }
});
