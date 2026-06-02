document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const scheduleId = urlParams.get('id');
  
  if (!scheduleId) {
    alert("予定が見つかりません");
    window.location.href = 'calendar.html';
    return;
  }

  let schedules = JSON.parse(localStorage.getItem('cafe_schedules')) || [];
  const scheduleIndex = schedules.findIndex(s => s.id === scheduleId);
  const schedule = schedules[scheduleIndex];

  if (!schedule) {
    alert("予定が見つかりません");
    window.location.href = 'calendar.html';
    return;
  }

  document.getElementById('edit-header-title').textContent = `${schedule.text} の詳細`;
  const formContainer = document.getElementById('form-container');
  
  // 30分刻みの時間オプション生成
  const generateTimeOptions = (selectedTime) => {
    let options = `<option value="">未選択</option>`;
    for(let h=0; h<24; h++){
      for(let m of ['00', '30']){
        const timeStr = `${h}:${m}`;
        options += `<option value="${timeStr}" ${selectedTime===timeStr ? 'selected' : ''}>${timeStr}</option>`;
      }
    }
    return options;
  };

  // フォームHTMLの構築
  let html = "";

  // 【タイトル】(動画系・その他用)
  if (['横動画', 'ショート', 'コラボ', 'その他', '×', '〇'].includes(schedule.text)) {
    html += `
      <div class="flex flex-col gap-1">
        <label class="font-bold text-sm text-amber-900">【タイトル】</label>
        <input type="text" id="input-title" value="${schedule.title || ''}" class="border border-gray-300 p-2 rounded-lg outline-none focus:border-amber-500" placeholder="タイトルを入力">
      </div>
    `;
  }

  // 【コラボ相手】
  if (schedule.text === 'コラボ') {
    html += `
      <div class="flex flex-col gap-1">
        <label class="font-bold text-sm text-amber-900">【コラボ相手】</label>
        <input type="text" id="input-partner" value="${schedule.partner || ''}" class="border border-gray-300 p-2 rounded-lg outline-none focus:border-amber-500" placeholder="相手の名前">
      </div>
    `;
  }

  // 【時間】
  if (['コラボ', 'その他', '×', '〇'].includes(schedule.text)) {
    html += `
      <div class="flex flex-col gap-1">
        <label class="font-bold text-sm text-amber-900">【時間】</label>
        <select id="input-time" class="border border-gray-300 p-2 rounded-lg outline-none focus:border-amber-500 bg-white">
          ${generateTimeOptions(schedule.time)}
        </select>
      </div>
    `;
  }

  // 【メンバー (カラー選択兼任)】
  if (['コラボ', '横動画', 'ショート'].includes(schedule.text)) {
    const mems = schedule.members || [];
    html += `
      <div class="flex flex-col gap-2">
        <label class="font-bold text-sm text-amber-900">【メンバー (カラー反映)】</label>
        <div class="flex flex-wrap gap-3 text-sm">
          <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="cb-member" value="waka" ${mems.includes('waka')?'checked':''}> 若凪</label>
          <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="cb-member" value="yuzu" ${mems.includes('yuzu')?'checked':''}> 柚茶</label>
          <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="cb-member" value="lily" ${mems.includes('lily')?'checked':''}> Lily00</label>
          <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" class="cb-member" value="toru" ${mems.includes('toru')?'checked':''}> とるま</label>
          <label class="flex items-center gap-1 cursor-pointer font-bold ml-2"><input type="checkbox" id="cb-all"> ALL</label>
        </div>
      </div>
    `;
  }

  // 【カスタムカラー (その他)】
  if (['その他', '×', '〇'].includes(schedule.text)) {
    const col = schedule.customColor || '';
    html += `
      <div class="flex flex-col gap-2">
        <label class="font-bold text-sm text-amber-900">【背景カラー】</label>
        <div class="grid grid-cols-4 gap-2 text-xs">
          <label class="flex items-center justify-center p-2 rounded border cursor-pointer ${col==='#abc888'?'ring-2 ring-black':''}" style="background:#abc888"><input type="radio" name="customColor" value="#abc888" class="hidden">若凪色</label>
          <label class="flex items-center justify-center p-2 rounded border cursor-pointer ${col==='#fef263'?'ring-2 ring-black':''}" style="background:#fef263"><input type="radio" name="customColor" value="#fef263" class="hidden">柚茶色</label>
          <label class="flex items-center justify-center p-2 rounded border cursor-pointer ${col==='#a12722'?'ring-2 ring-white':''}" style="background:#a12722; color:white;"><input type="radio" name="customColor" value="#a12722" class="hidden">Lily色</label>
          <label class="flex items-center justify-center p-2 rounded border cursor-pointer ${col==='#968ABD'?'ring-2 ring-black':''}" style="background:#968ABD; color:white;"><input type="radio" name="customColor" value="#968ABD" class="hidden">とるま色</label>
          
          <label class="flex items-center justify-center p-2 rounded border cursor-pointer ${col==='#D4C4B7'?'ring-2 ring-black':''}" style="background:#D4C4B7"><input type="radio" name="customColor" value="#D4C4B7" class="hidden">モカ</label>
          <label class="flex items-center justify-center p-2 rounded border cursor-pointer ${col==='#B5C1B4'?'ring-2 ring-black':''}" style="background:#B5C1B4"><input type="radio" name="customColor" value="#B5C1B4" class="hidden">抹茶</label>
          <label class="flex items-center justify-center p-2 rounded border cursor-pointer ${col==='#C8B8D1'?'ring-2 ring-black':''}" style="background:#C8B8D1"><input type="radio" name="customColor" value="#C8B8D1" class="hidden">ラベンダー</label>
          <label class="flex items-center justify-center p-2 rounded border cursor-pointer ${col==='#AFC8E1'?'ring-2 ring-black':''}" style="background:#AFC8E1"><input type="radio" name="customColor" value="#AFC8E1" class="hidden">標準</label>
        </div>
      </div>
    `;
  }

  // 【詳細】(全共通)
  html += `
    <div class="flex flex-col gap-1 flex-1">
      <label class="font-bold text-sm text-amber-900">【詳細】</label>
      <textarea id="input-detail" class="border border-gray-300 p-2 rounded-lg outline-none focus:border-amber-500 flex-1 min-h-[120px] resize-none" placeholder="詳細を自由に記入してください">${schedule.detail || ''}</textarea>
    </div>
  `;

  formContainer.innerHTML = html;

  // ALLチェックボックスの挙動
  const cbAll = document.getElementById('cb-all');
  if (cbAll) {
    cbAll.addEventListener('change', (e) => {
      document.querySelectorAll('.cb-member').forEach(cb => cb.checked = e.target.checked);
    });
    // 4つ超えないように制御
    document.querySelectorAll('.cb-member').forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedCount = document.querySelectorAll('.cb-member:checked').length;
        if(checkedCount > 4) {
           alert("メンバーは最大4人までです");
           cb.checked = false;
        }
      });
    });
  }

  // カラーラジオボタンのUI制御
  document.querySelectorAll('input[name="customColor"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('input[name="customColor"]').forEach(r => {
        r.parentElement.classList.remove('ring-2', 'ring-black', 'ring-white');
      });
      const label = e.target.parentElement;
      if (e.target.value === '#a12722' || e.target.value === '#968ABD') {
        label.classList.add('ring-2', 'ring-white');
      } else {
        label.classList.add('ring-2', 'ring-black');
      }
    });
  });

  // 保存処理
  document.getElementById('save-btn').addEventListener('click', () => {
    if (document.getElementById('input-title')) schedule.title = document.getElementById('input-title').value;
    if (document.getElementById('input-partner')) schedule.partner = document.getElementById('input-partner').value;
    if (document.getElementById('input-time')) schedule.time = document.getElementById('input-time').value;
    if (document.getElementById('input-detail')) schedule.detail = document.getElementById('input-detail').value;
    
    if (document.querySelector('.cb-member')) {
      const selected = Array.from(document.querySelectorAll('.cb-member:checked')).map(cb => cb.value);
      schedule.members = selected;
    }
    
    if (document.querySelector('input[name="customColor"]:checked')) {
      schedule.customColor = document.querySelector('input[name="customColor"]:checked').value;
    }

    schedules[scheduleIndex] = schedule;
    localStorage.setItem('cafe_schedules', JSON.stringify(schedules));
    window.location.href = 'calendar.html';
  });

  // 戻る処理
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'calendar.html';
  });
});
