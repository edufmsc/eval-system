// =================================================================
// 前端模組 4：UI 打分渲染、實時總分看板運算、流程流轉與資料真空洗白引擎
// =================================================================

// 🔒 1. 頂層極速靜態阻斷：如果檢測到預存 Session，直接硬核注入 CSS 鎖死畫面，100% 防止 F5 刷新閃現登入頁
(function() {
  if (localStorage.getItem('hsz_eval_session')) {
    const style = document.createElement('style');
    style.id = 'anti-flash-style';
    style.innerHTML = '#login-container { display: none !important; } #app-container { display: block !important; }';
    document.head.appendChild(style);
  }
})();

const metrics = [
  { id: 1, title: "責任感", ranges: [{ label: "8 ~ 10 分", min: 8, max: 10, text: "責任感相當強,可以充分信賴,無須任何督促。" }, { label: "6 ~ 7 分", min: 6, max: 7, text: "可獨自負責,處事穩健,須偶爾督促。" }, { label: "3 ~ 5 分", min: 3, max: 5, text: "可以信賴,但須略加督促。" }, { label: "1 ~ 2 分", min: 1, max: 2, text: "處事被動,不積極,必須有人經常加以督促。" }] },
  { id: 2, title: "協調性", ranges: [{ label: "8 ~ 10 分", min: 8, max: 10, text: "能主動與人協調與上級員維持和諧關係,同事極願與其合作。" }, { label: "6 ~ 7 分", min: 6, max: 7, text: "能與人和諧相處,願接納他人意見而不固執,偶亦屬熱心助人。" }, { label: "3 ~ 5 分", min: 3, max: 5, text: "雖不特別致力於他人協調,但亦不與他人發生爭執與摩擦。" }, { label: "1 ~ 2 分", min: 1, max: 2, text: "缺乏協調與同事間偶爾會摩擦。" }] },
  { id: 3, title: "表達能力", ranges: [{ label: "8 ~ 10 分", min: 8, max: 10, text: "文筆、言談、論理明確,能化繁為簡,密而不漏。" }, { label: "6 ~ 7 分", min: 6, max: 7, text: "表達有條理,使人易於了解。" }, { label: "3 ~ 5 分", min: 3, max: 5, text: "表達平平,大致可了解其意,不致引人誤解。" }, { label: "1 ~ 2 分", min: 1, max: 2, text: "文筆生硬言談欠明確不易讓人了解。" }] },
  { id: 4, title: "學習態度", ranges: [{ label: "8 ~ 10 分", min: 8, max: 10, text: "針對突發狀況,能主動積極提出疑問虛心求救。" }, { label: "6 ~ 7 分", min: 6, max: 7, text: "能誠懇接受他人教導,但主動較弱。" }, { label: "3 ~ 5 分", min: 3, max: 5, text: "能誠懇接受他人教導,但主動較弱。" }, { label: "1 ~ 2 分", min: 1, max: 2, text: "不能主動學習,須加以督導。" }] },
  { id: 5, title: "解決問題能力", ranges: [{ label: "8 ~ 10 分", min: 8, max: 10, text: "針對可能發生之問題,極求解,並予以解決。能迅速謀求改善對策,需督促即可完成。" }, { label: "6 ~ 7 分", min: 6, max: 7, text: "具有解決問題之能力,但須督促完成。" }, { label: "3 ~ 5 分", min: 3, max: 5, text: "能謀求改善之道,但無擔當之魄力。" }, { label: "1 ~ 2 分", min: 1, max: 2, text: "無法迅速謀求改善對策,並有逃避之現象。" }] },
  { id: 6, title: "個人儀容", ranges: [{ label: "8 ~ 10 分", min: 8, max: 10, text: "整齊清潔,端正足為模範。" }, { label: "6 ~ 7 分", min: 6, max: 7, text: "重視清潔衛生。" }, { label: "3 ~ 5 分", min: 3, max: 5, text: "達到基本要求。" }, { label: "1 ~ 2 分", min: 1, max: 2, text: "我行我素,須經常糾正才會改進。" }] }
];

function renderMetrics() {
  const section = document.getElementById('score-section'); if(!section) return; section.innerHTML = '';
  metrics.forEach(m => {
    let rangesHTML = '';
    m.ranges.forEach(r => {
      let scoreButtons = '';
      for(let s = r.min; s <= r.max; s++) { scoreButtons += `<button type="button" onclick="selectExactScore(event, ${m.id}, ${s}, ${r.min}, ${r.max})" id="btn-score-${m.id}-${s}" class="px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-700 hover:border-orange-500 transition">${s}分</button>`; }
      rangesHTML += `<div id="range-card-${m.id}-${r.min}-${r.max}" onclick="clickRangeCard(${m.id}, ${r.min}, ${r.max})" class="p-4 border border-gray-200 rounded-xl bg-white cursor-pointer hover:bg-orange-50/50 hover:border-orange-300 transition duration-150"><div class="flex justify-between items-center mb-1"><span class="text-xs font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">${r.label}</span><span id="check-icon-${m.id}-${r.min}-${r.max}" class="text-orange-500 hidden"><i class="fa-solid fa-circle-check text-sm"></i></span></div><p class="text-sm text-gray-700 font-medium mb-3">${r.text}</p><div class="flex flex-wrap gap-2">${scoreButtons}</div></div>`;
    });
    section.innerHTML += `<div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3"><div class="flex justify-between items-center border-b pb-2"><span class="font-black text-gray-800 text-base flex items-center"><span class="w-1.5 h-5 brand-bg mr-2 rounded-full"></span>${m.id}. ${m.title}</span><span id="final-badge-${m.id}" class="text-xs font-black bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">未評分</span></div><div class="grid grid-cols-1 gap-3">${rangesHTML}</div></div>`;
  });
}

function selectExactScore(event, metricId, score, min, max, force = false) {
  if(event) event.stopPropagation(); if(isReadOnlyMode && !force) return; 
  const prevScore = selectedScores[metricId];
  if (prevScore) { const prevBtn = document.getElementById(`btn-score-${metricId}-${prevScore}`); if (prevBtn) prevBtn.className = "px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-700 hover:border-orange-500 transition"; }
  if (activeRanges[metricId]) { const prevKey = activeRanges[metricId]; const prevCard = document.getElementById(`range-card-${metricId}-${prevKey}`); if (prevCard) prevCard.className = "p-4 border border-gray-200 rounded-xl bg-white cursor-pointer"; const prevCheck = document.getElementById('check-icon-' + metricId + '-' + prevKey); if (prevCheck) prevCheck.classList.add('hidden'); }
  const key = `${min}-${max}`; const currentCard = document.getElementById(`range-card-${metricId}-${key}`); if (currentCard) currentCard.className = "p-4 border-2 border-orange-500 rounded-xl bg-orange-50/50 cursor-pointer ring-2 ring-orange-200 transition duration-150";
  const currentCheck = document.getElementById('check-icon-' + metricId + '-' + key); if (currentCheck) currentCheck.classList.remove('hidden');
  const btn = document.getElementById(`btn-score-${metricId}-${score}`); if (btn) btn.className = "px-4 py-1.5 brand-bg text-white border-transparent rounded-full text-xs font-bold shadow-md transition";
  selectedScores[metricId] = score; activeRanges[metricId] = key;
  const badge = document.getElementById('final-badge-' + metricId); if (badge) { badge.innerText = `${score} 分`; badge.className = "text-xs font-black brand-bg text-white px-2.5 py-1 rounded-full shadow-sm"; }
  updateTotalScore();
}
function clickRangeCard(metricId, min, max) { selectExactScore(null, metricId, max, min, max); }

// 🌟 分數大加總匯總同步：店長 (60) + 中心 (40) + 區主管微調 (10) 全面實時精準加總
function updateTotalScore() {
  let mgrTotal = 0; for (let i = 1; i <= 6; i++) { if (selectedScores[i]) mgrTotal += parseInt(selectedScores[i]); }
  let edu1 = parseFloat(document.getElementById('edu-score1')?.value) || 0;
  let edu2 = parseFloat(document.getElementById('edu-score2')?.value) || 0;
  let edu3 = parseFloat(document.getElementById('edu-score3')?.value) || 0;
  let edu4 = parseFloat(document.getElementById('edu-score4')?.value) || 0;
  let eduTotal = edu1 + edu2 + edu3 + edu4;
  
  let adjustVal = parseInt(document.getElementById('area-adjust-score')?.value) || 0;
  if ((isReadOnlyMode || currentUser.role !== "區主管") && window.loadedAdjustValue !== undefined) { adjustVal = window.loadedAdjustValue; }
  
  document.getElementById('sum-mgr').innerText = mgrTotal; document.getElementById('sum-grand-edu').innerText = eduTotal;
  document.getElementById('sum-adjust').innerText = (adjustVal >= 0 ? '+' : '') + adjustVal;
  document.getElementById('sum-grand').innerText = (mgrTotal + eduTotal + adjustVal);
}

// 🌟 解決問題 1 核心：徹底真空洗白重置引擎，包含舊進度條提示、唯讀橫幅全部隱藏清空
function resetFormFields() {
  selectedScores = {}; activeRanges = {}; window.currentFormRowIndex = 0; window.loadedAdjustValue = 0;
  document.getElementById('manager-comment').value = ''; document.getElementById('manager-comment').disabled = false;
  document.getElementById('manager-comment').className = "w-full p-4 border border-gray-300 rounded-xl text-base h-32 resize-none";
  
  // 清空教育中心與區主管欄位
  ['edu-score1', 'edu-score2', 'edu-score3', 'edu-score4', 'edu-accum', 'edu-ojt', 'edu-comment', 'area-adjust-score', 'area-comment', 'vp-comment'].forEach(id => {
    const el = document.getElementById(id); if(el) { el.value = ''; el.disabled = false; el.classList.remove('bg-gray-100', 'text-gray-500'); }
  });
  
  // 🌟 強制隱藏提示唯讀條與駁回鈕，解決切換人員時別人的進度殘留Bug！
  document.getElementById('readonly-banner').classList.add('hidden');
  document.getElementById('banner-text').innerText = '';
  document.getElementById('btn-reject-main').classList.add('hidden'); 
  document.getElementById('admin-control-box').classList.add('hidden'); 
  
  for(let i = 1; i <= 6; i++) { const badge = document.getElementById('final-badge-' + i); if(badge) { badge.innerText = "未評分"; badge.className = "text-xs font-black bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full"; } }
  renderMetrics();
  
  // 還原各簽章區預設結構
  document.getElementById('sig-block-manager').innerHTML = `<label class="block text-base font-black text-gray-700">店長簽章：</label><div id="saved-sig-box" class="hidden"><label class="inline-flex items-center cursor-pointer py-1"><input type="checkbox" id="use-saved-sig" onchange="toggleSignatureType('signature-canvas', 'use-saved-sig')" class="w-5 h-5 rounded text-orange-600 border-gray-300"><span class="ml-2 text-sm font-bold text-gray-700">使用系統預存簽名確認</span></label></div><div id="canvas-wrapper-signature-canvas" class="relative bg-white border-2 border-gray-300 rounded-xl overflow-hidden h-44 w-full"><canvas id="signature-canvas" width="1000" height="250" class="w-full h-full block bg-white cursor-crosshair"></canvas><button type="button" onclick="clearSig('signature-canvas')" class="absolute bottom-3 right-3 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition">清除</button></div>`;
  document.getElementById('sig-block-edu').innerHTML = `<label class="block text-sm font-bold text-gray-700">教育中心負責人簽章：</label><div id="saved-sig-box-edu" class="hidden mb-2"><label class="inline-flex items-center cursor-pointer py-1"><input type="checkbox" id="use-saved-sig-edu" onchange="toggleSignatureType('signature-canvas-edu', 'use-saved-sig-edu')" class="w-5 h-5 rounded text-orange-600 border-gray-300"><span class="ml-2 text-sm font-bold text-gray-700">使用系統預存簽名確認</span></label></div><div id="canvas-wrapper-signature-canvas-edu" class="relative bg-white border-2 border-gray-300 rounded-xl overflow-hidden h-44 w-full"><canvas id="signature-canvas-edu" width="1000" height="250" class="w-full h-full block bg-white cursor-crosshair"></canvas><button type="button" onclick="clearSig('signature-canvas-edu')" class="absolute bottom-2 right-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg">清除</button></div>`;
  document.getElementById('sig-block-area').innerHTML = `<label class="block text-sm font-bold text-gray-700">區主管核章：</label><div id="saved-sig-box-area" class="hidden mb-2"><label class="inline-flex items-center cursor-pointer py-1"><input type="checkbox" id="use-saved-sig-area" onchange="toggleSignatureType('signature-canvas-area', 'use-saved-sig-area')" class="w-5 h-5 rounded text-orange-600 border-gray-300"><span class="ml-2 text-sm font-bold text-gray-700">使用系統預存簽名確認</span></label></div><div id="canvas-wrapper-signature-canvas-area" class="relative bg-white border-2 border-gray-300 rounded-xl overflow-hidden h-44 w-full"><canvas id="signature-canvas-area" width="1000" height="250" class="w-full h-full block bg-white cursor-crosshair"></canvas><button type="button" onclick="clearSig('signature-canvas-area')" class="absolute bottom-2 right-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg">清除</button></div>`;
  document.getElementById('sig-block-student').innerHTML = `<label class="block text-sm font-bold text-gray-700">學員親筆簽章：</label><div id="saved-sig-box-student" class="hidden mb-2"><label class="inline-flex items-center cursor-pointer py-1"><input type="checkbox" id="use-saved-sig-student" onchange="toggleSignatureType('signature-canvas-student', 'use-saved-sig-student')" class="w-5 h-5 rounded text-orange-600 border-gray-300"><span class="ml-2 text-sm font-bold text-gray-700">使用系統預存簽名確認</span></label></div><div id="canvas-wrapper-signature-canvas-student" class="relative bg-white border-2 border-gray-300 rounded-xl overflow-hidden h-44 w-full"><canvas id="signature-canvas-student" width="1000" height="250" class="w-full h-full block bg-white cursor-crosshair"></canvas><button type="button" onclick="clearSig('signature-canvas-student')" class="absolute bottom-2 right-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg">清除</button></div>`;
  document.getElementById('sig-block-vp').innerHTML = `<label class="block text-sm font-bold text-gray-700">營業副總核章：</label><div id="saved-sig-box-vp" class="hidden mb-2"><label class="inline-flex items-center cursor-pointer py-1"><input type="checkbox" id="use-saved-sig-vp" onchange="toggleSignatureType('signature-canvas-vp', 'use-saved-sig-vp')" class="w-5 h-5 rounded text-orange-600 border-gray-300"><span class="ml-2 text-sm font-bold text-gray-700">使用系統預存簽名確認</span></label></div><div id="canvas-wrapper-signature-canvas-vp" class="relative bg-white border-2 border-gray-300 rounded-xl overflow-hidden h-44 w-full"><canvas id="signature-canvas-vp" width="1000" height="250" class="w-full h-full block bg-white cursor-crosshair"></canvas><button type="button" onclick="clearSig('signature-canvas-vp')" class="absolute bottom-2 right-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg">清除</button></div>`;
  document.getElementById('sig-block-gm').innerHTML = `<label class="block text-sm font-bold text-purple-900 font-bold">總經理最高核定簽章：</label><div id="saved-sig-box-gm" class="hidden mb-2"><label class="inline-flex items-center cursor-pointer py-1"><input type="checkbox" id="use-saved-sig-gm" onchange="toggleSignatureType('signature-canvas-gm', 'use-saved-sig-gm')" class="w-5 h-5 rounded text-orange-600 border-gray-300"><span class="ml-2 text-sm font-bold text-gray-700">使用系統預存簽名確認</span></label></div><div id="canvas-wrapper-signature-canvas-gm" class="relative bg-white border-2 border-gray-300 rounded-xl overflow-hidden h-44 w-full"><canvas id="signature-canvas-gm" width="1000" height="250" class="w-full h-full block bg-white cursor-crosshair"></canvas><button type="button" onclick="clearSig('signature-canvas-gm')" class="absolute bottom-2 right-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg">清除</button></div>`;
  
  // 預設先完全封鎖後續關卡
  document.getElementById('section-edu').classList.add('hidden');
  document.getElementById('section-area').classList.add('hidden');
  document.getElementById('section-student-confirm').classList.add('hidden');
  document.getElementById('section-vp').classList.add('hidden');
  document.getElementById('section-gm').classList.add('hidden');
  updateTotalScore();
}

// 🌟 解決教育中心三視角需求：動態在「審核單」上方塞入管理者「全關卡進度追蹤庫」
function reloadPendingList() {
  lockAllWorkflow(); document.getElementById('pending-form-select').value = '';
  callAPI("getPendingForms", { role: currentUser.role, dept: currentUser.dept, area: currentUser.area, empId: currentUser.empId }, function(list) {
    pendingFormCache = list; const select = document.getElementById('pending-form-select');
    select.innerHTML = `<option value="">-- 您目前有 ${list.length} 筆『要由我填寫認證』的待辦單據 --</option>`;
    list.forEach((f, idx) => { select.innerHTML += `<option value="${idx}">${f.month} 待處理認證：${f.underlingName}</option>`; });
    if (list.length === 1) { select.value = "0"; onPendingFormChange(); }
    updateSubmitButtonText();
    
    // 👑 管理員特許：如果是教育中心登入，當場憑空打造「全公司進行中關卡追蹤欄位」
    if (currentUser.role === "教育中心" && !document.getElementById('admin-progress-box')) {
      let reviewerBox = document.getElementById('reviewer-select-box');
      if (reviewerBox) {
        let adminBox = document.createElement('div'); adminBox.id = "admin-progress-box";
        adminBox.className = "bg-blue-50 p-4 rounded-xl border border-blue-200 mt-2 space-y-2";
        adminBox.innerHTML = `
          <label class="block text-base font-black text-blue-700"><i class="fa-solid fa-eye mr-1"></i> 🔍 監控中心一（欄位一）：追蹤查看全公司目前各關卡「進行中」進度：</label>
          <select id="admin-stage-select" onchange="onAdminStageChange()" class="w-full p-2.5 border border-blue-400 rounded-xl font-bold text-sm bg-white cursor-pointer">
            <option value="">-- 請選取欲追蹤監控的流程階段 --</option>
            <option value="待區主管審核">監控：目前正卡在【待區主管審核】的考核單</option>
            <option value="待學員確認">監控：目前正卡在【待學員確認】的考核單</option>
            <option value="待營業副總核記">監控：目前正卡在【待營業副總核記】的考核單</option>
            <option value="待總經理核定">監控：目前正卡在【待總經理核定】的考核單</option>
            <option value="店長退回修改">監控：目前正卡在【店長端退回修改】的考核單</option>
          </select>
          <select id="admin-progress-form-select" onchange="onAdminProgressFormChange()" class="w-full p-2.5 border border-blue-300 rounded-xl font-bold text-sm bg-white cursor-pointer hidden"></select>
        `;
        reviewerBox.parentNode.insertBefore(adminBox, reviewerBox.nextSibling);
      }
    }
  });
}

// 監控中心切換邏輯
function onAdminStageChange() {
  const stage = document.getElementById('admin-stage-select').value;
  const progressSelect = document.getElementById('admin-progress-form-select');
  if(!stage) { progressSelect.classList.add('hidden'); return; }
  
  let mockRole = "區主管"; if(stage==="待學員確認") mockRole="學員"; if(stage==="待營業副總核記") mockRole="營業副總"; if(stage==="待總經理核定") mockRole="總經理"; if(stage==="店長退回修改") mockRole="店長";
  showLoading(true);
  callAPI("getPendingForms", { role: mockRole, dept: "", area: "", empId: "" }, function(list) {
    showLoading(false); window.adminProgressCache = list;
    progressSelect.innerHTML = `<option value="">-- 此關卡目前共有 ${list.length} 筆單據，請選取以最高權限查閱/指派 --</option>`;
    list.forEach((f, idx) => { progressSelect.innerHTML += `<option value="${idx}">${f.month} - ${f.store} - 儲備幹部：${f.underlingName}</option>`; });
    progressSelect.classList.remove('hidden');
  });
}
function onAdminProgressFormChange() {
  const idx = document.getElementById('admin-progress-form-select').value; if(idx==="") return lockAllWorkflow();
  renderSingleFormToView(window.adminProgressCache[idx]);
  document.getElementById('admin-control-box').classList.remove('hidden'); // 開啟流程總控
}

function loadHistoryList() {
  if(!currentUser) return;
  callAPI("getHistoryForms", { role: currentUser.role, dept: currentUser.dept, area: currentUser.area, empId: currentUser.empId, store: currentUser.store }, function(list) {
    historyFormCache = list; const box = document.getElementById('history-select-box'); const select = document.getElementById('history-form-select');
    if (list && list.length > 0) { box.classList.remove('hidden'); select.innerHTML = `<option value="">-- 📥 監控中心二（欄位二）：封存調閱區 ── 共有 ${list.length} 筆結案考核表 --</option>`; list.forEach((f, idx) => { select.innerHTML += `<option value="${idx}">【${f.month} 已結案封存】 儲備幹部：${f.underlingName} (${f.store})</option>`; }); } 
    else { box.classList.add('hidden'); }
  });
}

function loadUnderlings(store) {
  callAPI("getUnderlings", { store: store }, function(list) {
    subordinateCache = list; const select = document.getElementById('underling-select'); select.innerHTML = '<option value="">-- 請選擇店內學員 --</option>';
    list.forEach(u => { let tag = u.alreadyEval ? ` [本月已起單 - ${u.currentStatus}]` : ''; select.innerHTML += `<option value="${u.empId}">${u.name} (${u.empId})${tag}</option>`; });
    updateSubmitButtonText();
  });
}

// 🌟 完美修復學員/店長崩潰大Bug：將原本錯誤的 max = range.max 修正為純粹的 range.max 語法
function highlightMetricScores(scoresArray) { 
  for(let i = 1; i <= 6; i++) { 
    let score = parseInt(scoresArray[i-1]); 
    let metric = metrics.find(m => m.id === i); 
    let range = metric.ranges.find(r => score >= r.min && score <= r.max); 
    if (range) selectExactScore(null, i, score, range.min, range.max, true); 
  } 
}

function onUnderlingChange() {
  resetFormFields(); const selectedId = document.getElementById('underling-select').value; if (!selectedId) return lockAllWorkflow();
  const sub = subordinateCache.find(u => u.empId === selectedId);
  document.getElementById('info-name').innerText = sub.name; document.getElementById('info-store').innerText = sub.store;
  document.getElementById('info-transfer').innerText = sub.transferDate || "-"; document.getElementById('info-eval-date').innerText = sub.alreadyEval ? sub.evalDate : getMinguoToday();
  
  document.getElementById('info-card-container').classList.remove('hidden'); document.getElementById('score-summary-card').classList.remove('hidden');
  document.getElementById('workflow-box').classList.remove('hidden'); document.getElementById('section-manager').classList.remove('hidden');
  setupGlobalSavedSignature();

  if (sub.alreadyEval) {
    if (sub.currentStatus === "店長退回修改") {
      isReadOnlyMode = false; document.getElementById('readonly-banner').classList.remove('hidden');
      document.getElementById('banner-text').innerText = `⚠️ 該同仁單據已被退回修改！請修正後重新送出。`;
      document.getElementById('btn-submit-main').classList.remove('hidden'); window.currentFormRowIndex = sub.rowIndex; 
      highlightMetricScores(sub.historyData.scores); document.getElementById('manager-comment').value = sub.historyData.comment;
      initCanvasDevice('signature-canvas'); toggleSignatureType('signature-canvas', 'use-saved-sig');
    } else {
      isReadOnlyMode = true; document.getElementById('readonly-banner').classList.remove('hidden');
      document.getElementById('banner-text').innerText = `📢 【${sub.historyData.month}】此同仁本月考核進度：【${sub.currentStatus}】`;
      document.getElementById('btn-submit-main').classList.add('hidden'); 
      highlightMetricScores(sub.historyData.scores); document.getElementById('manager-comment').value = sub.historyData.comment;
      document.getElementById('manager-comment').disabled = true; document.getElementById('manager-comment').classList.add('bg-gray-100');
      document.getElementById('sig-block-manager').innerHTML = `<div class="p-3 bg-gray-100 rounded-xl text-sm font-black text-gray-700"><i class="fa-solid fa-circle-check text-green-600 mr-1"></i> 【店長端】已核章完成 (核章日期：${sub.evalDate})</div>`;
      
      if (sub.historyData.eduData && sub.historyData.eduData.score1 !== undefined && sub.historyData.eduData.score1 !== "") showEduSectionReadOnly(sub.historyData, sub.evalDate);
      if (sub.historyData.areaComment) {
        let loadedAdjustVal = 0; let cleanAreaComment = sub.historyData.areaComment;
        let match = sub.historyData.areaComment.match(/【主管增減分：([+-]?\d+)分】\n?/);
        if (match) { loadedAdjustVal = parseInt(match[1]); cleanAreaComment = sub.historyData.areaComment.replace(match[0], ""); }
        window.loadedAdjustValue = loadedAdjustVal; showAreaSectionReadOnly(cleanAreaComment, loadedAdjustVal, sub.evalDate);
      }
    }
    updateTotalScore();
  } else {
    // 🌟 解決點 2：店長寫新同仁起單時，保持絕對真空，100% 不載入任何後續欄位！
    isReadOnlyMode = false; window.loadedAdjustValue = 0; updateTotalScore();
  }
}

function onPendingFormChange() { resetFormFields(); const idx = document.getElementById('pending-form-select').value; if (idx !== "") renderSingleFormToView(pendingFormCache[idx]); }
function onHistoryFormChange() { resetFormFields(); const idx = document.getElementById('history-form-select').value; if (idx !== "") renderSingleFormToView(historyFormCache[idx]); }

function renderSingleFormToView(f) {
  isReadOnlyMode = false; window.currentFormRowIndex = f.rowIndex;
  document.getElementById('info-name').innerText = f.underlingName; document.getElementById('info-store').innerText = f.store;
  document.getElementById('info-transfer').innerText = f.transferDate || "-"; document.getElementById('info-eval-date').innerText = f.evalDate;
  document.getElementById('info-card-container').classList.remove('hidden'); document.getElementById('score-summary-card').classList.remove('hidden');
  document.getElementById('workflow-box').classList.remove('hidden'); document.getElementById('btn-submit-main').classList.remove('hidden');
  
  document.getElementById('section-manager').classList.remove('hidden'); document.getElementById('manager-comment').value = f.managerComment;
  document.getElementById('manager-comment').disabled = true; document.getElementById('manager-comment').classList.add('bg-gray-100');
  document.getElementById('sig-block-manager').innerHTML = `<div class="p-3 bg-gray-100 rounded-xl text-sm font-black text-gray-700"><i class="fa-solid fa-circle-check text-green-600 mr-1"></i> 【店長端】已核章完成 (核章日期：${f.evalDate})</div>`;
  
  highlightMetricScores(f.scores); isReadOnlyMode = true;
  let loadedAdjustVal = 0; let cleanAreaComment = f.areaComment || "";
  if (f.areaComment) { let match = f.areaComment.match(/【主管增減分：([+-]?\d+)分】\n?/); if (match) { loadedAdjustVal = parseInt(match[1]); cleanAreaComment = f.areaComment.replace(match[0], ""); } }
  window.loadedAdjustValue = loadedAdjustVal;

  const role = currentUser.role; setupGlobalSavedSignature();
  
  // 🌟 補入缺失與已結案完整長官字樣、評語、日期通道 (解決問題1)
  if (f.eduData && f.eduData.score1) showEduSectionReadOnly(f, f.evalDate);
  if (f.areaComment) showAreaSectionReadOnly(cleanAreaComment, loadedAdjustVal, f.evalDate);
  if (f.studentSig || f.currentStatus === "結案" || f.currentStatus === "待營業副總核記" || f.currentStatus === "待總經理核定") { document.getElementById('section-student-confirm').classList.remove('hidden'); document.getElementById('sig-block-student').innerHTML = `<div class="p-3 bg-gray-100 rounded-xl text-sm font-black text-gray-700"><i class="fa-solid fa-circle-check text-green-600 mr-1"></i> 【儲備幹部學員】已簽署確認 (確認日期：${f.evalDate})</div>`; }
  if (f.vpComment || f.currentStatus === "結案" || f.currentStatus === "待總經理核定") { document.getElementById('section-vp').classList.remove('hidden'); document.getElementById('vp-comment').value = f.vpComment || ""; document.getElementById('vp-comment').disabled = true; document.getElementById('sig-block-vp').innerHTML = `<div class="p-3 bg-gray-100 rounded-xl text-sm font-black text-gray-700"><i class="fa-solid fa-circle-check text-green-600 mr-1"></i> 【營業副總】已簽核核記 (核章日期：${f.evalDate})</div>`; }
  if (f.gmSig || f.currentStatus === "結案") { document.getElementById('section-gm').classList.remove('hidden'); document.getElementById('sig-block-gm').innerHTML = `<div class="p-3 bg-gray-100 rounded-xl text-sm font-black text-purple-700"><i class="fa-solid fa-crown text-purple-600 mr-1"></i> 【總經理最高核定】本考核案已完簽正式結案 (結案日期：${f.evalDate})</div>`; }

  // 權限解鎖與介面指派
  if (role === "教育中心") {
    document.getElementById('admin-control-box').classList.remove('hidden'); document.getElementById('section-edu').classList.remove('hidden');
    document.getElementById('section-edu').querySelectorAll('input, textarea').forEach(el => el.disabled = false);
    toggleSignatureType('signature-canvas-edu', 'use-saved-sig-edu');
  } 
  else if (role === "區主管") {
    document.getElementById('section-area').classList.remove('hidden'); document.getElementById('area-adjust-score').value = ""; document.getElementById('area-adjust-score').disabled = false; document.getElementById('area-comment').value = ""; document.getElementById('area-comment').disabled = false;
    toggleSignatureType('signature-canvas-area', 'use-saved-sig-area');
  } 
  else if (role === "學員") {
    document.getElementById('section-student-confirm').classList.remove('hidden'); toggleSignatureType('signature-canvas-student', 'use-saved-sig-student');
  }
  else if (role === "營業副總") {
    document.getElementById('section-vp').classList.remove('hidden'); document.getElementById('vp-comment').value = ''; document.getElementById('vp-comment').disabled = false;
    toggleSignatureType('signature-canvas-vp', 'use-saved-sig-vp');
  } 
  else if (role === "總經理") {
    document.getElementById('section-gm').classList.remove('hidden'); toggleSignatureType('signature-canvas-gm', 'use-saved-sig-gm');
  }

  if (role !== "店長" && f.currentStatus !== "結案") {
    const rejectBtn = document.getElementById('btn-reject-main'); rejectBtn.classList.remove('hidden');
    if (role === "學員") rejectBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-2"></i>考核內容有疑慮，退回店長重新起單`;
    else if (role === "教育中心") rejectBtn.innerHTML = `<i class="fa-solid fa-ban mr-2"></i>駁回退回店長修改`;
    else if (role === "區主管") rejectBtn.innerHTML = `<i class="fa-solid fa-ban mr-2"></i>駁回退回教育中心重填`;
    else if (role === "營業副總") rejectBtn.innerHTML = `<i class="fa-solid fa-ban mr-2"></i>駁回退回區主管重審`;
    else if (role === "總經理") rejectBtn.innerHTML = `<i class="fa-solid fa-ban mr-2"></i>駁回退回營業副總重審`;
  }
  updateTotalScore(); // 🌟 強制在大看板加載最後，引爆實時三維總分大同步！
}

function showEduSectionReadOnly(f, date) {
  document.getElementById('section-edu').classList.remove('hidden');
  let eduAccum = ""; let eduOjt = ""; let cleanEduComment = f.eduData.comment || "";
  let eduMatch = cleanEduComment.match(/【職能累計：(.*?)分｜OJT完成：(.*?)篇】\n?/);
  if (eduMatch) { eduAccum = eduMatch[1]; eduOjt = eduMatch[2]; cleanEduComment = cleanEduComment.replace(eduMatch[0], ""); }
  
  document.getElementById('edu-score1').value = f.eduData.score1; document.getElementById('edu-score2').value = f.eduData.score2;
  document.getElementById('edu-score3').value = f.eduData.score3; document.getElementById('edu-score4').value = f.eduData.score4;
  document.getElementById('edu-accum').value = eduAccum; document.getElementById('edu-ojt').value = eduOjt;
  document.getElementById('edu-comment').value = cleanEduComment;
  document.getElementById('section-edu').querySelectorAll('input, textarea').forEach(el => el.disabled = true);
  document.getElementById('sig-block-edu').innerHTML = `<div class="p-3 bg-gray-100 rounded-xl text-sm font-black text-gray-700"><i class="fa-solid fa-circle-check text-green-600 mr-1"></i> 【教育中心】已核章完成 (核章日期：${date})</div>`;
}

function showAreaSectionReadOnly(cleanComment, adjustVal, date) {
  document.getElementById('section-area').classList.remove('hidden'); document.getElementById('area-adjust-score').value = adjustVal;
  document.getElementById('area-adjust-score').disabled = true; document.getElementById('area-comment').value = cleanComment;
  document.getElementById('area-comment').disabled = true; document.getElementById('sig-block-area').innerHTML = `<div class="p-3 bg-gray-100 rounded-xl text-sm font-black text-gray-700"><i class="fa-solid fa-circle-check text-green-600 mr-1"></i> 【區主管】已核章完成 (核章日期：${date})</div>`;
}

function updateSubmitButtonText() {
  if(!currentUser) return; const btn = document.getElementById('btn-submit-main');
  const textMap = { "店長": "確認考核表 - 建立起單送出", "教育中心": "確認考核表 - 教育中心認證送出", "區主管": "確認考核表 - 區主管簽章審核送出", "學員": "儲備幹部本人確認並簽章送出", "營業副總": "確認考核表 - 營業副總核記送出", "總經理": "最高核定確認 - 正式結案歸檔 🏆" };
  if(textMap[currentUser.role]) btn.innerText = textMap[currentUser.role];
}

function executeForceReset() {
  let f = null; const pendingIdx = document.getElementById('pending-form-select').value; const historyIdx = document.getElementById('history-form-select').value; const adminIdx = document.getElementById('admin-progress-form-select')?.value;
  if (pendingIdx !== "" && pendingIdx !== undefined) f = pendingFormCache[pendingIdx]; 
  else if (historyIdx !== "" && historyIdx !== undefined) f = historyFormCache[historyIdx];
  else if (adminIdx !== "" && adminIdx !== undefined) f = window.adminProgressCache[adminIdx];
  
  if (!f) return alert("📢 請先選定欲手動流轉控管的單據物件！");
  const targetStatus = document.getElementById('force-reset-select').value; if(!targetStatus) return alert("請選取欲手動流轉的目標流程進度！");
  
  if(confirm(`最高控管：確定強制流轉狀態為【${targetStatus}】？`)) {
    showLoading(true);
    callAPI("forceResetStage", { rowIndex: f.rowIndex, targetStatus: targetStatus, empId: currentUser.empId }, function(res) {
      showLoading(false); alert("⚙️ " + res.message); reloadPendingList(); loadHistoryList();
      if(document.getElementById('admin-stage-select')) document.getElementById('admin-stage-select').value = '';
      if(document.getElementById('admin-progress-form-select')) document.getElementById('admin-progress-form-select').classList.add('hidden');
    });
  }
}

function rejectForm() {
  if (!currentUser) return; const role = currentUser.role; let reason = "";
  if (role === "學員") {
    reason = prompt("⚠️ 儲備幹部您好，請填寫您對考核內容有疑慮之原因（本單將一鍵直接跨級退回給分店店長重新跑流程）：");
    if (!reason || reason.trim() === "") return alert("學員反映考核疑慮『必須填寫具體原因』！操作已安全拒絕。");
  } else { if(!confirm("確定要將本月考核單據退回修改嗎？")) return; }
  
  showLoading(true);
  callAPI("submitStage", { role: role, formData: { rowIndex: window.currentFormRowIndex, isReject: true, rejectReason: reason ? reason.trim() : "" } }, function(res) {
    showLoading(false); if(res.success) { alert("🚫 " + res.message); reloadPendingList(); } else { alert("❌ 操作失敗：" + res.message); }
  });
}

function submitForm() {
  const role = currentUser.role; let payload = {};
  const chkMap = { "店長": "use-saved-sig", "教育中心": "use-saved-sig-edu", "區主管": "use-saved-sig-area", "學員": "use-saved-sig-student", "營業副總": "use-saved-sig-vp", "總經理": "use-saved-sig-gm" };
  const cvsMapId = { "店長": "signature-canvas", "教育中心": "signature-canvas-edu", "區主管": "signature-canvas-area", "學員": "signature-canvas-student", "營業副總": "signature-canvas-vp", "總經理": "signature-canvas-gm" };
  
  let useSavedSig = document.getElementById(chkMap[role]) ? document.getElementById(chkMap[role]).checked : false;
  let targetCvs = cvsMapId[role];
  if (!useSavedSig && isCanvasBlank(targetCvs)) return alert("請完成本關章節手寫簽名，或勾選使用預存簽名！");

  if (role === "店長") {
    const subId = document.getElementById('underling-select').value; const comment = document.getElementById('manager-comment').value.trim();
    for(let i=1; i<=6; i++) { if(!selectedScores[i]) return alert(`請完成第 ${i} 項指標打分！`); }
    if(!comment) return alert("請填寫綜合評語！");
    payload = { managerId: currentUser.empId, store: currentUser.store, underlingId: subId, underlingName: document.getElementById('info-name').innerText, score1: selectedScores[1], score2: selectedScores[2], score3: selectedScores[3], score4: selectedScores[4], score5: selectedScores[5], score6: selectedScores[6], comment: comment, evalDate: getMinguoToday(), signatureType: useSavedSig ? "saved" : "manual", signatureBase64: useSavedSig ? "" : canvasMap['signature-canvas'].cvs.toDataURL(), savedSignaturePath: currentUser.savedSignature, rowIndex: window.currentFormRowIndex || 0 };
  } 
  else if (role === "教育中心") {
    const sc1 = document.getElementById('edu-score1').value.trim(); const sc2 = document.getElementById('edu-score2').value.trim();
    const sc3 = document.getElementById('edu-score3').value.trim(); const sc4 = document.getElementById('edu-score4').value.trim();
    const accum = document.getElementById('edu-accum').value.trim(); const ojt = document.getElementById('edu-ojt').value.trim();
    const eduComment = document.getElementById('edu-comment').value.trim();
    if(!sc1 || !sc2 || !sc3 || !sc4 || !accum || !ojt) return alert("請完整輸入 4 項成果分數、累計積分、OJT篇數與報告！");
    
    let combinedEduComment = `【職能累計：${accum}分｜OJT完成：${ojt}篇】\n${eduComment}`;
    payload = { rowIndex: window.currentFormRowIndex, empId: currentUser.empId, edu1: sc1, edu2: sc2, edu3: sc3, edu4: sc4, eduComment: combinedEduComment, signatureType: useSavedSig ? "saved" : "manual", signatureBase64: useSavedSig ? "" : canvasMap['signature-canvas-edu'].cvs.toDataURL(), savedSignaturePath: currentUser.savedSignature };
  }
  else if (role === "區主管") {
    const adjustVal = parseInt(document.getElementById('area-adjust-score').value) || 0; const areaComment = document.getElementById('area-comment').value.trim();
    if(adjustVal < -10 || adjustVal > 10) return alert("區主管加減分數自由輸入區間限於 -10 ~ +10 分！");
    if(!areaComment) return alert("請填寫區主管評語！");
    let combinedComment = `【主管增減分：${adjustVal >= 0 ? '+' : ''}${adjustVal}分】\n${areaComment}`;
    payload = { rowIndex: window.currentFormRowIndex, empId: currentUser.empId, areaComment: combinedComment, signatureType: useSavedSig ? "saved" : "manual", signatureBase64: useSavedSig ? "" : canvasMap['signature-canvas-area'].cvs.toDataURL(), savedSignaturePath: currentUser.savedSignature };
  }
  else if (role === "學員") { payload = { rowIndex: window.currentFormRowIndex, empId: currentUser.empId, signatureType: useSavedSig ? "saved" : "manual", signatureBase64: useSavedSig ? "" : canvasMap['signature-canvas-student'].cvs.toDataURL(), savedSignaturePath: currentUser.savedSignature }; }
  else if (role === "營業副總") {
    const vpComment = document.getElementById('vp-comment').value.trim(); // 營業副總評語改為選填放行
    payload = { rowIndex: window.currentFormRowIndex, empId: currentUser.empId, vpComment: vpComment, signatureType: useSavedSig ? "saved" : "manual", signatureBase64: useSavedSig ? "" : canvasMap['signature-canvas-vp'].cvs.toDataURL(), savedSignaturePath: currentUser.savedSignature };
  }
  else if (role === "總經理") { payload = { rowIndex: window.currentFormRowIndex, empId: currentUser.empId, signatureType: useSavedSig ? "saved" : "manual", signatureBase64: useSavedSig ? "" : canvasMap['signature-canvas-gm'].cvs.toDataURL(), savedSignaturePath: currentUser.savedSignature }; }

  let confirmMsg = "確定要提交送出單據嗎？";
  if (role === "總經理") confirmMsg = "確定要進行最終最高裁決核定結案嗎？";

  if(confirm(confirmMsg)) {
    showLoading(true);
    callAPI("submitStage", { role: currentUser.role, formData: payload }, function(res) {
      showLoading(false);
      if(res.success) { 
        alert("🎉 " + res.message); 
        if(currentUser.role === "店長") { loadUnderlings(currentUser.store); lockAllWorkflow(); document.getElementById('underling-select').value = ''; } 
        else { reloadPendingList(); }
        loadHistoryList();
      } else { alert("❌ 儲存失敗：" + res.message); }
    });
  }
}

function showLoading(show) { const spinner = document.getElementById('loading-spinner'); if(spinner) spinner.classList[show ? 'remove' : 'add']('hidden'); }
function lockAllWorkflow() { document.getElementById('info-card-container').classList.add('hidden'); document.getElementById('score-summary-card').classList.add('hidden'); document.getElementById('workflow-box').classList.add('hidden'); document.getElementById('readonly-banner').classList.add('hidden'); }
function getMinguoToday() { const today = new Date(); return (today.getFullYear() - 1911) + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + String(today.getDate()).padStart(2, '0'); }

function callAPI(action, data, successCallback) {
  const payload = Object.assign({ action: action }, data); showLoading(true);
  fetch(GAS_API_URL, { method: "POST", body: JSON.stringify(payload) })
  .then(res => res.json()).then(text => { showLoading(false); successCallback(text); })
  .catch(err => { showLoading(false); alert("❌ 通訊連線失敗！原因：" + err.toString()); });
}
