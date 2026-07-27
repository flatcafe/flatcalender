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
const editDate = document.getElementById("editDate");
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

// ================================
// Modal
// ================================

function openPlan(plan, docId, mode) {

  currentPlanId = docId;

  editTitle.value = plan.title || "";
  editCategory.value = plan.category || "";
  editMemo.value = plan.memo || "";

  // 後で新しい日時システムに置き換える


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
  const date = "未定";

 

  // 新規作成
  if (!currentPlanId) {

    await addDoc(collection(db, "plans"), {
      title,
      date,
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

function newPlan(status = "planned") {

  currentPlanId = null;

detailModal.dataset.status = status;
editTitle.value = "";
editCategory.value = "";
editMemo.value = "";

  confirmPlanBtn.textContent = "作成する";

  detailModal.classList.remove("hidden");

}


async function editPlan() {

  if (!currentPlanId) return;

  const title = editTitle.value;
  const category = editCategory.value;
  const memo = editMemo.value;

  const isUndecided =
    document.getElementById("editDateUndecided").checked;

  let date = "未定";

  if (!isUndecided && editDate.value) {
    date = editDate.value
      .replace("T", " ")
      .replace(/-/g, "/");
  }

  await updateDoc(doc(db, "plans", currentPlanId), {
    title,
    date,
    category,
    memo
  });

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
        <div class="text-xs text-gray-500">
          📅 ${plan.date || "未定"}
        </div>

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
        <div class="text-xs text-gray-500">
          📅 ${plan.date || "未定"}
        </div>

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
        <div class="text-xs text-gray-500">
          📅 ${plan.date || "未定"}
        </div>

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
//===============================
// Init
// ================================

loadPlanned();
loadConfirmed();
loadDone();
