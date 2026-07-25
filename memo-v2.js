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

function openPlan(plan, docId, mode) {

  currentPlanId = docId;

  editTitle.value = plan.title || "";
  editCategory.value = plan.category || "";
  editMemo.value = plan.memo || "";

  // 後で新しい日時システムに置き換える
  const isUndecided = !plan.date || plan.date === "未定";

  document.getElementById("editDateUndecided").checked = isUndecided;
  editDate.disabled = isUndecided;

  if (!isUndecided) {
    editDate.value =
      plan.date.replace(/ /g, "T").replace(/\//g, "-");
  } else {
    editDate.value = "";
  }

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

async function savePlan() {

  const title = editTitle.value || "無題の予定";
  const category = editCategory.value || "";
  const memo = editMemo.value || "";

  const isUndecided =
    document.getElementById("editDateUndecided").checked;

  let date = "未定";

  if (!isUndecided && editDate.value) {
    date = editDate.value
      .replace("T", " ")
      .replace(/-/g, "/");
  }

  // 新規作成
  if (!currentPlanId) {

    await addDoc(collection(db, "plans"), {
      title,
      date,
      category,
      status: "planned",
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
  editDate.value = "";
  editCategory.value = "";
  editMemo.value = "";

  currentPlanId = null;

  closeDetail();

}

confirmPlanBtn.addEventListener("click", savePlan);

