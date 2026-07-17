// =================================================================
// 前端模組 4：評分、表單顯示、各階段流轉與唯讀追蹤
// 管理指派完整替換版：維持原橘色／米白／圓角樣式
// =================================================================

(function () {
  if (localStorage.getItem("hsz_eval_session")) {
    const style = document.createElement("style");
    style.id = "anti-flash-style";
    style.innerHTML =
      "#login-container{display:none!important}" +
      "#app-container{display:block!important}";
    document.head.appendChild(style);
  }
})();

const UI_STATUS = {
  MANAGER_NEW: "待門市店主管填寫",
  MANAGER_RECALLED: "門市店主管收回修改",
  MANAGER_RETURNED: "待門市店主管修改",
  EDU_NEW: "待教育中心填寫",
  EDU_RETURNED: "待教育中心修改",
  AREA_NEW: "待區主管審核",
  AREA_RETURNED: "待區主管修改",
  STUDENT: "待受評人員確認",
  VP_NEW: "待營業副總簽核",
  VP_RETURNED: "待營業副總修改",
  GM: "待總經理簽核",
  PDF_PENDING: "結案待PDF產生",
  CLOSED: "結案"
};

const metrics = [
  {
    id: 1,
    title: "責任感",
    ranges: [
      { label: "8 ~ 10 分", min: 8, max: 10, text: "責任感相當強，可以充分信賴，無須任何督促。" },
      { label: "6 ~ 7 分", min: 6, max: 7, text: "可獨自負責，處事穩健，須偶爾督促。" },
      { label: "3 ~ 5 分", min: 3, max: 5, text: "可以信賴，但須略加督促。" },
      { label: "1 ~ 2 分", min: 1, max: 2, text: "處事被動，不積極，必須有人經常加以督促。" }
    ]
  },
  {
    id: 2,
    title: "協調性",
    ranges: [
      { label: "8 ~ 10 分", min: 8, max: 10, text: "能主動與人協調，與上級、屬員維持和諧關係，同事極願與其合作。" },
      { label: "6 ~ 7 分", min: 6, max: 7, text: "能與人和諧相處，願接納他人意見而不固執，偶亦熱心助人。" },
      { label: "3 ~ 5 分", min: 3, max: 5, text: "雖不特別致力於他人協調，但亦不與他人發生爭執與摩擦。" },
      { label: "1 ~ 2 分", min: 1, max: 2, text: "缺乏協調，與同事間偶爾會摩擦。" }
    ]
  },
  {
    id: 3,
    title: "表達能力",
    ranges: [
      { label: "8 ~ 10 分", min: 8, max: 10, text: "文筆、言談、論理明確，能化繁為簡，密而不漏。" },
      { label: "6 ~ 7 分", min: 6, max: 7, text: "表達有條理，使人易於了解。" },
      { label: "3 ~ 5 分", min: 3, max: 5, text: "表達平平，大致可了解其意，不致引人誤解。" },
      { label: "1 ~ 2 分", min: 1, max: 2, text: "文筆生硬，言談欠明確，不易讓人了解。" }
    ]
  },
  {
    id: 4,
    title: "學習態度",
    ranges: [
      { label: "8 ~ 10 分", min: 8, max: 10, text: "針對可能發生之問題，積極求解，並予以解決。" },
      { label: "6 ~ 7 分", min: 6, max: 7, text: "針對突發狀況，能主動積極提出疑問並虛心求教。" },
      { label: "3 ~ 5 分", min: 3, max: 5, text: "能誠懇接受他人教導，但主動較弱。" },
      { label: "1 ~ 2 分", min: 1, max: 2, text: "不能主動學習，須加以督導。" }
    ]
  },
  {
    id: 5,
    title: "解決問題能力",
    ranges: [
      { label: "8 ~ 10 分", min: 8, max: 10, text: "能迅速謀求改善對策，無需督促即可完成。" },
      { label: "6 ~ 7 分", min: 6, max: 7, text: "具有解決問題之能力，但須督促完成。" },
      { label: "3 ~ 5 分", min: 3, max: 5, text: "能謀求改善之道，但無擔當之魄力。" },
      { label: "1 ~ 2 分", min: 1, max: 2, text: "無法迅速謀求改善對策，並有逃避之現象。" }
    ]
  },
  {
    id: 6,
    title: "個人儀容",
    ranges: [
      { label: "8 ~ 10 分", min: 8, max: 10, text: "整齊清潔，端正足為模範。" },
      { label: "6 ~ 7 分", min: 6, max: 7, text: "重視清潔衛生。" },
      { label: "3 ~ 5 分", min: 3, max: 5, text: "達到基本要求。" },
      { label: "1 ~ 2 分", min: 1, max: 2, text: "我行我素，須經常糾正才會改進。" }
    ]
  }
];

const educationScoreRules = [
  {
    id: "edu-score1",
    cardId: "edu-card-1",
    label: "職能積分得分",
    min: 0,
    max: 15,
    allowedValues: [0, 15]
  },
  {
    id: "edu-score2",
    cardId: "edu-card-2",
    label: "OJT完成篇數得分",
    min: 0,
    max: 10,
    allowedValues: [0, 10]
  },
  {
    id: "edu-score3",
    cardId: "edu-card-3",
    label: "每週進度回報得分",
    min: 0,
    max: 5,
    calculatorDriven: true
  },
  {
    id: "edu-score4",
    cardId: "edu-card-4",
    label: "培訓課程狀況得分",
    min: 0,
    max: 10,
    calculatorDriven: true
  }
];

window.areaAdjustMode = "none";
window.areaAdjustMagnitude = 0;
window.currentSelectedManagerCase = null;
window.trackingFormCache = [];
window.currentSelectedTrackingForm = null;
window.currentActionMode = "reject";
window.managerScoresLocked = true;
window.adminManagementMode = false;
window.managementAssigneeCache = [];
window.currentReopenSourceForm = null;

// 月考核派發管理資料。
window.monthlyDispatchDashboard = null;
window.monthlyDispatchRows = [];
window.monthlyDispatchCandidates = [];


// 教育中心扣分式計算器。
// V2仍只保存最後實得分，不增加工作表欄位。
window.eduWeeklyPenaltyCount = 0;
window.eduAttendancePenaltyCount = 0;
window.eduHomeworkLateDays = 0;
window.eduTrainingLegacyDeduction = 0;
window.eduTrainingPenaltyTouched = true;


/* ---------------------------------------------------------------
 * 初始化與動態介面調整
 * ------------------------------------------------------------- */

function ensureDynamicUiEnhancements() {
  ensureBasicInfoCard();
  ensureEducationLabels();
  ensureAreaAdjustmentButtons();
  ensureStudentConfirmationCheckbox();
  ensureGmCommentField();
  ensureForceResetOptions();
  ensureTrackingBox();
  ensurePdfActionBox();
  configureMonthlyDispatchAdminVisibility();

  const storeLabel = document.querySelector("#store-select-box label");
  if (storeLabel) {
    storeLabel.innerHTML =
      '<i class="fa-solid fa-user-check brand-text mr-1"></i> ' +
      "待我處理：請選擇受評人員考核表：";
  }

  const managerHeading = document.querySelector("#section-manager h3");
  if (managerHeading) {
    managerHeading.innerText =
      "第一關：門市店主管填寫（每項10%，共60%）";
  }

  const managerCommentLabel = document.querySelector(
    'label[for="manager-comment"]'
  );
  if (managerCommentLabel) {
    managerCommentLabel.innerText = "門市店主管綜合評語：";
  }
}

function ensureBasicInfoCard() {
  const card = document.getElementById("info-card-container");
  if (!card || card.dataset.upgraded === "1") return;

  card.dataset.upgraded = "1";
  card.className =
    "hidden bg-orange-50 border-2 border-orange-200 rounded-xl p-5 text-base";

  card.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
      <div><span class="font-bold text-gray-500">受評姓名：</span><span id="info-name" class="font-black text-gray-800">-</span></div>
      <div><span class="font-bold text-gray-500">店別／單位：</span><span id="info-store" class="font-black text-gray-800">-</span></div>
      <div><span class="font-bold text-gray-500">轄區：</span><span id="info-area" class="font-black text-gray-800">-</span></div>
      <div><span class="font-bold text-gray-500">轉任日期：</span><span id="info-transfer" class="font-black text-gray-800">-</span></div>
      <div><span class="font-bold text-gray-500">考核月份：</span><span id="info-month" class="font-black text-gray-800">-</span></div>
      <div><span class="font-bold text-orange-600">評核日期：</span><span id="info-eval-date" class="font-black text-orange-600">-</span></div>
      <div><span class="font-bold text-gray-500">考核單號：</span><span id="info-doc" class="font-black text-gray-800">-</span></div>
      <div><span class="font-bold text-gray-500">流程版本：</span><span id="info-version" class="font-black text-violet-700">R0</span></div>
      <div><span class="font-bold text-gray-500">原始單號：</span><span id="info-original-doc" class="font-black text-gray-800">-</span></div>
      <div class="sm:col-span-1 lg:col-span-3"><span class="font-bold text-gray-500">目前流程：</span><span id="info-status" class="font-black text-orange-600">-</span></div>
      <div id="info-reopen-row" class="hidden sm:col-span-2 lg:col-span-3 bg-violet-50 border border-violet-200 rounded-lg p-3"><span class="font-bold text-violet-700">重新開啟原因：</span><span id="info-reopen-reason" class="font-bold text-violet-900">-</span></div>
    </div>
  `;
}

function ensureEducationLabels() {
  const section = document.getElementById("section-edu");
  if (!section) return;

  section.dataset.upgraded = "1";

  const heading = section.querySelector("h3");
  if (heading) {
    heading.innerText =
      "第二關：教育中心填寫（學習成果階段，共40分）";
  }

  educationScoreRules.forEach((rule) => {
    const input = document.getElementById(rule.id);
    if (!input) return;

    if (
      Array.isArray(rule.allowedValues) ||
      rule.calculatorDriven
    ) {
      input.type = "hidden";
      return;
    }

    input.min = String(rule.min);
    input.max = String(rule.max);
    input.step = "1";
    input.inputMode = "numeric";
    input.setAttribute(
      "onkeydown",
      "return preventInvalidNonNegativeIntegerKey(event)"
    );
    input.setAttribute(
      "oninput",
      `handleEducationScoreInput(this, ${rule.max})`
    );
    input.setAttribute(
      "onblur",
      `handleEducationScoreInput(this, ${rule.max})`
    );
  });

  [
    ["edu-accum", "edu-accum-status"],
    ["edu-ojt", "edu-ojt-status"]
  ].forEach(([inputId, statusId]) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.min = "0";
    input.step = "1";
    input.inputMode = "numeric";
    input.setAttribute(
      "onkeydown",
      "return preventInvalidNonNegativeIntegerKey(event)"
    );
    input.setAttribute(
      "oninput",
      `handleEducationCountInput(this, '${statusId}')`
    );
    input.setAttribute(
      "onblur",
      `handleEducationCountInput(this, '${statusId}')`
    );
  });

  const comment = document.getElementById("edu-comment");
  if (comment) {
    comment.placeholder =
      "有異常請具體說明；沒有異常請填「無」";
  }

  // 新案件預設沒有扣分，因此第3項為5分、第4項為10分。
  // 載入既有案件時，後續會由loadEducationPenaltyFromScores重新換算。
  if (!String(document.getElementById("edu-score3")?.value || "").trim()) {
    resetEducationPenaltyCalculator();
  } else {
    updateEducationPenaltyCalculator();
  }

  updateEducationScoreCards();
}

function clampEducationPenalty_(value, max) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return 0;

  return Math.max(
    0,
    Math.min(Number(max), Math.trunc(numberValue))
  );
}

function canEditEducationPenalty_() {
  return Boolean(
    !isReadOnlyMode &&
    currentUser &&
    currentUser.role === "教育中心"
  );
}

function resetEducationPenaltyCalculator() {
  window.eduWeeklyPenaltyCount = 0;
  window.eduAttendancePenaltyCount = 0;
  window.eduHomeworkLateDays = 0;
  window.eduTrainingLegacyDeduction = 0;
  window.eduTrainingPenaltyTouched = true;

  const score3 = document.getElementById("edu-score3");
  const score4 = document.getElementById("edu-score4");

  if (score3) score3.value = "5";
  if (score4) score4.value = "10";

  updateEducationPenaltyCalculator();
}

function loadEducationPenaltyFromScores(score3Value, score4Value) {
  const score3Text = String(
    score3Value === null || score3Value === undefined
      ? ""
      : score3Value
  ).trim();

  const score4Text = String(
    score4Value === null || score4Value === undefined
      ? ""
      : score4Value
  ).trim();

  const score3 = Number(score3Text);
  const score4 = Number(score4Text);

  window.eduWeeklyPenaltyCount =
    score3Text !== "" &&
    Number.isInteger(score3) &&
    score3 >= 0 &&
    score3 <= 5
      ? 5 - score3
      : 0;

  window.eduAttendancePenaltyCount = 0;
  window.eduHomeworkLateDays = 0;

  if (
    score4Text !== "" &&
    Number.isInteger(score4) &&
    score4 >= 0 &&
    score4 <= 10
  ) {
    window.eduTrainingLegacyDeduction = 10 - score4;
    window.eduTrainingPenaltyTouched = false;
  } else {
    window.eduTrainingLegacyDeduction = 0;
    window.eduTrainingPenaltyTouched = true;
  }

  updateEducationPenaltyCalculator();
}

function changeEducationPenalty(type, delta) {
  if (!canEditEducationPenalty_()) return;

  const change = Number(delta) || 0;

  if (type === "weekly") {
    window.eduWeeklyPenaltyCount =
      clampEducationPenalty_(
        window.eduWeeklyPenaltyCount + change,
        5
      );
  } else {
    // 既有資料只保存實得分，沒有保存兩種扣分的分類。
    // 第一次調整任一分類時，改由本次輸入重新計算。
    if (!window.eduTrainingPenaltyTouched) {
      window.eduTrainingLegacyDeduction = 0;
      window.eduAttendancePenaltyCount = 0;
      window.eduHomeworkLateDays = 0;
      window.eduTrainingPenaltyTouched = true;
    }

    if (type === "attendance") {
      window.eduAttendancePenaltyCount =
        clampEducationPenalty_(
          window.eduAttendancePenaltyCount + change,
          10
        );
    }

    if (type === "homework") {
      window.eduHomeworkLateDays =
        clampEducationPenalty_(
          window.eduHomeworkLateDays + change,
          10
        );
    }
  }

  updateEducationPenaltyCalculator();
}

function updateEducationPenaltyCalculator() {
  const weeklyCount = clampEducationPenalty_(
    window.eduWeeklyPenaltyCount,
    5
  );

  const attendanceCount = clampEducationPenalty_(
    window.eduAttendancePenaltyCount,
    10
  );

  const homeworkDays = clampEducationPenalty_(
    window.eduHomeworkLateDays,
    10
  );

  const legacyDeduction = clampEducationPenalty_(
    window.eduTrainingLegacyDeduction,
    10
  );

  window.eduWeeklyPenaltyCount = weeklyCount;
  window.eduAttendancePenaltyCount = attendanceCount;
  window.eduHomeworkLateDays = homeworkDays;
  window.eduTrainingLegacyDeduction = legacyDeduction;

  const weeklyDeduction = weeklyCount;
  const weeklyFinal = Math.max(0, 5 - weeklyDeduction);

  const trainingDeduction = window.eduTrainingPenaltyTouched
    ? Math.min(10, attendanceCount + homeworkDays)
    : legacyDeduction;

  const trainingFinal = Math.max(0, 10 - trainingDeduction);

  const score3 = document.getElementById("edu-score3");
  const score4 = document.getElementById("edu-score4");

  if (score3) score3.value = String(weeklyFinal);
  if (score4) score4.value = String(trainingFinal);

  setText("edu-weekly-count", weeklyCount >= 5 ? "5+" : weeklyCount);
  setText("edu-weekly-deduction", weeklyDeduction);
  setText("edu-weekly-final", weeklyFinal);

  setText("edu-attendance-count", attendanceCount);
  setText("edu-homework-count", homeworkDays);
  setText("edu-training-deduction", trainingDeduction);
  setText("edu-training-final", trainingFinal);
  setText("edu-training-existing-deduction", legacyDeduction);

  const legacyNote = document.getElementById(
    "edu-training-existing-note"
  );

  if (legacyNote) {
    legacyNote.classList.toggle(
      "hidden",
      window.eduTrainingPenaltyTouched ||
      legacyDeduction === 0
    );
  }

  const editable = canEditEducationPenalty_();

  const buttonStates = [
    ["edu-weekly-minus", !editable || weeklyCount <= 0],
    ["edu-weekly-plus", !editable || weeklyCount >= 5],
    ["edu-attendance-minus", !editable || attendanceCount <= 0 || !window.eduTrainingPenaltyTouched],
    ["edu-attendance-plus", !editable || attendanceCount >= 10],
    ["edu-homework-minus", !editable || homeworkDays <= 0 || !window.eduTrainingPenaltyTouched],
    ["edu-homework-plus", !editable || homeworkDays >= 10]
  ];

  buttonStates.forEach(([id, disabled]) => {
    const button = document.getElementById(id);
    if (!button) return;

    button.disabled = Boolean(disabled);
    button.classList.toggle("opacity-40", Boolean(disabled));
    button.classList.toggle("cursor-not-allowed", Boolean(disabled));
  });

  updateEducationScoreCards();
  updateTotalScore();
}

function setEducationScoreOption(inputId, value) {
  const input = document.getElementById(inputId);

  if (
    !input ||
    input.disabled ||
    isReadOnlyMode ||
    !currentUser ||
    currentUser.role !== "教育中心"
  ) {
    return;
  }

  input.value = String(value);
  updateEducationScoreCards();
  updateTotalScore();
}

function preventInvalidNonNegativeIntegerKey(event) {
  const blockedKeys = ["e", "E", "+", "-", "."];

  if (blockedKeys.includes(event.key)) {
    event.preventDefault();
    return false;
  }

  return true;
}

function handleEducationScoreInput(input, max) {
  if (!input) return;

  const rawValue = String(input.value || "").trim();

  if (rawValue !== "" && !/^\d+$/.test(rawValue)) {
    markEducationInputState_(input, false);
  } else {
    const numberValue = Number(rawValue);
    const valid =
      rawValue !== "" &&
      Number.isInteger(numberValue) &&
      numberValue >= 0 &&
      numberValue <= Number(max);

    markEducationInputState_(
      input,
      rawValue === "" ? null : valid
    );
  }

  updateEducationScoreCards();
  updateTotalScore();
}

function handleEducationCountInput(input, statusId) {
  if (!input) return;

  const rawValue = String(input.value || "").trim();
  const numberValue = Number(rawValue);
  const valid =
    rawValue !== "" &&
    /^\d+$/.test(rawValue) &&
    Number.isInteger(numberValue) &&
    numberValue >= 0;

  markEducationInputState_(
    input,
    rawValue === "" ? null : valid
  );

  const status = document.getElementById(statusId);
  if (status) {
    if (rawValue === "") {
      status.innerText = "請輸入0以上整數";
      status.className = "text-xs font-bold text-gray-500 mt-2";
    } else if (valid) {
      status.innerText = `已填：${numberValue}`;
      status.className = "text-xs font-bold text-emerald-700 mt-2";
    } else {
      status.innerText = "格式錯誤：僅接受0以上整數";
      status.className = "text-xs font-bold text-red-600 mt-2";
    }
  }
}

function markEducationInputState_(input, valid) {
  input.classList.remove(
    "border-red-400",
    "bg-red-50",
    "border-emerald-400",
    "bg-emerald-50"
  );

  if (valid === true) {
    input.classList.add(
      "border-emerald-400",
      "bg-emerald-50"
    );
  } else if (valid === false) {
    input.classList.add(
      "border-red-400",
      "bg-red-50"
    );
  }
}

function updateEducationScoreCards() {
  let total = 0;

  educationScoreRules.forEach((rule) => {
    const input = document.getElementById(rule.id);
    const card = document.getElementById(rule.cardId);

    if (!input) return;

    const rawValue = String(input.value || "").trim();
    const numberValue = Number(rawValue);

    const valid = Array.isArray(rule.allowedValues)
      ? (
          rawValue !== "" &&
          Number.isInteger(numberValue) &&
          rule.allowedValues.includes(numberValue)
        )
      : (
          rawValue !== "" &&
          /^\d+$/.test(rawValue) &&
          Number.isInteger(numberValue) &&
          numberValue >= rule.min &&
          numberValue <= rule.max
        );

    if (valid) total += numberValue;

    if (Array.isArray(rule.allowedValues)) {
      rule.allowedValues.forEach((optionValue) => {
        const button = document.getElementById(
          `${rule.id}-option-${optionValue}`
        );

        if (!button) return;

        const selected =
          valid && Number(optionValue) === numberValue;

        button.className = selected
          ? "education-score-option px-5 py-3 rounded-xl border-2 border-orange-500 brand-bg text-white font-black text-lg shadow-md transition"
          : "education-score-option px-5 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-black text-lg hover:border-orange-400 transition";
      });
    }

    if (card) {
      card.classList.remove(
        "border-red-300",
        "bg-red-50/40",
        "border-emerald-300",
        "bg-emerald-50/40"
      );

      if (rawValue !== "" && valid) {
        card.classList.add(
          "border-emerald-300",
          "bg-emerald-50/40"
        );
      } else if (rawValue !== "" && !valid) {
        card.classList.add(
          "border-red-300",
          "bg-red-50/40"
        );
      }
    }
  });

  setText("edu-live-total", total);
}

function getValidEducationScore(id, max) {
  const value = getTrimmedValue(id);

  if (!isIntegerInRange(value, 0, max)) {
    return 0;
  }

  return Number(value);
}

function fillEducationNoIssue() {
  const comment = document.getElementById("edu-comment");
  if (!comment || comment.disabled) return;

  comment.value = "無";
  comment.focus();
}

function ensureAreaAdjustmentButtons() {
  const input = document.getElementById("area-adjust-score");
  if (!input || document.getElementById("area-adjust-controls")) return;

  input.type = "hidden";
  input.value = "0";

  const wrapper = document.createElement("div");
  wrapper.id = "area-adjust-controls";
  wrapper.className =
    "bg-white border border-sky-200 rounded-xl p-4 space-y-3";

  wrapper.innerHTML = `
    <p class="text-sm font-bold text-sky-800">請用按鈕選擇增減分：</p>
    <div class="flex flex-wrap gap-2">
      <button type="button" id="area-mode-plus" onclick="setAreaAdjustMode('plus')" class="px-4 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-700">加分</button>
      <button type="button" id="area-mode-none" onclick="setAreaAdjustMode('none')" class="px-4 py-2 rounded-xl border-2 border-orange-500 bg-orange-50 font-bold text-orange-700">不調整</button>
      <button type="button" id="area-mode-minus" onclick="setAreaAdjustMode('minus')" class="px-4 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-700">減分</button>
    </div>
    <div id="area-magnitude-buttons" class="flex flex-wrap gap-2"></div>
    <p class="text-sm font-black text-orange-600">目前增減分：<span id="area-adjust-display">0</span> 分</p>
  `;

  input.parentElement.appendChild(wrapper);

  const magnitudeBox = wrapper.querySelector("#area-magnitude-buttons");
  for (let i = 0; i <= 10; i++) {
    magnitudeBox.insertAdjacentHTML(
      "beforeend",
      `<button type="button" id="area-mag-${i}" onclick="setAreaAdjustMagnitude(${i})" class="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-bold text-gray-700">${i}分</button>`
    );
  }

  updateAreaAdjustButtons();
}

function ensureStudentConfirmationCheckbox() {
  const section = document.getElementById("section-student-confirm");
  const sigBlock = document.getElementById("sig-block-student");

  if (
    !section ||
    !sigBlock ||
    document.getElementById("student-confirm-check")
  ) {
    return;
  }

  const box = document.createElement("div");
  box.id = "student-confirm-box";
  box.className =
    "bg-white border-2 border-amber-300 rounded-xl p-4";

  box.innerHTML = `
    <label class="inline-flex items-start cursor-pointer">
      <input type="checkbox" id="student-confirm-check" class="mt-1 w-5 h-5 rounded text-orange-600 border-gray-300">
      <span class="ml-3 text-sm font-bold text-gray-800">本人已完整閱讀並確認以上考核內容。</span>
    </label>
  `;

  section.insertBefore(box, sigBlock);
}

function ensureGmCommentField() {
  const section = document.getElementById("section-gm");
  const sigBlock = document.getElementById("sig-block-gm");

  if (!section || !sigBlock || document.getElementById("gm-comment")) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.id = "gm-comment-wrapper";
  wrapper.className = "w-full";

  wrapper.innerHTML = `
    <label class="block text-sm font-bold text-purple-900 mb-1">總經理評語（選填）：</label>
    <textarea id="gm-comment" class="w-full p-3 border border-purple-200 rounded-xl text-base h-24 resize-none" placeholder="選填..."></textarea>
  `;

  section.insertBefore(wrapper, sigBlock);
}

function ensureTrackingBox() {
  if (document.getElementById("tracking-select-box")) {
    return;
  }

  const anchor =
    document.getElementById("reviewer-select-box") ||
    document.getElementById("store-select-box");

  if (!anchor || !anchor.parentNode) {
    return;
  }

  const box = document.createElement("div");
  box.id = "tracking-select-box";
  box.className =
    "bg-orange-50 p-4 rounded-xl border border-orange-200 space-y-2";

  box.innerHTML = `
    <label class="block text-base font-black text-orange-700">
      <i class="fa-solid fa-route mr-1"></i>
      已送出／流程追蹤
    </label>
    <select
      id="tracking-form-select"
      onchange="onTrackingFormChange()"
      class="w-full p-2.5 border border-orange-300 rounded-xl font-bold text-sm bg-white cursor-pointer"
    >
      <option value="">-- 目前尚無流程追蹤資料 --</option>
    </select>
  `;

  anchor.parentNode.insertBefore(
    box,
    anchor.nextSibling
  );
}


function ensurePdfActionBox() {
  if (document.getElementById("pdf-action-box")) {
    return;
  }

  const infoCard =
    document.getElementById("info-card-container");

  if (!infoCard || !infoCard.parentNode) {
    return;
  }

  const box = document.createElement("div");

  box.id = "pdf-action-box";
  box.className =
    "hidden bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3";

  box.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p class="font-black text-emerald-800">
          <i class="fa-solid fa-file-pdf mr-1"></i>
          結案 PDF
        </p>
        <p id="pdf-action-status" class="text-sm font-bold text-gray-600 mt-1">
          PDF狀態載入中
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          id="btn-open-current-pdf"
          onclick="openCurrentPdf()"
          class="hidden px-4 py-2 rounded-xl border border-emerald-300 bg-white text-emerald-800 font-bold hover:bg-emerald-100 transition"
        >
          <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i>
          開啟目前 PDF
        </button>

        <button
          type="button"
          id="btn-regenerate-current-pdf"
          onclick="manualRegeneratePDF()"
          class="hidden px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition"
        >
          <i class="fa-solid fa-rotate mr-1"></i>
          重新產生 PDF
        </button>
      </div>
    </div>
  `;

  infoCard.parentNode.insertBefore(
    box,
    infoCard.nextSibling
  );
}


function ensureForceResetOptions() {
  const select = document.getElementById("force-reset-select");
  if (!select || select.dataset.upgraded === "1") return;

  select.dataset.upgraded = "1";
  select.setAttribute(
    "onchange",
    "loadManagementAssignees()"
  );

  select.innerHTML = `
    <option value="">-- 請選取欲強制流轉至哪一個階段 --</option>
    <option value="${UI_STATUS.MANAGER_RETURNED}">退回【待門市店主管修改】</option>
    <option value="${UI_STATUS.EDU_NEW}">轉至【待教育中心填寫】</option>
    <option value="${UI_STATUS.AREA_NEW}">轉至【待區主管審核】</option>
    <option value="${UI_STATUS.STUDENT}">轉至【待受評人員確認】</option>
    <option value="${UI_STATUS.VP_NEW}">轉至【待營業副總簽核】</option>
    <option value="${UI_STATUS.GM}">直接轉至【待總經理簽核】</option>
    <option value="${UI_STATUS.CLOSED}">直接【結案並產生PDF】</option>
  `;
}


/* ---------------------------------------------------------------
 * 門市店主管六項評分
 * ------------------------------------------------------------- */

function renderMetrics() {
  ensureDynamicUiEnhancements();

  const section = document.getElementById("score-section");
  if (!section) return;

  section.innerHTML = "";

  metrics.forEach((metric) => {
    let rangesHTML = "";

    metric.ranges.forEach((range) => {
      let scoreButtons = "";

      for (let score = range.min; score <= range.max; score++) {
        scoreButtons += `
          <button
            type="button"
            onclick="selectExactScore(event, ${metric.id}, ${score}, ${range.min}, ${range.max})"
            id="btn-score-${metric.id}-${score}"
            class="px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-700 hover:border-orange-500 transition"
          >${score}分</button>
        `;
      }

      rangesHTML += `
        <div
          id="range-card-${metric.id}-${range.min}-${range.max}"
          class="p-4 border border-gray-200 rounded-xl bg-white transition duration-150"
        >
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">${range.label}</span>
            <span id="check-icon-${metric.id}-${range.min}-${range.max}" class="text-orange-500 hidden">
              <i class="fa-solid fa-circle-check text-sm"></i>
            </span>
          </div>
          <p class="text-sm text-gray-700 font-medium mb-3">${range.text}</p>
          <div class="flex flex-wrap gap-2">${scoreButtons}</div>
        </div>
      `;
    });

    section.innerHTML += `
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div class="flex justify-between items-center border-b pb-2">
          <span class="font-black text-gray-800 text-base flex items-center">
            <span class="w-1.5 h-5 brand-bg mr-2 rounded-full"></span>
            ${metric.id}. ${metric.title}
          </span>
          <span id="final-badge-${metric.id}" class="text-xs font-black bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">未評分</span>
        </div>
        <div class="grid grid-cols-1 gap-3">${rangesHTML}</div>
      </div>
    `;
  });
}

function clickRangeCard() {
  // 刻意不自動選分。
  // 必須點選實際的分數按鈕，避免區間最高分被誤帶入。
}

function selectExactScore(
  event,
  metricId,
  score,
  min,
  max,
  force = false
) {
  if (event) event.stopPropagation();

  // 六項門市店主管評分只有門市店主管編輯階段可操作。
  // 教育中心、區主管及其他階層即使正在填自己的區塊，也維持唯讀。
  if (
    !force &&
    (
      isReadOnlyMode ||
      window.managerScoresLocked
    )
  ) {
    return;
  }

  const previousScore = selectedScores[metricId];

  if (previousScore) {
    const previousButton = document.getElementById(
      `btn-score-${metricId}-${previousScore}`
    );

    if (previousButton) {
      previousButton.className =
        "px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-700 hover:border-orange-500 transition";
    }
  }

  if (activeRanges[metricId]) {
    const previousKey = activeRanges[metricId];
    const previousCard = document.getElementById(
      `range-card-${metricId}-${previousKey}`
    );
    const previousCheck = document.getElementById(
      `check-icon-${metricId}-${previousKey}`
    );

    if (previousCard) {
      previousCard.className =
        "p-4 border border-gray-200 rounded-xl bg-white transition duration-150";
    }

    if (previousCheck) {
      previousCheck.classList.add("hidden");
    }
  }

  const key = `${min}-${max}`;
  const currentCard = document.getElementById(
    `range-card-${metricId}-${key}`
  );
  const currentCheck = document.getElementById(
    `check-icon-${metricId}-${key}`
  );
  const currentButton = document.getElementById(
    `btn-score-${metricId}-${score}`
  );

  if (currentCard) {
    currentCard.className =
      "p-4 border-2 border-orange-500 rounded-xl bg-orange-50/50 ring-2 ring-orange-200 transition duration-150";
  }

  if (currentCheck) {
    currentCheck.classList.remove("hidden");
  }

  if (currentButton) {
    currentButton.className =
      "px-4 py-1.5 brand-bg text-white border-transparent rounded-full text-xs font-bold shadow-md transition";
  }

  selectedScores[metricId] = score;
  activeRanges[metricId] = key;

  const badge = document.getElementById(
    `final-badge-${metricId}`
  );

  if (badge) {
    badge.innerText = `${score} 分`;
    badge.className =
      "text-xs font-black brand-bg text-white px-2.5 py-1 rounded-full shadow-sm";
  }

  updateTotalScore();
}

function highlightMetricScores(scoresArray) {
  if (!Array.isArray(scoresArray)) return;

  for (let i = 1; i <= 6; i++) {
    const score = Number(scoresArray[i - 1]);

    if (!Number.isInteger(score) || score < 1 || score > 10) {
      continue;
    }

    const metric = metrics.find((item) => item.id === i);
    const range = metric.ranges.find(
      (item) => score >= item.min && score <= item.max
    );

    if (range) {
      selectExactScore(
        null,
        i,
        score,
        range.min,
        range.max,
        true
      );
    }
  }
}


/* ---------------------------------------------------------------
 * 分數運算與區主管按鈕
 * ------------------------------------------------------------- */

function updateTotalScore() {
  let managerTotal = 0;

  for (let i = 1; i <= 6; i++) {
    const score = Number(selectedScores[i]);
    if (Number.isFinite(score)) managerTotal += score;
  }

  const edu1 = getValidEducationScore("edu-score1", 15);
  const edu2 = getValidEducationScore("edu-score2", 10);
  const edu3 = getValidEducationScore("edu-score3", 5);
  const edu4 = getValidEducationScore("edu-score4", 10);
  const educationTotal = edu1 + edu2 + edu3 + edu4;

  setText("edu-live-total", educationTotal);

  let adjustValue = getNumericValue("area-adjust-score");

  if (
    (isReadOnlyMode ||
      !currentUser ||
      currentUser.role !== "區主管") &&
    window.loadedAdjustValue !== undefined
  ) {
    adjustValue = Number(window.loadedAdjustValue) || 0;
  }

  setText("sum-mgr", managerTotal);
  setText("sum-grand-edu", educationTotal);
  setText(
    "sum-adjust",
    `${adjustValue >= 0 ? "+" : ""}${adjustValue}`
  );

  let grandTotal =
    managerTotal + educationTotal + adjustValue;

  grandTotal = Math.max(0, Math.min(100, grandTotal));
  setText("sum-grand", grandTotal);
}

function setAreaAdjustMode(mode) {
  if (isReadOnlyMode) return;

  window.areaAdjustMode = mode;

  if (mode === "none") {
    window.areaAdjustMagnitude = 0;
  }

  applyAreaAdjustValue();
  updateAreaAdjustButtons();
}

function setAreaAdjustMagnitude(value) {
  if (isReadOnlyMode) return;

  window.areaAdjustMagnitude = Number(value) || 0;
  applyAreaAdjustValue();
  updateAreaAdjustButtons();
}

function applyAreaAdjustValue() {
  const input = document.getElementById("area-adjust-score");
  if (!input) return;

  let value = 0;

  if (window.areaAdjustMode === "plus") {
    value = Math.abs(window.areaAdjustMagnitude);
  } else if (window.areaAdjustMode === "minus") {
    value = -Math.abs(window.areaAdjustMagnitude);
  }

  input.value = String(value);
  setText(
    "area-adjust-display",
    `${value >= 0 ? "+" : ""}${value}`
  );
  updateTotalScore();
}

function setAreaAdjustmentFromValue(value, readOnly) {
  const numericValue = Number(value) || 0;

  if (numericValue > 0) {
    window.areaAdjustMode = "plus";
    window.areaAdjustMagnitude = numericValue;
  } else if (numericValue < 0) {
    window.areaAdjustMode = "minus";
    window.areaAdjustMagnitude = Math.abs(numericValue);
  } else {
    window.areaAdjustMode = "none";
    window.areaAdjustMagnitude = 0;
  }

  const input = document.getElementById("area-adjust-score");
  if (input) input.value = String(numericValue);

  window.loadedAdjustValue = numericValue;
  updateAreaAdjustButtons(Boolean(readOnly));
  setText(
    "area-adjust-display",
    `${numericValue >= 0 ? "+" : ""}${numericValue}`
  );
  updateTotalScore();
}

function updateAreaAdjustButtons(forceDisabled = false) {
  const modeIds = ["plus", "none", "minus"];

  modeIds.forEach((mode) => {
    const button = document.getElementById(
      `area-mode-${mode}`
    );

    if (!button) return;

    const selected = window.areaAdjustMode === mode;

    button.className = selected
      ? "px-4 py-2 rounded-xl border-2 border-orange-500 bg-orange-50 font-bold text-orange-700"
      : "px-4 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-700";

    button.disabled = forceDisabled;
  });

  for (let i = 0; i <= 10; i++) {
    const button = document.getElementById(`area-mag-${i}`);
    if (!button) continue;

    const selected =
      Number(window.areaAdjustMagnitude) === i;

    button.className = selected
      ? "px-3 py-1.5 rounded-full brand-bg text-white text-sm font-bold shadow"
      : "px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-bold text-gray-700";

    button.disabled =
      forceDisabled ||
      window.areaAdjustMode === "none";
  }
}


/* ---------------------------------------------------------------
 * 表單重設與簽名區塊
 * ------------------------------------------------------------- */

function resetFormFields() {
  ensureDynamicUiEnhancements();

  selectedScores = {};
  activeRanges = {};
  isReadOnlyMode = false;
  window.currentFormRowIndex = 0;
  window.currentSelectedManagerCase = null;
  window.currentSelectedTrackingForm = null;
  window.currentSelectedPdfForm = null;
  window.currentActionMode = "reject";
  window.managerScoresLocked = true;
  window.loadedAdjustValue = 0;
  window.areaAdjustMode = "none";
  window.areaAdjustMagnitude = 0;

  renderMetrics();

  const managerComment = document.getElementById(
    "manager-comment"
  );

  if (managerComment) {
    managerComment.value = "";
    managerComment.disabled = false;
    managerComment.className =
      "w-full p-4 border border-gray-300 rounded-xl text-base h-32 resize-none";
  }

  [
    "edu-score1",
    "edu-score2",
    "edu-score3",
    "edu-score4",
    "edu-accum",
    "edu-ojt",
    "edu-comment",
    "area-adjust-score",
    "area-comment",
    "vp-comment",
    "gm-comment"
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    element.value = "";
    element.disabled = false;
    element.classList.remove(
      "bg-gray-100",
      "text-gray-500"
    );
  });

  const studentCheck = document.getElementById(
    "student-confirm-check"
  );

  if (studentCheck) {
    studentCheck.checked = false;
    studentCheck.disabled = false;
  }

  hideElement("readonly-banner");
  hideElement("pdf-action-box");
  setText("banner-text", "");
  hideElement("btn-reject-main");

  [
    "section-edu",
    "section-area",
    "section-student-confirm",
    "section-vp",
    "section-gm"
  ].forEach(hideElement);

  restoreAllSignatureBlocks();
  setAreaAdjustmentFromValue(0, false);
  resetEducationPenaltyCalculator();
  updateEducationScoreCards();
  handleEducationCountInput(
    document.getElementById("edu-accum"),
    "edu-accum-status"
  );
  handleEducationCountInput(
    document.getElementById("edu-ojt"),
    "edu-ojt-status"
  );
  updateTotalScore();
}

function restoreAllSignatureBlocks() {
  restoreSignatureBlock("店長");
  restoreSignatureBlock("教育中心");
  restoreSignatureBlock("區主管");
  restoreSignatureBlock("學員");
  restoreSignatureBlock("營業副總");
  restoreSignatureBlock("總經理");
}

function restoreSignatureBlock(role) {
  const config = getSignatureConfig(role);
  if (!config) return;

  const container = document.getElementById(config.blockId);
  if (!container) return;

  container.innerHTML = `
    <label class="block text-sm font-bold text-gray-700">${config.label}</label>
    <div id="${config.savedBoxId}" class="hidden mb-2">
      <label class="inline-flex items-center cursor-pointer py-1">
        <input
          type="checkbox"
          id="${config.checkboxId}"
          onchange="toggleSignatureType('${config.canvasId}', '${config.checkboxId}')"
          class="w-5 h-5 rounded text-orange-600 border-gray-300"
        >
        <span class="ml-2 text-sm font-bold text-gray-700">使用系統預存簽名確認</span>
      </label>
    </div>
    <div
      id="canvas-wrapper-${config.canvasId}"
      class="relative bg-white border-2 border-gray-300 rounded-xl overflow-hidden h-44 w-full"
    >
      <canvas
        id="${config.canvasId}"
        width="1000"
        height="250"
        class="w-full h-full block bg-white cursor-crosshair"
      ></canvas>
      <button
        type="button"
        onclick="clearSig('${config.canvasId}')"
        class="absolute bottom-2 right-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg"
      >清除</button>
    </div>
  `;

  initCanvasDevice(config.canvasId);
}

function getSignatureConfig(role) {
  const map = {
    店長: {
      blockId: "sig-block-manager",
      savedBoxId: "saved-sig-box",
      checkboxId: "use-saved-sig",
      canvasId: "signature-canvas",
      label: "門市店主管簽名："
    },
    教育中心: {
      blockId: "sig-block-edu",
      savedBoxId: "saved-sig-box-edu",
      checkboxId: "use-saved-sig-edu",
      canvasId: "signature-canvas-edu",
      label: "教育中心成員簽名："
    },
    區主管: {
      blockId: "sig-block-area",
      savedBoxId: "saved-sig-box-area",
      checkboxId: "use-saved-sig-area",
      canvasId: "signature-canvas-area",
      label: "區主管簽名："
    },
    學員: {
      blockId: "sig-block-student",
      savedBoxId: "saved-sig-box-student",
      checkboxId: "use-saved-sig-student",
      canvasId: "signature-canvas-student",
      label: "受評人員簽名："
    },
    營業副總: {
      blockId: "sig-block-vp",
      savedBoxId: "saved-sig-box-vp",
      checkboxId: "use-saved-sig-vp",
      canvasId: "signature-canvas-vp",
      label: "營業副總簽名："
    },
    總經理: {
      blockId: "sig-block-gm",
      savedBoxId: "saved-sig-box-gm",
      checkboxId: "use-saved-sig-gm",
      canvasId: "signature-canvas-gm",
      label: "總經理簽名："
    }
  };

  return map[role] || null;
}


/* ---------------------------------------------------------------
 * 門市店主管案件清單與顯示
 * ------------------------------------------------------------- */

function loadUnderlings(store) {
  configureMonthlyDispatchAdminVisibility();
  callAPI(
    "getUnderlings",
    {
      store: store,
      empId: currentUser ? currentUser.empId : ""
    },
    (list) => {
    const allCases = Array.isArray(list) ? list : [];

    // 門市店主管的待辦與追蹤正式分開。
    subordinateCache = allCases.filter(
      (item) => item.canEdit
    );

    const select = document.getElementById(
      "underling-select"
    );

    if (!select) return;

    const underlingPlaceholder = subordinateCache.length > 0
      ? `-- 目前共有 ${subordinateCache.length} 筆 --`
      : "-- 目前無考核表資料 --";

    select.innerHTML = `
      <option value="">${underlingPlaceholder}</option>
    `;

    subordinateCache.forEach((item) => {
      select.insertAdjacentHTML(
        "beforeend",
        `<option value="${item.rowIndex}">
          【${item.month}｜${item.evaluationNo}】${item.storeDisplay}－${item.name}［${item.currentStatus}］
        </option>`
      );
    });

    updateSubmitButtonText();
    loadTrackingList();
    loadHistoryList();
  });
}

function onUnderlingChange() {
  resetFormFields();

  const select = document.getElementById(
    "underling-select"
  );

  if (!select || !select.value) {
    lockAllWorkflow();
    return;
  }

  const rowIndex = Number(select.value);
  const form = subordinateCache.find(
    (item) => Number(item.rowIndex) === rowIndex
  );

  if (!form) {
    alert("找不到這張考核表，請重新整理頁面。");
    lockAllWorkflow();
    return;
  }

  window.currentSelectedManagerCase = form;
  window.currentFormRowIndex = form.rowIndex;

  fillBasicInfo(form);
  showElement("info-card-container");
  showElement("score-summary-card");
  showElement("workflow-box");
  showElement("section-manager");

  if (form.historyData && form.alreadyEval) {
    highlightMetricScores(form.historyData.scores);
    setValue(
      "manager-comment",
      form.historyData.comment || ""
    );
  }

  if (form.canEdit) {
    isReadOnlyMode = false;
    window.managerScoresLocked = false;

    // 被受評人員退回後，教育中心與區主管既有內容必須保留並顯示。
    // 門市店主管只開放修改自己的六項分數、評語與簽名，
    // 後續已完成內容一律維持唯讀。
    renderCompletedLaterSections(
      convertManagerCaseToForm(form)
    );

    const managerComment = document.getElementById(
      "manager-comment"
    );

    if (managerComment) {
      managerComment.disabled = false;
      managerComment.classList.remove("bg-gray-100");
    }

    restoreSignatureBlock("店長");
    setupGlobalSavedSignature();

    showElement("btn-submit-main");

    if (
      form.currentStatus === UI_STATUS.MANAGER_RECALLED ||
      form.currentStatus === UI_STATUS.MANAGER_RETURNED
    ) {
      showReadOnlyBanner(
        `此表單目前為「${form.currentStatus}」，原評分、評語與簽名已保留，可修改後重新送出。`,
        "editable"
      );
    } else {
      hideElement("readonly-banner");
    }

    hideElement("btn-reject-main");
  } else {
    isReadOnlyMode = true;
    window.managerScoresLocked = true;

    const managerComment = document.getElementById(
      "manager-comment"
    );

    if (managerComment) {
      managerComment.disabled = true;
      managerComment.classList.add("bg-gray-100");
    }

    document.getElementById(
      "sig-block-manager"
    ).innerHTML = getSigHTML(
      "門市店主管",
      form.historyData ? form.historyData.sig : "",
      form.evalDate
    );

    hideElement("btn-submit-main");

    showReadOnlyBanner(
      `此表單已送出，目前流程為「${form.currentStatus}」。`
    );

    if (form.canRecall) {
      const recallButton = document.getElementById(
        "btn-reject-main"
      );

      if (recallButton) {
        recallButton.className =
          "bg-amber-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg text-lg hover:bg-amber-600 transition sm:w-1/3";

        recallButton.innerHTML =
          '<i class="fa-solid fa-rotate-left mr-2"></i>收回修改';

        showElement("btn-reject-main");
      }
    }

    renderCompletedLaterSections(
      convertManagerCaseToForm(form)
    );
  }

  updateTotalScore();
}


/* ---------------------------------------------------------------
 * 其他角色：待辦、監控、歷史
 * ------------------------------------------------------------- */

function reloadPendingList() {
  lockAllWorkflow();

  const select = document.getElementById(
    "pending-form-select"
  );

  if (select) select.value = "";

  callAPI(
    "getPendingForms",
    {
      role: currentUser.role,
      dept: currentUser.dept,
      area: currentUser.area,
      empId: currentUser.empId
    },
    (list) => {
      pendingFormCache = Array.isArray(list) ? list : [];

      if (select) {
        const pendingPlaceholder = pendingFormCache.length > 0
          ? `-- 目前共有 ${pendingFormCache.length} 筆 --`
          : "-- 目前無考核表資料 --";

        select.innerHTML = `
          <option value="">${pendingPlaceholder}</option>
        `;

        pendingFormCache.forEach((form, index) => {
          select.insertAdjacentHTML(
            "beforeend",
            `<option value="${index}">【${form.month}｜${form.docId}】${form.storeDisplay || form.store}－${form.underlingName}［${form.currentStatus}］</option>`
          );
        });
      }

      updateSubmitButtonText();
      loadTrackingList();
      loadHistoryList();
      loadProgressMonitor();
      loadMonthlyDispatchDashboard();
    }
  );
}

function loadTrackingList() {
  ensureTrackingBox();

  if (!currentUser) {
    return;
  }

  const trackingBox =
    document.getElementById(
      "tracking-select-box"
    );

  // 總經理不使用「已送出／流程追蹤」。
  // 總經理以「待我處理＋全公司進行中監控＋歷史資料」查看。
  if (currentUser.role === "總經理") {
    if (trackingBox) {
      trackingBox.classList.add("hidden");
    }

    window.trackingFormCache = [];
    return;
  }

  if (trackingBox) {
    trackingBox.classList.remove("hidden");
  }

  callAPI(
    "getTrackingForms",
    {
      role: currentUser.role,
      dept: currentUser.dept,
      area: currentUser.area,
      empId: currentUser.empId,
      store: currentUser.store
    },
    (list) => {
      window.trackingFormCache =
        Array.isArray(list) ? list : [];

      const select = document.getElementById(
        "tracking-form-select"
      );

      if (!select) return;

      if (window.trackingFormCache.length === 0) {
        select.innerHTML = `
          <option value="">-- 目前無考核表資料 --</option>
        `;
        return;
      }

      select.innerHTML = `
        <option value="">-- 目前共有 ${window.trackingFormCache.length} 筆 --</option>
      `;

      window.trackingFormCache.forEach(
        (form, index) => {
          const recallTag = form.canRecall
            ? "｜可收回"
            : "";

          select.insertAdjacentHTML(
            "beforeend",
            `<option value="${index}">【${form.month}｜${form.docId}】${form.storeDisplay || form.store}－${form.underlingName}［${form.currentStatus}${recallTag}］</option>`
          );
        }
      );
    }
  );
}

function onTrackingFormChange() {
  const select = document.getElementById(
    "tracking-form-select"
  );

  if (!select || select.value === "") {
    lockAllWorkflow();
    return;
  }

  clearOtherSelects("tracking");

  const form =
    window.trackingFormCache[
      Number(select.value)
    ];

  window.currentSelectedTrackingForm = form;
  window.currentFormRowIndex = form.rowIndex;

  renderSingleFormToView(form, true);

  if (
    window.adminManagementMode &&
    currentUser.role === "教育中心"
  ) {
    updateManagementAssignmentSummary(form);
    resetManagementControls(false);
    syncAdminManagementPanels(form);
  }

  if (form.canRecall) {
    window.currentActionMode = "recall";

    const button = document.getElementById(
      "btn-reject-main"
    );

    if (button) {
      button.className =
        "bg-amber-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg text-lg hover:bg-amber-600 transition sm:w-1/3";

      button.innerHTML =
        '<i class="fa-solid fa-rotate-left mr-2"></i>收回修改';

      showElement("btn-reject-main");
    }

    showReadOnlyBanner(
      `此表單已送出，目前流程為「${form.currentStatus}」。下一關尚未完成，可由原送出人收回修改。`
    );
  } else {
    window.currentActionMode = "reject";
  }
}


function loadProgressMonitor() {
  const roles = ["教育中心", "總經理"];

  const progressBox =
    document.getElementById(
      "admin-progress-box"
    );

  // 藍色全公司流程監控只提供教育中心與總經理。
  // 門市店主管、區主管、受評人員及營業副總使用自己的流程追蹤區即可。
  if (!roles.includes(currentUser.role)) {
    if (progressBox) {
      progressBox.classList.add("hidden");
    }
    return;
  }

  if (progressBox) {
    progressBox.classList.remove("hidden");
  }

  if (!document.getElementById("admin-progress-box")) {
    const reviewerBox = document.getElementById(
      "reviewer-select-box"
    );

    if (reviewerBox) {
      const box = document.createElement("div");
      box.id = "admin-progress-box";
      box.className =
        "bg-blue-50 p-4 rounded-xl border border-blue-200 mt-2 space-y-2";

      box.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <label class="block text-base font-black text-blue-700">
            <i class="fa-solid fa-eye mr-1"></i>
            ${currentUser.role === "總經理"
              ? "全公司進行中流程監控（唯讀）"
              : "進行中流程監控（預設唯讀）"}
          </label>
          <div id="admin-mode-buttons" class="${currentUser.role === "教育中心" ? "" : "hidden"} flex gap-2">
            <button type="button" id="btn-enter-admin-mode" onclick="toggleAdminManagementMode(true)" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">
              進入管理模式
            </button>
            <button type="button" id="btn-exit-admin-mode" onclick="toggleAdminManagementMode(false)" class="hidden px-3 py-1.5 rounded-lg bg-gray-600 text-white text-xs font-bold">
              離開管理模式
            </button>
          </div>
        </div>
        <select
          id="admin-progress-form-select"
          onchange="onAdminProgressFormChange()"
          class="w-full p-2.5 border border-blue-300 rounded-xl font-bold text-sm bg-white cursor-pointer"
        ></select>
      `;

      reviewerBox.parentNode.insertBefore(
        box,
        reviewerBox.nextSibling
      );
    }
  }

  callAPI(
    "getAllInProgressForms",
    {
      role: currentUser.role,
      area: currentUser.area,
      dept: currentUser.dept
    },
    (list) => {
      window.adminProgressCache = Array.isArray(list)
        ? list
        : [];

      const select = document.getElementById(
        "admin-progress-form-select"
      );

      if (!select) return;

      const progressPlaceholder = window.adminProgressCache.length > 0
        ? `-- 共有 ${window.adminProgressCache.length} 筆表單進行中 --`
        : "-- 目前無表單進行 --";

      select.innerHTML = `
        <option value="">${progressPlaceholder}</option>
      `;

      window.adminProgressCache.forEach((form, index) => {
        select.insertAdjacentHTML(
          "beforeend",
          `<option value="${index}">【${form.month}｜${form.docId}】${form.storeDisplay || form.store}－${form.underlingName}［${form.currentStatus}］</option>`
        );
      });
    }
  );
}

function toggleAdminManagementMode(enable) {
  if (
    !currentUser ||
    currentUser.role !== "教育中心"
  ) {
    return;
  }

  if (enable) {
    const confirmed = confirm(
      "管理模式可以指定正式考核流程與特定承辦人。確定要進入嗎？"
    );

    if (!confirmed) {
      return;
    }
  }

  window.adminManagementMode = Boolean(enable);

  const enterButton = document.getElementById(
    "btn-enter-admin-mode"
  );

  const exitButton = document.getElementById(
    "btn-exit-admin-mode"
  );

  if (enterButton) {
    enterButton.classList.toggle(
      "hidden",
      window.adminManagementMode
    );
  }

  if (exitButton) {
    exitButton.classList.toggle(
      "hidden",
      !window.adminManagementMode
    );
  }

  const controlBox = document.getElementById(
    "admin-control-box"
  );

  const adminBox = document.getElementById(
    "admin-console-box"
  );

  [controlBox, adminBox].forEach((element) => {
    if (element) {
      element.classList.toggle(
        "hidden",
        !window.adminManagementMode
      );
    }
  });

  if (window.adminManagementMode) {
    const form = getCurrentSelectedFormForAdmin();

    if (form) {
      updateManagementAssignmentSummary(form);
    }

    syncAdminManagementPanels(form);
  } else {
    resetManagementControls();
    syncAdminManagementPanels(null);
  }
}


function onPendingFormChange() {
  const select = document.getElementById(
    "pending-form-select"
  );

  if (!select || select.value === "") {
    lockAllWorkflow();
    return;
  }

  clearOtherSelects("pending");
  const form = pendingFormCache[Number(select.value)];

  renderSingleFormToView(form, false);

  if (
    window.adminManagementMode &&
    currentUser.role === "教育中心"
  ) {
    updateManagementAssignmentSummary(form);
    resetManagementControls(false);
    syncAdminManagementPanels(form);
  }
}

function onAdminProgressFormChange() {
  const select = document.getElementById(
    "admin-progress-form-select"
  );

  if (!select || select.value === "") {
    lockAllWorkflow();
    return;
  }

  clearOtherSelects("progress");
  const form =
    window.adminProgressCache[Number(select.value)];

  renderSingleFormToView(form, true);

  if (
    window.adminManagementMode &&
    currentUser.role === "教育中心"
  ) {
    updateManagementAssignmentSummary(form);
    resetManagementControls(false);
    syncAdminManagementPanels(form);
  }
}

function loadHistoryList() {
  if (!currentUser) return;

  callAPI(
    "getHistoryForms",
    {
      role: currentUser.role,
      dept: currentUser.dept,
      area: currentUser.area,
      empId: currentUser.empId,
      store: currentUser.store
    },
    (list) => {
      historyFormCache = Array.isArray(list) ? list : [];

      const box = document.getElementById(
        "history-select-box"
      );
      const select = document.getElementById(
        "history-form-select"
      );

      if (!box || !select) return;

      // 三區固定顯示；沒有歷史資料時也不隱藏整個欄位。
      box.classList.remove("hidden");

      if (historyFormCache.length === 0) {
        select.innerHTML = `
          <option value="">-- 目前尚無已結案歷史資料 --</option>
        `;
        return;
      }

      select.innerHTML = `
        <option value="">-- 已結案歷史資料：共有 ${historyFormCache.length} 筆 --</option>
      `;

      historyFormCache.forEach((form, index) => {
        const statusTag =
          form.currentStatus === UI_STATUS.PDF_PENDING
            ? "PDF待產生"
            : "已結案";

        select.insertAdjacentHTML(
          "beforeend",
          `<option value="${index}">【${form.month}｜${form.docId}${form.flowVersion ? "｜" + form.flowVersion : ""}】${form.storeDisplay || form.store}－${form.underlingName}［${statusTag}］</option>`
        );
      });
    }
  );
}

function onHistoryFormChange() {
  const select = document.getElementById(
    "history-form-select"
  );

  if (!select || select.value === "") {
    lockAllWorkflow();
    return;
  }

  clearOtherSelects("history");

  const form =
    historyFormCache[Number(select.value)];

  renderSingleFormToView(form, true);
  configurePdfActionBox(form);

  if (
    window.adminManagementMode &&
    currentUser.role === "教育中心"
  ) {
    updateManagementAssignmentSummary(form);
    resetManagementControls(false);
    syncAdminManagementPanels(form);
  }

  showReadOnlyBanner(
    form.currentStatus === UI_STATUS.PDF_PENDING
      ? "總經理簽核已完成，但PDF尚未產生。"
      : "已結案歷史資料，所有欄位均為唯讀。"
  );
}


/* ---------------------------------------------------------------
 * 共用表單渲染
 * ------------------------------------------------------------- */

function renderSingleFormToView(form, forceReadOnly) {
  if (!form) {
    lockAllWorkflow();
    return;
  }

  resetFormFields();
  window.currentFormRowIndex = form.rowIndex;

  fillBasicInfo(form);
  showElement("info-card-container");
  showElement("score-summary-card");
  showElement("workflow-box");
  showElement("section-manager");

  if (hasManagerContent(form)) {
    highlightMetricScores(form.scores || []);

    const managerComment = document.getElementById(
      "manager-comment"
    );

    if (managerComment) {
      managerComment.value = form.managerComment || "";
      managerComment.disabled = true;
      managerComment.classList.add("bg-gray-100");
    }

    document.getElementById(
      "sig-block-manager"
    ).innerHTML = getSigHTML(
      "門市店主管",
      form.managerSig,
      form.evalDate
    );
  }

  isReadOnlyMode = true;
  window.managerScoresLocked = true;
  renderCompletedLaterSections(form);

  const editable =
    !forceReadOnly &&
    canRoleEditStatus(
      currentUser.role,
      form.currentStatus
    );

  if (editable) {
    prepareCurrentRoleEdit(form);
  } else {
    hideElement("btn-submit-main");
    hideElement("btn-reject-main");

    showReadOnlyBanner(
      `目前流程為「${form.currentStatus}」，此畫面為唯讀。`
    );
  }

  updateTotalScore();
}

function renderCompletedLaterSections(form) {
  if (hasEducationContent(form)) {
    showEduSectionReadOnly(form, form.evalDate);
  }

  if (hasAreaContent(form)) {
    showAreaSectionReadOnly(
      form.areaComment || "",
      Number(form.areaAdjust) || 0,
      form.evalDate,
      form.areaSig
    );
  }

  if (form.studentSig) {
    showElement("section-student-confirm");

    const check = document.getElementById(
      "student-confirm-check"
    );

    if (check) {
      check.checked = true;
      check.disabled = true;
    }

    document.getElementById(
      "sig-block-student"
    ).innerHTML = getSigHTML(
      "受評人員",
      form.studentSig,
      form.evalDate
    );
  }

  if (form.vpSig || form.vpComment) {
    showElement("section-vp");
    setValue("vp-comment", form.vpComment || "");
    disableElement("vp-comment", true);

    document.getElementById(
      "sig-block-vp"
    ).innerHTML = getSigHTML(
      "營業副總",
      form.vpSig,
      form.evalDate
    );
  }

  if (form.gmSig || form.gmComment) {
    showElement("section-gm");
    setValue("gm-comment", form.gmComment || "");
    disableElement("gm-comment", true);

    document.getElementById(
      "sig-block-gm"
    ).innerHTML = getSigHTML(
      "總經理",
      form.gmSig,
      form.evalDate
    );
  }
}

function prepareCurrentRoleEdit(form) {
  isReadOnlyMode = false;

  // 只開放目前角色自己的區塊；
  // 門市店主管六項分數仍維持唯讀。
  window.managerScoresLocked = true;

  const returnedStatuses = [
    UI_STATUS.EDU_RETURNED,
    UI_STATUS.AREA_RETURNED,
    UI_STATUS.VP_RETURNED
  ];

  if (returnedStatuses.includes(form.currentStatus)) {
    showReadOnlyBanner(
      `此表單目前為「${form.currentStatus}」，既有資料已保留；僅開放您所屬階段的欄位修改。`,
      "editable"
    );
  } else {
    hideElement("readonly-banner");
  }

  showElement("btn-submit-main");
  updateSubmitButtonText();

  const role = currentUser.role;

  if (role === "教育中心") {
    showElement("section-edu");
    restoreSignatureBlock("教育中心");

    const edu = form.eduData || {};

    setValue("edu-score1", edu.score1);
    setValue("edu-score2", edu.score2);
    setValue("edu-accum", edu.accum);
    setValue("edu-ojt", edu.ojt);
    setValue("edu-comment", edu.comment || "");
    loadEducationPenaltyFromScores(
      edu.score3,
      edu.score4
    );
    updateEducationScoreCards();
    handleEducationCountInput(
      document.getElementById("edu-accum"),
      "edu-accum-status"
    );
    handleEducationCountInput(
      document.getElementById("edu-ojt"),
      "edu-ojt-status"
    );

    setSectionInputsDisabled("section-edu", false);
    updateEducationPenaltyCalculator();
    setupGlobalSavedSignature();
  } else if (role === "區主管") {
    showElement("section-area");
    restoreSignatureBlock("區主管");

    setValue("area-comment", form.areaComment || "");
    disableElement("area-comment", false);
    setAreaAdjustmentFromValue(
      Number(form.areaAdjust) || 0,
      false
    );
    setupGlobalSavedSignature();
  } else if (role === "學員") {
    showElement("section-student-confirm");
    restoreSignatureBlock("學員");

    const check = document.getElementById(
      "student-confirm-check"
    );

    if (check) {
      check.checked = false;
      check.disabled = false;
    }

    setupGlobalSavedSignature();
  } else if (role === "營業副總") {
    showElement("section-vp");
    restoreSignatureBlock("營業副總");

    setValue("vp-comment", form.vpComment || "");
    disableElement("vp-comment", false);
    setupGlobalSavedSignature();
  } else if (role === "總經理") {
    showElement("section-gm");
    restoreSignatureBlock("總經理");

    setValue("gm-comment", form.gmComment || "");
    disableElement("gm-comment", false);
    setupGlobalSavedSignature();
  }

  if (role !== "店長") {
    configureRejectButton(role);
  }
}

function fillBasicInfo(form) {
  setText(
    "info-name",
    form.underlingName || form.name || "-"
  );

  setText(
    "info-store",
    form.storeDisplay || form.store || "-"
  );

  setText("info-area", form.area || "-");
  setText("info-transfer", form.transferDate || "-");
  setText("info-month", form.month || "-");
  setText(
    "info-eval-date",
    form.evalDate && form.evalDate !== "-"
      ? form.evalDate
      : getMinguoToday()
  );
  setText(
    "info-doc",
    form.docId || form.evaluationNo || "-"
  );
  setText(
    "info-status",
    form.currentStatus || "-"
  );

  setText(
    "info-version",
    form.flowVersion || "R0"
  );

  setText(
    "info-original-doc",
    form.originalEvaluationNo ||
      form.docId ||
      form.evaluationNo ||
      "-"
  );

  const reopenRow = document.getElementById(
    "info-reopen-row"
  );

  if (reopenRow) {
    const reason = String(form.reopenReason || "").trim();
    reopenRow.classList.toggle("hidden", !reason);
    setText("info-reopen-reason", reason || "-");
  }
}

function convertManagerCaseToForm(managerCase) {
  const history = managerCase.historyData || {};

  return {
    rowIndex: managerCase.rowIndex,
    docId: managerCase.evaluationNo,
    evaluationNo: managerCase.evaluationNo,
    originalEvaluationNo:
      managerCase.originalEvaluationNo ||
      managerCase.evaluationNo,
    flowVersion: managerCase.flowVersion || "R0",
    reopenReason: managerCase.reopenReason || "",
    reopenOperatorId: managerCase.reopenOperatorId || "",
    reopenTime: managerCase.reopenTime || "",
    month: managerCase.month,
    underlingId: managerCase.empId,
    underlingName: managerCase.name,
    store: managerCase.store,
    storeDisplay: managerCase.storeDisplay,
    area: managerCase.area,
    dept: managerCase.dept,
    transferDate: managerCase.transferDate,
    currentStatus: managerCase.currentStatus,
    scores: history.scores || [],
    managerComment: history.comment || "",
    managerSig: history.sig || "",
    evalDate: managerCase.evalDate,
    eduData: history.eduData || {},
    areaComment: history.areaComment || "",
    areaSig: history.areaSig || "",
    areaAdjust: Number(history.areaAdjust) || 0,
    studentSig: history.studentSig || "",
    vpComment: history.vpComment || "",
    vpSig: history.vpSig || "",
    gmComment: history.gmComment || "",
    gmSig: history.gmSig || ""
  };
}

function hasManagerContent(form) {
  return Boolean(
    form.managerSig ||
    form.managerComment ||
    (Array.isArray(form.scores) &&
      form.scores.some(
        (value) => String(value || "").trim() !== ""
      ))
  );
}

function hasEducationContent(form) {
  const edu = form.eduData || {};

  return Boolean(
    edu.sig ||
    edu.comment ||
    [edu.score1, edu.score2, edu.score3, edu.score4]
      .some((value) => String(value ?? "").trim() !== "")
  );
}

function hasAreaContent(form) {
  return Boolean(
    form.areaSig ||
    form.areaComment ||
    Number(form.areaAdjust)
  );
}

function canRoleEditStatus(role, status) {
  const map = {
    教育中心: [
      UI_STATUS.EDU_NEW,
      UI_STATUS.EDU_RETURNED
    ],
    區主管: [
      UI_STATUS.AREA_NEW,
      UI_STATUS.AREA_RETURNED
    ],
    學員: [UI_STATUS.STUDENT],
    營業副總: [
      UI_STATUS.VP_NEW,
      UI_STATUS.VP_RETURNED
    ],
    總經理: [UI_STATUS.GM]
  };

  return Boolean(
    map[role] && map[role].includes(status)
  );
}


/* ---------------------------------------------------------------
 * 唯讀區塊
 * ------------------------------------------------------------- */

function showEduSectionReadOnly(form, date) {
  showElement("section-edu");

  const edu = form.eduData || {};

  setValue("edu-score1", edu.score1);
  setValue("edu-score2", edu.score2);
  setValue("edu-accum", edu.accum);
  setValue("edu-ojt", edu.ojt);
  setValue("edu-comment", edu.comment || "");
  loadEducationPenaltyFromScores(
    edu.score3,
    edu.score4
  );
  updateEducationScoreCards();
  handleEducationCountInput(
    document.getElementById("edu-accum"),
    "edu-accum-status"
  );
  handleEducationCountInput(
    document.getElementById("edu-ojt"),
    "edu-ojt-status"
  );

  setSectionInputsDisabled("section-edu", true);
  updateEducationPenaltyCalculator();

  document.getElementById(
    "sig-block-edu"
  ).innerHTML = getSigHTML(
    "教育中心成員",
    edu.sig,
    date
  );
}

function showAreaSectionReadOnly(
  comment,
  adjustValue,
  date,
  signatureUrl
) {
  showElement("section-area");
  setValue("area-comment", comment || "");
  disableElement("area-comment", true);
  setAreaAdjustmentFromValue(adjustValue, true);

  document.getElementById(
    "sig-block-area"
  ).innerHTML = getSigHTML(
    "區主管",
    signatureUrl,
    date
  );
}

function getSigHTML(title, signatureUrl, date) {
  const safeDate =
    date && date !== "-" ? date : "未記錄";

  const hasSignature =
    Boolean(String(signatureUrl || "").trim());

  return `
    <div class="p-4 bg-orange-50/40 border border-orange-200 rounded-xl space-y-2">
      <div class="text-sm font-black text-gray-800 flex items-center">
        <i class="fa-solid fa-circle-check text-green-600 mr-1.5"></i>
        ${escapeHtml(title)}已完成簽名（評核日期：${escapeHtml(safeDate)}）
      </div>
      <div class="inline-flex items-center bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm text-sm font-bold text-gray-700">
        <i class="fa-solid fa-signature text-orange-500 mr-2"></i>
        ${hasSignature ? "簽名已留存" : "簽名紀錄未找到"}
      </div>
    </div>
  `;
}


function normalizeDriveImageUrl(url) {
  const text = String(url || "").trim();
  if (!text || !text.startsWith("http")) return "";

  const fileMatch =
    text.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    text.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (!fileMatch) return text;

  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(fileMatch[1]) +
    "&sz=w1000"
  );
}


/* ---------------------------------------------------------------
 * 送出、退回、收回、管理
 * ------------------------------------------------------------- */

function updateSubmitButtonText() {
  if (!currentUser) return;

  const button = document.getElementById(
    "btn-submit-main"
  );

  if (!button) return;

  const labels = {
    店長: "確認考核表－送出教育中心",
    教育中心: "確認考核表－送出區主管",
    區主管: "確認考核表－送出受評人員",
    學員: "本人確認並簽名送出",
    營業副總: "確認簽核－送出總經理",
    總經理: "確認簽核並結案"
  };

  button.innerText =
    labels[currentUser.role] || "確認送出";
}

function configureRejectButton(role) {
  window.currentActionMode = "reject";

  const button = document.getElementById(
    "btn-reject-main"
  );

  if (!button) return;

  button.className =
    "bg-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg text-lg hover:bg-red-700 transition sm:w-1/3";

  const labels = {
    教育中心:
      '<i class="fa-solid fa-ban mr-2"></i>退回門市店主管修改',
    區主管:
      '<i class="fa-solid fa-ban mr-2"></i>退回教育中心修改',
    學員:
      '<i class="fa-solid fa-triangle-exclamation mr-2"></i>提出疑慮並退回門市',
    營業副總:
      '<i class="fa-solid fa-ban mr-2"></i>退回區主管修改',
    總經理:
      '<i class="fa-solid fa-ban mr-2"></i>退回營業副總修改'
  };

  button.innerHTML = labels[role] || "退回";
  showElement("btn-reject-main");
}

function rejectForm() {
  if (!currentUser || !window.currentFormRowIndex) {
    return;
  }

  if (window.currentActionMode === "recall") {
    if (
      !confirm(
        "確定要在下一關尚未完成前，收回此考核表修改嗎？"
      )
    ) {
      return;
    }

    callAPI(
      "submitStage",
      {
        role: currentUser.role,
        formData: {
          rowIndex: window.currentFormRowIndex,
          managerId: currentUser.empId,
          empId: currentUser.empId,
          isRecall: true
        }
      },
      handleFlowResult
    );

    return;
  }

  if (currentUser.role === "店長") {
    if (
      !confirm(
        "確定要在教育中心尚未填寫前，收回此考核表修改嗎？"
      )
    ) {
      return;
    }

    callAPI(
      "submitStage",
      {
        role: "店長",
        formData: {
          rowIndex: window.currentFormRowIndex,
          managerId: currentUser.empId,
          isRecall: true
        }
      },
      handleFlowResult
    );

    return;
  }

  const requiredReasonRoles = [
    "區主管",
    "學員",
    "營業副總",
    "總經理"
  ];

  let message = "請填寫退回原因：";

  if (currentUser.role === "學員") {
    message =
      "請具體說明您對考核內容的疑慮：";
  }

  const reason = prompt(message);

  if (
    requiredReasonRoles.includes(currentUser.role) &&
    (!reason || !reason.trim())
  ) {
    alert("退回原因為必填。");
    return;
  }

  if (
    currentUser.role === "教育中心" &&
    reason === null
  ) {
    return;
  }

  callAPI(
    "submitStage",
    {
      role: currentUser.role,
      formData: {
        rowIndex: window.currentFormRowIndex,
        empId: currentUser.empId,
        isReject: true,
        rejectReason: reason ? reason.trim() : ""
      }
    },
    handleFlowResult
  );
}

function submitForm() {
  if (!currentUser || !window.currentFormRowIndex) {
    alert("請先選擇要處理的考核表。");
    return;
  }

  const role = currentUser.role;
  const signature = collectSignaturePayload(role);

  if (!signature) return;

  let formData = {
    rowIndex: window.currentFormRowIndex,
    empId: currentUser.empId,
    ...signature
  };

  if (role === "店長") {
    const selectedForm =
      window.currentSelectedManagerCase;

    if (!selectedForm) {
      alert("找不到目前選擇的考核表。");
      return;
    }

    for (let i = 1; i <= 6; i++) {
      if (!selectedScores[i]) {
        alert(`請完成第 ${i} 項評分。`);
        return;
      }
    }

    const comment = getTrimmedValue(
      "manager-comment"
    );

    if (!comment) {
      alert("門市店主管綜合評語為必填。");
      return;
    }

    formData = {
      rowIndex: selectedForm.rowIndex,
      evaluationNo: selectedForm.evaluationNo,
      managerId: currentUser.empId,
      score1: selectedScores[1],
      score2: selectedScores[2],
      score3: selectedScores[3],
      score4: selectedScores[4],
      score5: selectedScores[5],
      score6: selectedScores[6],
      comment,
      evalDate: getMinguoToday(),
      ...signature
    };
  } else if (role === "教育中心") {
    const values = {
      edu1: getTrimmedValue("edu-score1"),
      edu2: getTrimmedValue("edu-score2"),
      edu3: getTrimmedValue("edu-score3"),
      edu4: getTrimmedValue("edu-score4"),
      eduAccum: getTrimmedValue("edu-accum"),
      eduOjt: getTrimmedValue("edu-ojt"),
      eduComment: getTrimmedValue("edu-comment")
    };

    if (Object.values(values).some((value) => value === "")) {
      alert(
        "請完整輸入四項得分、職能積分累計、OJT完成篇數及教育中心異常回報。"
      );
      return;
    }

    if (![0, 15].includes(Number(values.edu1))) {
      alert("職能積分得分只能選擇0分或15分。");
      return;
    }

    if (![0, 10].includes(Number(values.edu2))) {
      alert("OJT完成篇數得分只能選擇0分或10分。");
      return;
    }

    const scoreRules = [
      ["edu3", 0, 5, "每週進度回報得分"],
      ["edu4", 0, 10, "培訓課程狀況得分"]
    ];

    for (const [key, min, max, label] of scoreRules) {
      if (!isIntegerInRange(values[key], min, max)) {
        alert(`${label}必須是${min}～${max}的整數。`);
        return;
      }
    }

    if (
      !isNonNegativeInteger(values.eduAccum) ||
      !isNonNegativeInteger(values.eduOjt)
    ) {
      alert("職能積分累計及OJT完成篇數必須是0以上的整數。");
      return;
    }

    if (!values.eduComment) {
      alert("教育中心異常回報為必填；無異常請填「無」。");
      return;
    }

    formData = {
      ...formData,
      ...values
    };
  } else if (role === "區主管") {
    const areaComment = getTrimmedValue(
      "area-comment"
    );
    const areaAdjust = Number(
      getTrimmedValue("area-adjust-score") || 0
    );

    if (!Number.isInteger(areaAdjust) ||
        areaAdjust < -10 ||
        areaAdjust > 10) {
      alert("區主管增減分必須是-10～+10的整數。");
      return;
    }

    if (!areaComment) {
      alert("區主管評語為必填。");
      return;
    }

    formData = {
      ...formData,
      areaAdjust,
      areaComment
    };
  } else if (role === "學員") {
    const check = document.getElementById(
      "student-confirm-check"
    );

    if (!check || !check.checked) {
      alert("請先勾選「本人已完整閱讀並確認」。");
      return;
    }

    formData = {
      ...formData,
      confirmed: true
    };
  } else if (role === "營業副總") {
    formData = {
      ...formData,
      vpComment: getTrimmedValue("vp-comment")
    };
  } else if (role === "總經理") {
    formData = {
      ...formData,
      gmComment: getTrimmedValue("gm-comment")
    };
  }

  const send = () => {
    callAPI(
      "submitStage",
      {
        role,
        formData
      },
      handleFlowResult
    );
  };

  // 總經理依需求不再跳第二次確認。
  if (role === "總經理") {
    send();
    return;
  }

  if (confirm("確定要送出此考核表嗎？")) {
    send();
  }
}

function collectSignaturePayload(role) {
  const config = getSignatureConfig(role);
  if (!config) return null;

  const checkbox = document.getElementById(
    config.checkboxId
  );
  const useSavedSignature = Boolean(
    checkbox && checkbox.checked
  );

  if (useSavedSignature) {
    if (
      !currentUser.savedSignature ||
      !String(currentUser.savedSignature).trim()
    ) {
      alert(
        "目前沒有預存簽名，請取消勾選後重新手寫。"
      );
      return null;
    }

    return {
      signatureType: "saved",
      signatureBase64: "",
      savedSignaturePath:
        currentUser.savedSignature
    };
  }

  if (isCanvasBlank(config.canvasId)) {
    alert(
      "請完成手寫簽名，或勾選使用預存簽名。"
    );
    return null;
  }

  const canvasEntry = canvasMap[config.canvasId];

  if (!canvasEntry || !canvasEntry.cvs) {
    alert("簽名板尚未正確初始化，請重新開啟表單。");
    return null;
  }

  return {
    signatureType: "manual",
    signatureBase64:
      canvasEntry.cvs.toDataURL("image/png"),
    savedSignaturePath: ""
  };
}

function handleFlowResult(result) {
  if (!result || !result.success) {
    alert(
      "操作失敗：" +
      (result && result.message
        ? result.message
        : "未知錯誤")
    );
    return;
  }

  alert(result.message || "操作完成。");
  lockAllWorkflow();

  if (currentUser.role === "店長") {
    const select = document.getElementById(
      "underling-select"
    );

    if (select) select.value = "";

    loadUnderlings(currentUser.store);
  } else {
    reloadPendingList();
  }

  loadHistoryList();
}

function resetManagementControls(clearSummary = true) {
  const statusSelect = document.getElementById(
    "force-reset-select"
  );
  const assigneeSelect = document.getElementById(
    "management-assignee-select"
  );
  const reasonInput = document.getElementById(
    "management-reason"
  );
  const targetRoleText = document.getElementById(
    "management-target-role"
  );
  const summary = document.getElementById(
    "management-current-assignment"
  );

  if (statusSelect) statusSelect.value = "";

  if (assigneeSelect) {
    assigneeSelect.innerHTML =
      '<option value="">-- 請先選擇目標階段 --</option>';
    assigneeSelect.disabled = true;
  }

  if (reasonInput) reasonInput.value = "";
  if (targetRoleText) targetRoleText.innerText = "尚未選擇";

  const reopenReasonInput = document.getElementById(
    "reopen-reason"
  );
  const reopenSummary = document.getElementById(
    "reopen-source-summary"
  );

  if (reopenReasonInput) reopenReasonInput.value = "";
  if (clearSummary && reopenSummary) {
    reopenSummary.innerText =
      "請從歷史考核表選擇一筆已結案案件。";
  }

  window.currentReopenSourceForm = null;

  if (clearSummary && summary) {
    summary.innerText = "請先從上方選擇一筆考核表。";
  }

  window.managementAssigneeCache = [];
}


function updateManagementAssignmentSummary(form) {
  const summary = document.getElementById(
    "management-current-assignment"
  );

  if (!summary || !form) return;

  const assignedRole = form.assignedRole || "未指定";
  const assignedEmpId = form.assignedEmpId || "未指定";
  const managementText = form.managementReason
    ? `；最近管理原因：${form.managementReason}`
    : "";

  summary.innerText =
    `目前流程：${form.currentStatus}；` +
    `指派角色：${assignedRole}；` +
    `指派人員：${assignedEmpId}` +
    managementText;
}


function loadManagementAssignees() {
  if (
    !currentUser ||
    currentUser.role !== "教育中心" ||
    !window.adminManagementMode
  ) {
    return;
  }

  const form = getCurrentSelectedFormForAdmin();
  const targetStatus = getTrimmedValue(
    "force-reset-select"
  );
  const assigneeSelect = document.getElementById(
    "management-assignee-select"
  );
  const targetRoleText = document.getElementById(
    "management-target-role"
  );

  if (!assigneeSelect) return;

  if (!form) {
    alert("請先選擇要管理的考核表。");
    assigneeSelect.disabled = true;
    return;
  }

  if (!targetStatus) {
    assigneeSelect.innerHTML =
      '<option value="">-- 請先選擇目標階段 --</option>';
    assigneeSelect.disabled = true;
    if (targetRoleText) targetRoleText.innerText = "尚未選擇";
    return;
  }

  assigneeSelect.innerHTML =
    '<option value="">載入符合條件的人員中...</option>';
  assigneeSelect.disabled = true;

  callAPI(
    "getManagementAssignees",
    {
      rowIndex: form.rowIndex,
      targetStatus,
      empId: currentUser.empId
    },
    (result) => {
      if (!result || result.success !== true) {
        assigneeSelect.innerHTML =
          '<option value="">無法取得人員清單</option>';
        alert(
          result && result.message
            ? result.message
            : "無法取得可指派人員。"
        );
        return;
      }

      window.managementAssigneeCache = Array.isArray(
        result.candidates
      )
        ? result.candidates
        : [];

      if (targetRoleText) {
        targetRoleText.innerText =
          result.targetRole || "結案／無承辦角色";
      }

      if (!result.targetRole) {
        assigneeSelect.innerHTML =
          '<option value="">結案階段不指定承辦人</option>';
        assigneeSelect.disabled = true;
        return;
      }

      assigneeSelect.innerHTML =
        '<option value="">-- 不指定特定人員，由該角色符合權限者承辦 --</option>';

      window.managementAssigneeCache.forEach((employee) => {
        const scopeText = [
          employee.store,
          employee.area,
          employee.department
        ]
          .filter(Boolean)
          .join("／");

        assigneeSelect.insertAdjacentHTML(
          "beforeend",
          `<option value="${escapeHtml(employee.employeeId)}">${escapeHtml(employee.name)}（${escapeHtml(employee.employeeId)}${scopeText ? "｜" + escapeHtml(scopeText) : ""}）</option>`
        );
      });

      assigneeSelect.disabled = false;

      if (
        result.targetRole === "受評人員" &&
        window.managementAssigneeCache.length === 1
      ) {
        assigneeSelect.value =
          window.managementAssigneeCache[0].employeeId;
      }
    }
  );
}


function executeForceReset() {
  if (
    !currentUser ||
    currentUser.role !== "教育中心" ||
    !window.adminManagementMode
  ) {
    alert("只有教育中心管理模式可以執行此功能。");
    return;
  }

  const form = getCurrentSelectedFormForAdmin();

  if (!form) {
    alert("請先選擇要管理的考核表。");
    return;
  }

  const targetStatus = getTrimmedValue(
    "force-reset-select"
  );

  if (!targetStatus) {
    alert("請選擇要流轉的目標階段。");
    return;
  }

  const assignedEmpId = getTrimmedValue(
    "management-assignee-select"
  );

  const reason = getTrimmedValue(
    "management-reason"
  );

  if (!reason) {
    alert("管理原因／備註為必填。");
    return;
  }

  const targetRoleText = document.getElementById(
    "management-target-role"
  );

  const targetRole = targetRoleText
    ? targetRoleText.innerText
    : "";

  const assigneeText = assignedEmpId
    ? assignedEmpId
    : "不指定特定人員";

  if (
    !confirm(
      `確定將此表單調整為「${targetStatus}」？\n\n` +
      `目標角色：${targetRole}\n` +
      `指定人員：${assigneeText}\n\n` +
      "既有分數、評語及簽名均會保留。"
    )
  ) {
    return;
  }

  callAPI(
    "forceResetStage",
    {
      rowIndex: form.rowIndex,
      targetStatus,
      empId: currentUser.empId,
      managementReason: reason,
      assignedEmpId
    },
    (result) => {
      alert(
        result && result.message
          ? result.message
          : "管理操作完成。"
      );

      if (!result || result.success !== true) {
        return;
      }

      resetManagementControls();
      lockAllWorkflow();
      reloadPendingList();
      loadHistoryList();
    }
  );
}


/**
 * 依目前選取案件切換教育中心管理面板。
 * - 進行中案件：顯示指定角色／指定承辦人。
 * - 已結案案件：顯示建立 R1／R2 副本。
 */
function syncAdminManagementPanels(form) {
  const forceContainer = document.getElementById(
    "force-reset-container"
  );
  const reopenContainer = document.getElementById(
    "reopen-closed-container"
  );
  const reopenSummary = document.getElementById(
    "reopen-source-summary"
  );
  const reopenButton = document.getElementById(
    "btn-reopen-closed"
  );
  const warning = document.getElementById(
    "reopen-closed-warning"
  );

  if (!window.adminManagementMode || !form) {
    if (forceContainer) forceContainer.classList.add("hidden");
    if (reopenContainer) reopenContainer.classList.add("hidden");
    window.currentReopenSourceForm = null;
    return;
  }

  const status = String(form.currentStatus || "").trim();
  const isHistory = [
    UI_STATUS.CLOSED,
    UI_STATUS.PDF_PENDING
  ].includes(status);

  if (forceContainer) {
    forceContainer.classList.toggle("hidden", isHistory);
  }

  if (reopenContainer) {
    reopenContainer.classList.toggle("hidden", !isHistory);
  }

  if (!isHistory) {
    window.currentReopenSourceForm = null;
    return;
  }

  window.currentReopenSourceForm = form;

  const version = form.flowVersion || "R0";
  const originalNo =
    form.originalEvaluationNo ||
    form.docId ||
    form.evaluationNo ||
    "-";

  if (reopenSummary) {
    reopenSummary.innerText =
      `來源單號：${form.docId || form.evaluationNo}；` +
      `版本：${version}；原始單號：${originalNo}；` +
      `受評人員：${form.underlingName}；` +
      `目前狀態：${status}`;
  }

  const canReopen = status === UI_STATUS.CLOSED;

  if (reopenButton) {
    reopenButton.disabled = !canReopen;
    reopenButton.classList.toggle("opacity-50", !canReopen);
    reopenButton.classList.toggle("cursor-not-allowed", !canReopen);
  }

  if (warning) {
    warning.innerText = canReopen
      ? "新版本的分數、評語與簽名將全部從空白開始；原版本及原PDF不會被修改。"
      : "此案件仍為『結案待PDF產生』，請先由教育中心成功產生PDF，才可建立下一版本。";
  }
}


/**
 * 教育中心建立結案案件的下一版本副本。
 */
function executeReopenClosedEvaluation() {
  if (
    !currentUser ||
    currentUser.role !== "教育中心" ||
    !window.adminManagementMode
  ) {
    alert("只有教育中心管理模式可以重新開啟結案案件。");
    return;
  }

  const form = window.currentReopenSourceForm;

  if (!form) {
    alert("請先從歷史考核表選擇一筆已結案案件。");
    return;
  }

  if (form.currentStatus !== UI_STATUS.CLOSED) {
    alert("請先完成PDF產生，流程狀態為『結案』後再重新開啟。");
    return;
  }

  const reason = getTrimmedValue("reopen-reason");

  if (!reason) {
    alert("重新開啟原因為必填。");
    return;
  }

  const sourceVersion = form.flowVersion || "R0";
  const originalNo =
    form.originalEvaluationNo ||
    form.docId ||
    form.evaluationNo;

  if (
    !confirm(
      `確定重新開啟此結案案件？\n\n` +
      `來源單號：${form.docId || form.evaluationNo}\n` +
      `來源版本：${sourceVersion}\n` +
      `原始單號：${originalNo}\n\n` +
      "系統將建立下一個 R 版本，並從門市店主管階段重新開始。\n" +
      "原始結案資料及原PDF不會被修改。"
    )
  ) {
    return;
  }

  const button = document.getElementById(
    "btn-reopen-closed"
  );

  if (button) {
    button.disabled = true;
    button.classList.add("opacity-50");
  }

  callAPI(
    "reopenClosedEvaluation",
    {
      rowIndex: form.rowIndex,
      empId: currentUser.empId,
      reopenReason: reason
    },
    (result) => {
      if (button) {
        button.disabled = false;
        button.classList.remove("opacity-50");
      }

      alert(
        result && result.message
          ? result.message
          : "重新開啟操作完成。"
      );

      if (!result || result.success !== true) {
        return;
      }

      resetManagementControls();
      lockAllWorkflow();

      const historySelect = document.getElementById(
        "history-form-select"
      );

      if (historySelect) historySelect.value = "";

      reloadPendingList();
    }
  );
}


function getCurrentSelectedFormForAdmin() {
  const pending = document.getElementById(
    "pending-form-select"
  );
  const progress = document.getElementById(
    "admin-progress-form-select"
  );
  const history = document.getElementById(
    "history-form-select"
  );

  const tracking = document.getElementById(
    "tracking-form-select"
  );

  if (pending && pending.value !== "") {
    return pendingFormCache[Number(pending.value)];
  }

  if (progress && progress.value !== "") {
    return window.adminProgressCache[
      Number(progress.value)
    ];
  }

  if (tracking && tracking.value !== "") {
    return window.trackingFormCache[
      Number(tracking.value)
    ];
  }

  if (history && history.value !== "") {
    return historyFormCache[Number(history.value)];
  }

  return null;
}

function configurePdfActionBox(form) {
  const box = document.getElementById(
    "pdf-action-box"
  );

  const openButton = document.getElementById(
    "btn-open-current-pdf"
  );

  const regenerateButton = document.getElementById(
    "btn-regenerate-current-pdf"
  );

  // 每次切換單據或角色時都先全面關閉，避免上一位登入者的PDF區塊殘留。
  if (box) box.classList.add("hidden");
  if (openButton) openButton.classList.add("hidden");
  if (regenerateButton) regenerateButton.classList.add("hidden");
  window.currentSelectedPdfForm = null;

  if (!box || !form || !currentUser) {
    return;
  }

  // PDF檢視權限：教育中心與總經理。
  // 門市店主管、區主管、學員、營業副總皆不顯示PDF區塊。
  const canOpenPdf = [
    "教育中心",
    "總經理"
  ].includes(currentUser.role);

  if (!canOpenPdf) {
    return;
  }

  const isClosed =
    form.currentStatus === UI_STATUS.CLOSED ||
    form.currentStatus === UI_STATUS.PDF_PENDING;

  if (!isClosed) {
    return;
  }

  const pdfUrl = String(form.pdfUrl || "").trim();
  const canRegeneratePdf =
    currentUser.role === "教育中心";

  box.classList.remove("hidden");

  setText(
    "pdf-action-status",
    form.currentStatus === UI_STATUS.PDF_PENDING
      ? "總經理已完成簽核，但PDF尚未成功產生。"
      : (
          pdfUrl
            ? (
                canRegeneratePdf
                  ? "PDF已成功產生，可開啟查看或重新產生。"
                  : "PDF已成功產生，可開啟查看。"
              )
            : "案件已結案，但目前未讀取到PDF網址。"
        )
  );

  if (openButton) {
    openButton.classList.toggle("hidden", !pdfUrl);
  }

  if (regenerateButton) {
    regenerateButton.classList.toggle(
      "hidden",
      !canRegeneratePdf
    );
  }

  window.currentSelectedPdfForm = form;
}

function openCurrentPdf() {
  if (
    !currentUser ||
    !["教育中心", "總經理"].includes(
      currentUser.role
    )
  ) {
    alert("目前角色沒有PDF檢視權限。");
    hideElement("pdf-action-box");
    return;
  }

  const form = window.currentSelectedPdfForm;
  const pdfUrl = form
    ? String(form.pdfUrl || "").trim()
    : "";

  if (!pdfUrl) {
    alert("目前沒有可開啟的PDF網址。");
    return;
  }

  window.open(
    pdfUrl,
    "_blank",
    "noopener,noreferrer"
  );
}


function manualRegeneratePDF() {
  if (!window.currentFormRowIndex) {
    alert("請先選擇要重新產生PDF的考核表。");
    return;
  }

  if (
    !currentUser ||
    currentUser.role !== "教育中心"
  ) {
    alert("只有教育中心可以重新產生PDF。");
    hideElement("pdf-action-box");
    return;
  }

  if (!confirm("確定要重新產生此版本的結案PDF嗎？")) {
    return;
  }

  callAPI(
    "regeneratePDF",
    {
      rowIndex: window.currentFormRowIndex,
      empId: currentUser.empId
    },
    (result) => {
      if (!result || !result.success) {
        alert(
          result && result.message
            ? result.message
            : "PDF重新產生失敗。"
        );
        return;
      }

      alert(
        result.message ||
        "PDF已成功重新產生。"
      );

      if (
        result.fileUrl &&
        window.currentSelectedPdfForm
      ) {
        window.currentSelectedPdfForm.pdfUrl =
          result.fileUrl;
      }

      loadHistoryList();

      const historySelect =
        document.getElementById(
          "history-form-select"
        );

      if (historySelect) {
        historySelect.value = "";
      }

      hideElement("pdf-action-box");
      lockAllWorkflow();
    }
  );
}


/* ---------------------------------------------------------------
 * 小工具
 * ------------------------------------------------------------- */

function showReadOnlyBanner(message, mode = "readonly") {
  const banner = document.getElementById(
    "readonly-banner"
  );

  if (!banner) return;

  showElement("readonly-banner");
  setText("banner-text", message);

  const subtitle = banner.querySelector(
    "p.text-xs"
  );

  if (subtitle) {
    subtitle.innerText =
      mode === "editable"
        ? "目前僅開放本階段可修改的欄位，其餘已完成內容維持唯讀。"
        : "目前處於【唯讀查閱模式】，各項目皆已被安全鎖定保護。";
  }

  banner.classList.toggle(
    "bg-amber-50",
    mode !== "editable"
  );
  banner.classList.toggle(
    "border-amber-300",
    mode !== "editable"
  );
  banner.classList.toggle(
    "text-amber-900",
    mode !== "editable"
  );

  banner.classList.toggle(
    "bg-orange-50",
    mode === "editable"
  );
  banner.classList.toggle(
    "border-orange-300",
    mode === "editable"
  );
  banner.classList.toggle(
    "text-orange-900",
    mode === "editable"
  );
}

function clearOtherSelects(activeType) {
  const mapping = {
    pending: [
      "tracking-form-select",
      "history-form-select",
      "admin-progress-form-select"
    ],
    tracking: [
      "pending-form-select",
      "underling-select",
      "history-form-select",
      "admin-progress-form-select"
    ],
    progress: [
      "pending-form-select",
      "underling-select",
      "tracking-form-select",
      "history-form-select"
    ],
    history: [
      "pending-form-select",
      "underling-select",
      "tracking-form-select",
      "admin-progress-form-select"
    ]
  };

  (mapping[activeType] || []).forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
}

function lockAllWorkflow() {
  [
    "info-card-container",
    "score-summary-card",
    "workflow-box",
    "readonly-banner",
    "pdf-action-box"
  ].forEach(hideElement);

  window.currentSelectedPdfForm = null;

  if (!window.adminManagementMode) {
    hideElement("admin-control-box");
  }
}

function showLoading(show) {
  const spinner = document.getElementById(
    "loading-spinner"
  );

  if (!spinner) return;

  spinner.classList[
    show ? "remove" : "add"
  ]("hidden");
}

function getMinguoToday() {
  const today = new Date();

  return (
    today.getFullYear() -
    1911 +
    "/" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "/" +
    String(today.getDate()).padStart(2, "0")
  );
}

function callAPI(action, data, successCallback) {
  const payload = {
    action,
    ...(data || {})
  };

  showLoading(true);

  fetch(GAS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  })
    .then((response) => response.json())
    .then((result) => {
      showLoading(false);
      successCallback(result);
    })
    .catch((error) => {
      showLoading(false);
      alert(
        "通訊連線失敗：" + error.toString()
      );
    });
}

function getNumericValue(id) {
  const value = Number(
    document.getElementById(id)?.value
  );

  return Number.isFinite(value) ? value : 0;
}


/* ---------------------------------------------------------------
 * 教育中心／總經理：月考核派發管理
 * ------------------------------------------------------------- */

function configureMonthlyDispatchAdminVisibility() {
  const box = document.getElementById(
    "monthly-dispatch-admin-box"
  );

  if (!box) return;

  const allowed = Boolean(
    currentUser &&
    ["教育中心", "總經理"].includes(currentUser.role)
  );

  box.classList.toggle("hidden", !allowed);

  if (!allowed) return;

  const isEducation = currentUser.role === "教育中心";
  const actions = document.getElementById(
    "dispatch-admin-actions"
  );
  const note = document.getElementById(
    "dispatch-admin-role-note"
  );

  if (actions) {
    actions.classList.toggle("hidden", !isEducation);
  }

  if (note) {
    note.innerText = isEducation
      ? "可依月份查看派發狀況、補齊缺漏、單一人員補派及同步調店。"
      : "總經理可查看各月份派發統計與案件狀況；管理按鈕僅教育中心可使用。";
  }

  const monthInput = document.getElementById(
    "dispatch-admin-month"
  );

  if (monthInput && !String(monthInput.value || "").trim()) {
    monthInput.value = getCurrentRocMonthForDispatch_();
  }
}

function getCurrentRocMonthForDispatch_() {
  const now = new Date();
  const rocYear = now.getFullYear() - 1911;
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${rocYear}/${month}`;
}

function normalizeRocMonthForDispatch_(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{2,3})\/(\d{1,2})$/);

  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (
    !Number.isInteger(year) ||
    year <= 0 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return "";
  }

  return `${year}/${String(month).padStart(2, "0")}`;
}

function compareRocMonthsForDispatch_(left, right) {
  const leftText = normalizeRocMonthForDispatch_(left);
  const rightText = normalizeRocMonthForDispatch_(right);
  if (!leftText || !rightText) return 0;
  const [leftYear, leftMonth] = leftText.split("/").map(Number);
  const [rightYear, rightMonth] = rightText.split("/").map(Number);
  return (leftYear * 12 + leftMonth) - (rightYear * 12 + rightMonth);
}

function isFutureDispatchMonth_(month) {
  return compareRocMonthsForDispatch_(month, getCurrentRocMonthForDispatch_()) > 0;
}

function getMonthlyDispatchFutureOverride_() {
  return Boolean(document.getElementById("dispatch-allow-future")?.checked);
}

function updateMonthlyDispatchFutureControls_() {
  const month = normalizeRocMonthForDispatch_(getTrimmedValue("dispatch-admin-month"));
  const isFuture = Boolean(window.monthlyDispatchDashboard?.isFutureMonth || isFutureDispatchMonth_(month));
  const allowFuture = getMonthlyDispatchFutureOverride_();
  const warning = document.getElementById("dispatch-future-warning");
  const warningText = document.getElementById("dispatch-future-warning-text");
  const buttons = [
    document.getElementById("btn-create-missing-dispatch"),
    document.getElementById("btn-create-single-dispatch")
  ];

  if (warning) warning.classList.toggle("hidden", !isFuture);
  if (warningText && isFuture) {
    warningText.innerText = `您正在查看 ${month}。建立後會立即出現在門市店主管待辦清單，不會等到 ${month} 才派發。`;
  }

  buttons.forEach((button) => {
    if (!button) return;
    const disabled = isFuture && !allowFuture;
    button.disabled = disabled;
    button.classList.toggle("opacity-50", disabled);
    button.classList.toggle("cursor-not-allowed", disabled);
  });
}

function requireFutureDispatchConfirmation_(month) {
  if (!isFutureDispatchMonth_(month)) return true;

  if (!getMonthlyDispatchFutureOverride_()) {
    alert(
      `目前選擇的是未來月份 ${month}。\n` +
      "請先勾選「允許提前建立未來月份案件」。"
    );
    return false;
  }

  return confirm(
    `您正在提前建立 ${month} 的考核案件。\n\n` +
    "建立後會立即出現在門市店主管待辦清單，不會等到該月份才派發。\n\n" +
    "確定繼續嗎？"
  );
}

function loadMonthlyDispatchDashboard() {
  configureMonthlyDispatchAdminVisibility();

  if (
    !currentUser ||
    !["教育中心", "總經理"].includes(currentUser.role)
  ) {
    return;
  }

  const monthInput = document.getElementById(
    "dispatch-admin-month"
  );
  const normalizedMonth = normalizeRocMonthForDispatch_(
    monthInput ? monthInput.value : ""
  );

  if (!normalizedMonth) {
    alert("請輸入正確民國年月，例如：115/07。");
    return;
  }

  if (monthInput) monthInput.value = normalizedMonth;

  callAPI(
    "getMonthlyDispatchDashboard",
    {
      rocMonth: normalizedMonth,
      empId: currentUser.empId
    },
    (result) => {
      if (!result || !result.success) {
        alert(
          "載入月考核派發管理失敗：" +
          (result && result.message
            ? result.message
            : "未知錯誤")
        );
        return;
      }

      window.monthlyDispatchDashboard = result;
      const futureCheckbox = document.getElementById("dispatch-allow-future");
      if (futureCheckbox) futureCheckbox.checked = false;
      window.monthlyDispatchRows = Array.isArray(result.rows)
        ? result.rows
        : [];
      window.monthlyDispatchCandidates = Array.isArray(
        result.manualCandidates
      )
        ? result.manualCandidates
        : [];

      updateMonthlyDispatchStats_(result.stats || {});
      renderMonthlyDispatchCandidates_();
      renderMonthlyDispatchRows();
      updateMonthlyDispatchFutureControls_();

      const summary = document.getElementById(
        "dispatch-admin-summary"
      );

      if (summary) {
        summary.innerText =
          `考核月份：${result.rocMonth}｜` +
          `資料更新時間：${result.generatedAt || "-"}`;
      }
    }
  );
}

function updateMonthlyDispatchStats_(stats) {
  const mapping = {
    "dispatch-stat-eligible": stats.eligibleCount,
    "dispatch-stat-created": stats.createdCount,
    "dispatch-stat-missing": stats.missingCount,
    "dispatch-stat-progress": stats.inProgressCount,
    "dispatch-stat-closed": stats.closedCount,
    "dispatch-stat-invalid": stats.invalidCount,
    "dispatch-stat-excluded": stats.excludedCount,
    "dispatch-stat-moved": stats.movedCount
  };

  Object.keys(mapping).forEach((id) => {
    setText(id, Number(mapping[id]) || 0);
  });
}

function renderMonthlyDispatchCandidates_() {
  const select = document.getElementById(
    "dispatch-single-employee"
  );

  if (!select) return;

  const candidates = window.monthlyDispatchCandidates || [];

  select.innerHTML =
    '<option value="">-- 請選擇尚未建立案件的受評人員 --</option>';

  candidates.forEach((item) => {
    const existingTag = item.alreadyExists
      ? "｜該月已有案件"
      : "";
    const needTag = item.needsEvaluation
      ? "｜J欄為是"
      : "｜J欄為否（需勾選臨時例外）";
    const roleTag = item.roleDisplay
      ? `｜${item.roleDisplay}`
      : "";
    const invalidTag = item.valid
      ? ""
      : `｜資料異常：${item.issue || "請檢查主檔"}`;

    select.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeHtml(item.employeeId)}" ${
        item.alreadyExists || !item.valid ? "disabled" : ""
      }>${escapeHtml(item.employeeId)}－${escapeHtml(item.employeeName)}｜${escapeHtml(item.storeDisplay || item.storeCode || "未設定店別")}${escapeHtml(roleTag + existingTag + needTag + invalidTag)}</option>`
    );
  });
}

function renderMonthlyDispatchRows() {
  const body = document.getElementById(
    "dispatch-admin-table-body"
  );

  if (!body) return;

  const filter = getTrimmedValue("dispatch-admin-filter") || "all";
  const rows = (window.monthlyDispatchRows || []).filter((item) => {
    if (filter === "all") return true;
    return String(item.category || "") === filter;
  });

  if (rows.length === 0) {
    body.innerHTML =
      '<tr><td colspan="8" class="p-6 text-center font-bold text-gray-500">此篩選條件目前沒有資料</td></tr>';
    return;
  }

  body.innerHTML = rows.map((item) => {
    const badgeClass = {
      missing: "bg-amber-100 text-amber-800",
      progress: "bg-blue-100 text-blue-800",
      closed: "bg-emerald-100 text-emerald-800",
      invalid: "bg-red-100 text-red-800"
    }[item.category] || "bg-slate-100 text-slate-800";

    return `
      <tr class="border-t border-indigo-100 hover:bg-indigo-50/50">
        <td class="p-3 font-bold text-indigo-800">${escapeHtml(item.evaluationNo || "尚未建立")}</td>
        <td class="p-3 text-gray-700">${escapeHtml(item.currentDepartment || "-")}<br><span class="text-xs text-gray-500">${escapeHtml(item.currentArea || "-")}</span></td>
        <td class="p-3 font-bold text-gray-700">${escapeHtml(item.storeDisplay || item.currentStore || "-")}</td>
        <td class="p-3 font-bold text-gray-800">${escapeHtml(item.employeeId || "-")}<br><span class="text-xs text-gray-500">${escapeHtml(item.employeeName || "-")}</span></td>
        <td class="p-3 text-gray-700">${escapeHtml(item.flowStatus || "-")}</td>
        <td class="p-3"><span class="inline-block px-2.5 py-1 rounded-full text-xs font-black ${badgeClass}">${escapeHtml(item.stateLabel || "-")}</span></td>
        <td class="p-3 font-bold ${item.moved === "是" ? "text-violet-700" : "text-gray-500"}">${escapeHtml(item.moved || "否")}</td>
        <td class="p-3 text-xs font-bold ${item.issue ? "text-red-700" : "text-gray-500"}">${escapeHtml(item.issue || item.note || "-")}</td>
      </tr>
    `;
  }).join("");
}

function createMissingMonthlyDispatches() {
  if (!currentUser || currentUser.role !== "教育中心") return;

  const month = normalizeRocMonthForDispatch_(
    getTrimmedValue("dispatch-admin-month")
  );

  if (!month) {
    alert("請先輸入正確民國年月。");
    return;
  }

  if (!requireFutureDispatchConfirmation_(month)) {
    return;
  }

  if (
    !isFutureDispatchMonth_(month) &&
    !confirm(`確定要補齊 ${month} 的缺漏案件嗎？
同一人同月份已有R0案件時不會重複建立。`)
  ) {
    return;
  }

  callAPI(
    "createMonthlyDispatchMissing",
    {
      rocMonth: month,
      allowFuture: getMonthlyDispatchFutureOverride_(),
      empId: currentUser.empId
    },
    (result) => {
      if (!result || !result.success) {
        alert(
          "補派失敗：" +
          (result && result.message ? result.message : "未知錯誤")
        );
        return;
      }

      alert(result.message || "缺漏案件補派完成。");
      loadMonthlyDispatchDashboard();
      reloadPendingList();
    }
  );
}

function createSingleMonthlyDispatch() {
  if (!currentUser || currentUser.role !== "教育中心") return;

  const month = normalizeRocMonthForDispatch_(
    getTrimmedValue("dispatch-admin-month")
  );
  const employeeId = getTrimmedValue(
    "dispatch-single-employee"
  );
  const override = Boolean(
    document.getElementById("dispatch-allow-override")?.checked
  );

  if (!month) {
    alert("請先輸入正確民國年月。");
    return;
  }

  if (!employeeId) {
    alert("請選擇要補派的人員。");
    return;
  }

  const candidate = (window.monthlyDispatchCandidates || []).find(
    (item) => String(item.employeeId) === employeeId
  );

  if (
    candidate &&
    !candidate.needsEvaluation &&
    !override
  ) {
    alert(
      "此人員在員工主檔J欄不是「是」。\n如確定臨時加入，請勾選允許補派。"
    );
    return;
  }

  if (!requireFutureDispatchConfirmation_(month)) {
    return;
  }

  if (
    !isFutureDispatchMonth_(month) &&
    !confirm(`確定為 ${employeeId} 建立 ${month} 的R0考核案件嗎？`)
  ) {
    return;
  }

  callAPI(
    "createSingleMonthlyDispatch",
    {
      rocMonth: month,
      targetEmployeeId: employeeId,
      allowOverride: override,
      allowFuture: getMonthlyDispatchFutureOverride_(),
      empId: currentUser.empId
    },
    (result) => {
      if (!result || !result.success) {
        alert(
          "單一人員補派失敗：" +
          (result && result.message ? result.message : "未知錯誤")
        );
        return;
      }

      alert(result.message || "單一人員案件建立完成。");
      loadMonthlyDispatchDashboard();
      reloadPendingList();
    }
  );
}

function syncMonthlyDispatchAssignments() {
  if (!currentUser || currentUser.role !== "教育中心") return;

  if (!confirm("確定同步所有未結案案件的目前店別、轄區及處別嗎？\n既有分數、評語與簽名不會清除。")) {
    return;
  }

  callAPI(
    "syncMonthlyDispatchAssignments",
    {
      empId: currentUser.empId
    },
    (result) => {
      if (!result || !result.success) {
        alert(
          "調店同步失敗：" +
          (result && result.message ? result.message : "未知錯誤")
        );
        return;
      }

      alert(result.message || "調店同步完成。");
      loadMonthlyDispatchDashboard();
      reloadPendingList();
    }
  );
}


function getTrimmedValue(id) {
  const element = document.getElementById(id);
  return element
    ? String(element.value || "").trim()
    : "";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.innerText = String(value ?? "");
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value =
      value === null || value === undefined
        ? ""
        : String(value);
  }
}

function showElement(id) {
  const element = document.getElementById(id);
  if (element) element.classList.remove("hidden");
}

function hideElement(id) {
  const element =
    typeof id === "string"
      ? document.getElementById(id)
      : id;

  if (element) element.classList.add("hidden");
}

function disableElement(id, disabled) {
  const element = document.getElementById(id);
  if (!element) return;

  element.disabled = disabled;

  if (disabled) {
    element.classList.add(
      "bg-gray-100",
      "text-gray-500"
    );
  } else {
    element.classList.remove(
      "bg-gray-100",
      "text-gray-500"
    );
  }
}

function setSectionInputsDisabled(
  sectionId,
  disabled
) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  section
    .querySelectorAll("input, textarea, button")
    .forEach((element) => {
      if (
        element.closest("[id^='sig-block-']") &&
        disabled
      ) {
        return;
      }

      element.disabled = disabled;
    });

  section
    .querySelectorAll("input, textarea")
    .forEach((element) => {
      if (disabled) {
        element.classList.add(
          "bg-gray-100",
          "text-gray-500"
        );
      } else {
        element.classList.remove(
          "bg-gray-100",
          "text-gray-500"
        );
      }
    });
}

function isIntegerInRange(value, min, max) {
  const numberValue = Number(value);

  return (
    Number.isInteger(numberValue) &&
    numberValue >= min &&
    numberValue <= max
  );
}

function isNonNegativeInteger(value) {
  const numberValue = Number(value);

  return (
    Number.isInteger(numberValue) &&
    numberValue >= 0
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
