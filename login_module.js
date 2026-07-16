// =================================================================
// 前端模組 3：安全登入防線與 F5 刷新原地復活快取記憶模組
// =================================================================

window.onload = function() { 
  renderMetrics(); 
  const savedSession = localStorage.getItem('hsz_eval_session');
  if (savedSession) {
    try {
      const result = JSON.parse(savedSession); currentUser = result;
      document.getElementById('login-container').classList.add('hidden');
      document.getElementById('app-container').classList.remove('hidden');
      document.getElementById('user-info').innerText = `${result.name} (${result.title})`;
      document.getElementById('system-title').innerText = `鬍鬚張月考核系統 ── 【${result.role}端】`;
      
      setupGlobalSavedSignature();
      if(result.role === "店長") {
        document.getElementById('store-select-box').classList.remove('hidden'); loadUnderlings(result.store);
      } else {
        document.getElementById('reviewer-select-box').classList.remove('hidden'); reloadPendingList();
      }
      loadHistoryList(); 
    } catch(e) { localStorage.removeItem('hsz_eval_session'); }
  }
};

function handleLogin() {
  const empId = document.getElementById('emp-id').value.trim();
  const idTail = document.getElementById('id-tail').value.trim();
  if(!empId || !idTail) return alert("請完整輸入工號與密碼！");
  
  showLoading(true);
  callAPI("login", { empId: empId, idTail: idTail }, function(result) {
    showLoading(false);
    if(result.success) {
      currentUser = result; localStorage.setItem('hsz_eval_session', JSON.stringify(result));
      
      // 登入成功時，極速激活頭部抗閃現 CSS
      document.documentElement.classList.add('hsz-logged-in');
      document.getElementById('login-container').classList.add('hidden');
      document.getElementById('app-container').classList.remove('hidden');
      document.getElementById('user-info').innerText = `${result.name} (${result.title})`;
      document.getElementById('system-title').innerText = `鬍鬚張月考核系統 ── 【${result.role}端】`;
      
      setupGlobalSavedSignature();
      if(result.role === "店長") {
        document.getElementById('store-select-box').classList.remove('hidden'); loadUnderlings(result.store);
      } else {
        document.getElementById('reviewer-select-box').classList.remove('hidden'); reloadPendingList();
      }
      loadHistoryList(); 
    } else { alert(result.message); }
  });
}

function setupGlobalSavedSignature() {
  if(!currentUser) return;
  const hasSig = currentUser.savedSignature && String(currentUser.savedSignature).trim() !== "";
  const chkMap = { "店長": "use-saved-sig", "教育中心": "use-saved-sig-edu", "區主管": "use-saved-sig-area", "學員": "use-saved-sig-student", "營業副總": "use-saved-sig-vp", "總經理": "use-saved-sig-gm" };
  const boxMap = { "店長": "saved-sig-box", "教育中心": "saved-sig-box-edu", "區主管": "saved-sig-box-area", "學員": "saved-sig-box-student", "營業副總": "saved-sig-box-vp", "總經理": "saved-sig-box-gm" };
  const cvsMap = { "店長": "signature-canvas", "教育中心": "signature-canvas-edu", "區主管": "signature-canvas-area", "學員": "signature-canvas-student", "營業副總": "signature-canvas-vp", "總經理": "signature-canvas-gm" };

  Object.keys(boxMap).forEach(r => { let box = document.getElementById(boxMap[r]); if(box) box.classList.add('hidden'); });
  if (hasSig && chkMap[currentUser.role]) {
    let boxEl = document.getElementById(boxMap[currentUser.role]);
    if(boxEl) { 
      boxEl.classList.remove('hidden'); 
      let chkEl = document.getElementById(chkMap[currentUser.role]); if(chkEl) chkEl.checked = true; 
      toggleSignatureType(cvsMap[currentUser.role], chkMap[currentUser.role]); 
    }
  }
}

function logout() {
  currentUser = null; localStorage.removeItem('hsz_eval_session');
  
  // 🌟 終極排雷防禦：登出時澈底拔除頭部的 CSS 阻斷鎖，完美排除登出時視窗全白死機的大 BUG！
  document.documentElement.classList.remove('hsz-logged-in'); 
  
  document.getElementById('app-container').classList.add('hidden'); document.getElementById('login-container').classList.remove('hidden');
  document.getElementById('store-select-box').classList.add('hidden'); document.getElementById('reviewer-select-box').classList.add('hidden');
  document.getElementById('admin-control-box').classList.add('hidden'); 
  if(document.getElementById('admin-progress-box')) document.getElementById('admin-progress-box').remove();
  
  ['section-manager', 'section-edu', 'section-area', 'section-student-confirm', 'section-vp', 'section-gm'].forEach(id => {
    const el = document.getElementById(id); if(el) el.classList.add('hidden');
  });
  document.getElementById('emp-id').value = ''; document.getElementById('id-tail').value = '';
  lockAllWorkflow(); renderMetrics();
}
