// ================================
// Firebase
// ================================

import { db, auth } from "./firebase-config.js";

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  getDoc,
  addDoc,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ================================
// Notification DOM
// ================================
const badge = document.getElementById("notification-badge");
const panel = document.getElementById("notification-panel");
const notificationBtn = document.getElementById("notification-btn");
const notificationList = document.getElementById("notification-list");

// ================================
// List DOM
// ================================
const addPlannedBtn = document.getElementById("addPlannedBtn");
const plannedList = document.getElementById("plannedList");
const confirmedList = document.getElementById("confirmedList");
const doneList = document.getElementById("doneList");
const addConfirmedBtn =
  document.getElementById("addConfirmedBtn");


// ================================
// Modal DOM
// ================================
const detailModal = document.getElementById("detailModal");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const candidateList =
  document.getElementById("candidateList");

const addCandidateBtn =
  document.getElementById("addCandidateBtn");

const dateType = document.getElementById("dateType");

const fixedDate = document.getElementById("fixedDate");
const fixedTime = document.getElementById("fixedTime");

const fixedArea = document.getElementById("fixedArea");
const candidateArea = document.getElementById("candidateArea");
const rangeArea = document.getElementById("rangeArea");

const startDate = document.getElementById("startDate");
const startTime = document.getElementById("startTime");

const endDate = document.getElementById("endDate");
const endTime = document.getElementById("endTime");

// ================================
// Detail DOM
// ================================

const detailTitle = document.getElementById("detailTitle");
// ↓ Memo v2で削除予定
const detailDate = document.getElementById("detailDate");
const detailCategory = document.getElementById("detailCategory");
const detailMemo = document.getElementById("detailMemo");

// ================================
// Edit DOM
// ================================

const editTitle = document.getElementById("editTitle");
// ↓ Memo v2で削除予定
const editCategory = document.getElementById("editCategory");
const editMemo = document.getElementById("editMemo");

// ================================
// Button DOM
// ================================

const editPlanBtn = document.getElementById("editPlanBtn");
const confirmPlanBtn = document.getElementById("confirmPlanBtn");
const deletePlanBtn = document.getElementById("deletePlanBtn");

// ================================
// Accordion DOM
// ================================

const plannedToggle = document.getElementById("plannedToggle");
const plannedTitle = document.getElementById("plannedTitle");
const plannedContent = document.getElementById("plannedContent");

const confirmedToggle = document.getElementById("confirmedToggle");
const confirmedTitle = document.getElementById("confirmedTitle");
const confirmedContent = document.getElementById("confirmedContent");

const doneToggle = document.getElementById("doneToggle");
const doneTitle = document.getElementById("doneTitle");
const doneContent = document.getElementById("doneContent");

// ================================
// State
// ================================

let currentPlanId = null;
let notificationIds = [];
let currentStatus = "planned";



// ================================
// 初期化
// ================================

setupAccordion(
  plannedToggle,
  plannedTitle,
  plannedContent,
  "仮予定（0）"
);

setupAccordion(
  confirmedToggle,
  confirmedTitle,
  confirmedContent,
  "確定済（0）"
);

setupAccordion(
  doneToggle,
  doneTitle,
  doneContent,
  "済（0）"
);

function changeDateType() {

  fixedArea.classList.add("hidden");
  candidateArea.classList.add("hidden");
  rangeArea.classList.add("hidden");

  switch (dateType.value) {

    case "fixed":
      fixedArea.classList.remove("hidden");
      break;

    case "candidate":
      candidateArea.classList.remove("hidden");
      break;

    case "range":
      rangeArea.classList.remove("hidden");
      break;

    case "unknown":
      break;

  }

}

// ================================
// Utility
// ================================


function setupAccordion(toggle, title, content, text) {

  let opened = true;

  toggle.addEventListener("click", () => {

    opened = !opened;

    content.classList.toggle("hidden", !opened);

    title.textContent =
      `${opened ? "▼" : "▶"} ${text}`;

  });

}




function fillTimeSelect(select) {

  select.innerHTML = "";

  for (let h = 0; h < 24; h++) {

    for (let m = 0; m < 60; m += 10) {

      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");

      const option = document.createElement("option");

      option.value = `${hh}:${mm}`;
      option.textContent = `${hh}:${mm}`;

      select.appendChild(option);

    }

  }

}


function createCandidate() {

  const div = document.createElement("div");

  div.className =
    "border rounded-xl p-3 mb-2";

div.innerHTML = `
  <input
    type="date"
    class="candidateDate border rounded-lg p-2 w-full">

  <select
    class="candidateTime border rounded-lg p-2 w-full mt-2">
  </select>

  <button
    class="deleteCandidate mt-2 text-red-500">
    削除
  </button>
`;

  
// 今日21:00を初期値にする
const dateInput = div.querySelector(".candidateDate");
const timeSelect = div.querySelector(".candidateTime");

fillTimeSelect(timeSelect);

const now = new Date(); 
now.setHours(21, 0, 0, 0);

dateInput.value = now.toISOString().split("T")[0];
timeSelect.value = "21:00";

div.querySelector(".deleteCandidate")
  .addEventListener("click", () => {
    div.remove();
  });

candidateList.appendChild(div);
}
  




// ================================
// Modal
// ================================

function openPlan(plan, docId, mode) {

  currentPlanId = docId;

editPlanBtn.classList.remove("hidden");
deletePlanBtn.classList.remove("hidden");
  
  editTitle.value = plan.title || "";
  editCategory.value = plan.category || "";
  editMemo.value = plan.memo || "";

  // 追加
candidateList.innerHTML = "";

  // 日時
  if (plan.date) {

  const [date, time] = plan.date.split(" ");

  fixedDate.value = date.replace(/\//g, "-");
  fixedTime.value = time;

  dateType.value = "fixed";

}

else if (plan.range) {

  const [startDateValue, startTimeValue] =
    plan.range.start.split(" ");

  const [endDateValue, endTimeValue] =
    plan.range.end.split(" ");

  startDate.value = startDateValue.replace(/\//g, "-");
  startTime.value = startTimeValue;

  endDate.value = endDateValue.replace(/\//g, "-");
  endTime.value = endTimeValue;

  dateType.value = "range";

}

  else if (plan.candidates?.length) {

  dateType.value = "candidate";

  candidateList.innerHTML = "";

  plan.candidates.forEach(candidate => {

    createCandidate();

    const div = candidateList.lastElementChild;

    div.querySelector(".candidateDate").value = candidate.date;
    div.querySelector(".candidateTime").value = candidate.time;

  });

}

  changeDateType();
  
  switch (mode) {

    case "planned":
      confirmPlanBtn.textContent = "確定にする";
      break;

    case "confirmed":
      confirmPlanBtn.textContent = "済にする";
      break;

    case "done":
      confirmPlanBtn.textContent = "完了済";
      break;

  }

  detailModal.classList.remove("hidden");

}

function closeDetail() {

  detailModal.classList.add("hidden");

}


// ================================
// Save
// ================================

async function savePlan() {

  const title = editTitle.value || "無題の予定";
  const category = editCategory.value || "";
  const memo = editMemo.value || "";
  const type = dateType.value;

  let date = "未定";
  let range = null;

 

  // 新規作成
  if (!currentPlanId) {

  const candidates = [];

document.querySelectorAll("#candidateList > div").forEach(div => {

  const date = div.querySelector(".candidateDate").value;
  const time = div.querySelector(".candidateTime").value;

  if (date) {
    candidates.push({
      date,
      time
    });
  }

});
    
if (type === "fixed") {

  date =
    `${fixedDate.value.replace(/-/g, "/")} ${fixedTime.value}`;

}

if (type === "range") {

  range = {
    start: `${startDate.value.replace(/-/g, "/")} ${startTime.value}`,
    end: `${endDate.value.replace(/-/g, "/")} ${endTime.value}`
  };

}
    

  await addDoc(collection(db, "plans"), {
  title,
  date,
  candidates,
  range,
  category,
  status: detailModal.dataset.status || "planned",
  memo,
  createdAt: serverTimestamp()
});
  } 
  // 既存の予定
  else {

    const planDoc = await getDoc(doc(db, "plans", currentPlanId));

    if (!planDoc.exists()) return;

    const currentStatus = planDoc.data().status;

    let nextStatus = "confirmed";

    if (currentStatus === "confirmed") {
      nextStatus = "done";
    }

    await updateDoc(doc(db, "plans", currentPlanId), {
      status: nextStatus
    });

  }

  // 初期化
  editTitle.value = "";
  editCategory.value = "";
  editMemo.value = "";

  currentPlanId = null;

  closeDetail();

}


async function deletePlan() {

  if (!currentPlanId) return;

  if (!confirm("この予定を削除しますか？")) return;

  await deleteDoc(doc(db, "plans", currentPlanId));

  currentPlanId = null;

  closeDetail();

}





// ================================
// Plan
// ================================

function newPlan(status) {

currentPlanId = null;
currentStatus = status;

editPlanBtn.classList.add("hidden");
deletePlanBtn.classList.add("hidden");

editTitle.value = "";
candidateList.innerHTML = "";
editCategory.value = "";
editMemo.value = "";

const now = new Date();

fixedDate.value = now.toISOString().split("T")[0];
fixedTime.value = "21:00";

// 開始日時
startDate.value = now.toISOString().split("T")[0];
startTime.value = "21:00";

// 終了日時（翌日）
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);

endDate.value = tomorrow.toISOString().split("T")[0];
endTime.value = "21:00";

dateType.value = "fixed";
changeDateType();

confirmPlanBtn.textContent = "作成する";

detailModal.classList.remove("hidden");
}

async function editPlan() {

  if (!currentPlanId) return;

  const data = {
    title: editTitle.value,
    category: editCategory.value,
    memo: editMemo.value
  };

  // 一度日時データをリセット
  data.date = null;
  data.range = null;
  data.candidates = [];

  switch (dateType.value) {

    case "fixed":
      data.date =
        `${fixedDate.value.replace(/-/g, "/")} ${fixedTime.value}`;
      break;

    case "candidate":
      data.candidates = [];

      document.querySelectorAll("#candidateList > div").forEach(div => {

        const date = div.querySelector(".candidateDate").value;
        const time = div.querySelector(".candidateTime").value;

        if (date) {
          data.candidates.push({
            date,
            time
          });
        }

      });

      break;

    case "range":
      data.range = {
        start: `${startDate.value.replace(/-/g, "/")} ${startTime.value}`,
        end: `${endDate.value.replace(/-/g, "/")} ${endTime.value}`
      };
      break;

  }

  await updateDoc(doc(db, "plans", currentPlanId), data);

  closeDetail();

}


// ================================
// Event
// ================================

addPlannedBtn.addEventListener("click", () => newPlan("planned"));
addConfirmedBtn.addEventListener("click", () => newPlan("confirmed"));

editPlanBtn.addEventListener("click", editPlan);
confirmPlanBtn.addEventListener("click", savePlan);
deletePlanBtn.addEventListener("click", deletePlan);
closeDetailBtn.addEventListener("click", closeDetail);

dateType.addEventListener("change", changeDateType);



addCandidateBtn.addEventListener(
  "click",
  createCandidate
);

// ================================
// Firestore
// ================================


function loadPlanned() {

  const plansQuery = query(
    collection(db, "plans"),
    where("status", "==", "planned"),
    orderBy("createdAt", "desc")
  );

  
  onSnapshot(plansQuery, (snapshot) => {

    plannedList.innerHTML = "";

    plannedTitle.textContent =
      `▼ 仮予定（${snapshot.size}）`;

    snapshot.forEach((docSnap) => {

      const plan = docSnap.data();

      const div = document.createElement("div");

      div.className =
        "bg-white rounded-xl p-3 shadow cursor-pointer";

      div.innerHTML = `
${(() => {

  let dateText = "未定";

  if (plan.range) {
    dateText = `${plan.range.start} ～ ${plan.range.end}`;
  } else if (plan.candidates?.length) {
    dateText = `候補日 ${plan.candidates.length}件`;
  } else if (plan.date) {
    dateText = plan.date;
  }

  return `
    <div class="text-xs text-gray-500">
      📅 ${dateText}
    </div>
  `;

})()}

        <div class="font-bold text-[#5a4a42] mt-1">
          ${plan.title}
        </div>
      `;

      div.addEventListener("click", () => {
        openPlan(plan, docSnap.id, "planned");
      });

      plannedList.appendChild(div);

    });

  });

}

function loadConfirmed() {

  const confirmedQuery = query(
    collection(db, "plans"),
    where("status", "==", "confirmed"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(confirmedQuery, (snapshot) => {

    confirmedList.innerHTML = "";

    confirmedTitle.textContent =
      `▼ 確定済（${snapshot.size}）`;

    snapshot.forEach((docSnap) => {

      const plan = docSnap.data();

      const div = document.createElement("div");

      div.className =
        "bg-white rounded-xl p-3 shadow cursor-pointer";

      div.innerHTML = `
${(() => {

  let dateText = "未定";

  if (plan.range) {
    dateText = `${plan.range.start} ～ ${plan.range.end}`;
  } else if (plan.candidates?.length) {
    dateText = `候補日 ${plan.candidates.length}件`;
  } else if (plan.date) {
    dateText = plan.date;
  }

  return `
    <div class="text-xs text-gray-500">
      📅 ${dateText}
    </div>
  `;

})()}

        <div class="font-bold text-[#5a4a42] mt-1">
          ${plan.title}
        </div>
      `;

      div.addEventListener("click", () => {
        openPlan(plan, docSnap.id, "confirmed");
      });

      confirmedList.appendChild(div);

    });

  });

}

function loadDone() {

  const doneQuery = query(
    collection(db, "plans"),
    where("status", "==", "done"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(doneQuery, (snapshot) => {

    doneList.innerHTML = "";

    doneTitle.textContent =
      `▼ 済（${snapshot.size}）`;

    snapshot.forEach((docSnap) => {

      const plan = docSnap.data();

      const div = document.createElement("div");

     
      div.className =
        "bg-white rounded-xl p-3 shadow cursor-pointer opacity-70";

      div.innerHTML = `
${(() => {

  let dateText = "未定";

  if (plan.range) {
    dateText = `${plan.range.start} ～ ${plan.range.end}`;
  } else if (plan.candidates?.length) {
    dateText = `候補日 ${plan.candidates.length}件`;
  } else if (plan.date) {
    dateText = plan.date;
  }

  return `
    <div class="text-xs text-gray-500">
      📅 ${dateText}
    </div>
  `;

})()}

        <div class="font-bold text-[#5a4a42] mt-1 line-through">
          ${plan.title}
        </div>
      `;

      div.addEventListener("click", () => {
        openPlan(plan, docSnap.id, "done");
      });

      doneList.appendChild(div);

    });

  });

}

changeDateType();

//===============================
// Init
// ================================

// 固定日時の時間だけ初期化
fillTimeSelect(fixedTime);
fillTimeSelect(startTime);
fillTimeSelect(endTime);

changeDateType();

loadPlanned();
loadConfirmed();
loadDone();
