// =================================================================
// 前端模組 2：萬能親筆手寫板與預存簽章自動自動化調出外掛
// =================================================================

// 喚醒手寫畫布事件監聽
function initCanvasDevice(id) {
  if (canvasMap[id]) return;
  let cvs = document.getElementById(id); if(!cvs) return;
  let ctx = cvs.getContext('2d');
  ctx.strokeStyle = "#333333"; ctx.lineWidth = 4; ctx.lineCap = "round";
  let drawing = false;
  
  function getCoords(e) {
    let rect = cvs.getBoundingClientRect();
    let clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * (cvs.width / rect.width), y: (clientY - rect.top) * (cvs.height / rect.height) };
  }
  
  cvs.addEventListener('mousedown', (e) => { drawing = true; ctx.beginPath(); let p = getCoords(e); ctx.moveTo(p.x, p.y); });
  cvs.addEventListener('mousemove', (e) => { if(!drawing) return; let p = getCoords(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
  cvs.addEventListener('touchstart', (e) => { drawing = true; ctx.beginPath(); let p = getCoords(e); ctx.moveTo(p.x, p.y); e.preventDefault(); });
  cvs.addEventListener('touchmove', (e) => { if(!drawing) return; let p = getCoords(e); ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); }, {passive:false});
  
  let stopDraw = () => { drawing = false; };
  window.addEventListener('mouseup', stopDraw); window.addEventListener('touchend', stopDraw);
  canvasMap[id] = { cvs: cvs, ctx: ctx };
}

// 清除畫布
function clearSig(id) { 
  if(canvasMap[id]) canvasMap[id].ctx.clearRect(0, 0, canvasMap[id].cvs.width, canvasMap[id].cvs.height); 
}

// 預存簽名切換控制盒：打勾時隱藏畫布，取消時強制展開並喚醒畫布事件
function toggleSignatureType(canvasId, chkId) {
  const chk = document.getElementById(chkId); if(!chk) return;
  const wrapper = document.getElementById('canvas-wrapper-' + canvasId);
  if (wrapper) wrapper.className = chk.checked ? "hidden" : "relative bg-white border-2 border-gray-300 rounded-xl overflow-hidden h-44 w-full";
  if (!chk.checked) initCanvasDevice(canvasId);
}

// 判斷手寫畫布是否為完全空白格
function isCanvasBlank(id) { 
  if(!canvasMap[id]) return true; 
  const blank = document.createElement('canvas'); 
  blank.width = canvasMap[id].cvs.width; blank.height = canvasMap[id].cvs.height; 
  return canvasMap[id].cvs.toDataURL() === blank.toDataURL(); 
}
