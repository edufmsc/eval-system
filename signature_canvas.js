// =================================================================
// 前端模組 2：親筆手寫板與預存簽名切換
// 完整替換版：修正動態重建簽名板後無法手寫的問題
// =================================================================

/**
 * 初始化指定簽名畫布。
 *
 * 修正重點：
 * workflow_ui.js 會重新建立相同 ID 的 canvas。
 * 舊版只要 canvasMap[id] 已存在就直接 return，
 * 導致新 canvas 沒有綁定滑鼠／觸控事件。
 *
 * 新版會確認 canvasMap 內保存的 DOM 物件，
 * 是否真的是目前頁面上的新 canvas。
 */
function initCanvasDevice(id) {
  const canvas = document.getElementById(id);

  if (!canvas) {
    return;
  }

  const oldEntry = canvasMap[id];

  // 同一個 DOM 畫布已經完成綁定時，不重複綁定。
  if (
    oldEntry &&
    oldEntry.cvs === canvas &&
    canvas.dataset.signatureBound === "1"
  ) {
    return;
  }

  // 相同 ID 但已經是重新建立的新 canvas，
  // 清掉舊參照後重新綁定事件。
  if (oldEntry && oldEntry.cvs !== canvas) {
    delete canvasMap[id];
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.strokeStyle = "#333333";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";

  // 避免觸控裝置在手寫時觸發頁面捲動。
  canvas.style.touchAction = "none";

  let drawing = false;
  let lastPoint = null;

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return null;
    }

    let clientX;
    let clientY;

    if (
      event.touches &&
      event.touches.length > 0
    ) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (
      event.changedTouches &&
      event.changedTouches.length > 0
    ) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x:
        (clientX - rect.left) *
        (canvas.width / rect.width),
      y:
        (clientY - rect.top) *
        (canvas.height / rect.height)
    };
  }

  function startDrawing(event) {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const point = getPoint(event);

    if (!point) {
      return;
    }

    drawing = true;
    lastPoint = point;

    context.beginPath();
    context.moveTo(point.x, point.y);

    // 點一下也會留下筆跡，不必一定拖曳。
    context.lineTo(
      point.x + 0.01,
      point.y + 0.01
    );
    context.stroke();

    if (
      event.pointerId !== undefined &&
      canvas.setPointerCapture
    ) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        // 不影響後續手寫。
      }
    }
  }

  function continueDrawing(event) {
    if (!drawing) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const point = getPoint(event);

    if (!point) {
      return;
    }

    if (!lastPoint) {
      lastPoint = point;
      context.beginPath();
      context.moveTo(point.x, point.y);
      return;
    }

    context.lineTo(point.x, point.y);
    context.stroke();

    lastPoint = point;
  }

  function stopDrawing(event) {
    if (!drawing) {
      return;
    }

    if (event && event.cancelable) {
      event.preventDefault();
    }

    drawing = false;
    lastPoint = null;
    context.closePath();

    if (
      event &&
      event.pointerId !== undefined &&
      canvas.releasePointerCapture
    ) {
      try {
        canvas.releasePointerCapture(
          event.pointerId
        );
      } catch (error) {
        // 不影響後續手寫。
      }
    }
  }

  // 優先使用 Pointer Events，可同時支援滑鼠、觸控筆及觸控螢幕。
  if (window.PointerEvent) {
    canvas.addEventListener(
      "pointerdown",
      startDrawing
    );

    canvas.addEventListener(
      "pointermove",
      continueDrawing
    );

    canvas.addEventListener(
      "pointerup",
      stopDrawing
    );

    canvas.addEventListener(
      "pointercancel",
      stopDrawing
    );

    canvas.addEventListener(
      "pointerleave",
      function (event) {
        if (
          drawing &&
          event.buttons === 0
        ) {
          stopDrawing(event);
        }
      }
    );
  } else {
    // 舊瀏覽器備援。
    canvas.addEventListener(
      "mousedown",
      startDrawing
    );

    canvas.addEventListener(
      "mousemove",
      continueDrawing
    );

    window.addEventListener(
      "mouseup",
      stopDrawing
    );

    canvas.addEventListener(
      "touchstart",
      startDrawing,
      { passive: false }
    );

    canvas.addEventListener(
      "touchmove",
      continueDrawing,
      { passive: false }
    );

    canvas.addEventListener(
      "touchend",
      stopDrawing,
      { passive: false }
    );

    canvas.addEventListener(
      "touchcancel",
      stopDrawing,
      { passive: false }
    );
  }

  canvas.dataset.signatureBound = "1";

  canvasMap[id] = {
    cvs: canvas,
    ctx: context
  };
}


/**
 * 清除指定簽名畫布。
 */
function clearSig(id) {
  const canvas = document.getElementById(id);

  if (!canvas) {
    return;
  }

  // 畫布可能剛被 workflow_ui.js 重建，
  // 先確認綁定的是目前這個 DOM。
  initCanvasDevice(id);

  const entry = canvasMap[id];

  if (!entry || entry.cvs !== canvas) {
    return;
  }

  entry.ctx.clearRect(
    0,
    0,
    entry.cvs.width,
    entry.cvs.height
  );
}


/**
 * 預存簽名與手寫簽名切換。
 *
 * 勾選：使用 M 欄預存簽名，隱藏畫布。
 * 取消：顯示並重新喚醒目前的手寫畫布。
 */
function toggleSignatureType(
  canvasId,
  checkboxId
) {
  const checkbox =
    document.getElementById(checkboxId);

  if (!checkbox) {
    return;
  }

  const wrapper =
    document.getElementById(
      "canvas-wrapper-" + canvasId
    );

  if (wrapper) {
    wrapper.className = checkbox.checked
      ? "hidden"
      : "relative bg-white border-2 border-gray-300 rounded-xl overflow-hidden h-44 w-full";
  }

  if (!checkbox.checked) {
    // 等畫布從 hidden 恢復顯示後，再計算尺寸並綁定。
    window.requestAnimationFrame(function () {
      initCanvasDevice(canvasId);
    });
  }
}


/**
 * 判斷指定手寫畫布是否完全空白。
 */
function isCanvasBlank(id) {
  const canvas = document.getElementById(id);

  if (!canvas) {
    return true;
  }

  initCanvasDevice(id);

  const entry = canvasMap[id];

  if (!entry || entry.cvs !== canvas) {
    return true;
  }

  const pixelData =
    entry.ctx.getImageData(
      0,
      0,
      entry.cvs.width,
      entry.cvs.height
    ).data;

  // 只要任一像素有透明度，就代表有筆跡。
  for (
    let index = 3;
    index < pixelData.length;
    index += 4
  ) {
    if (pixelData[index] !== 0) {
      return false;
    }
  }

  return true;
}
