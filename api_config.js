// =================================================================
// 前端模組 1：API 通訊設定與全域中央狀態快取大腦
// =================================================================

// 🌟 未來後台大腦重新部署換新網址時，您只需要置換這行引號內的網址，其他任何檔案都不必動！
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbysdFVEq81YuSme1wp72i_MePw2P2TkGPysYJ1gJEvC-58DTuzCkyZbwMddqjiBMTuJ/exec";

// 全域跨模組共享中央記憶體變數
let currentUser = null;
let subordinateCache = [];
let pendingFormCache = [];
let historyFormCache = [];
let activeRanges = {};
let selectedScores = {};
let canvasMap = {};
let isReadOnlyMode = false;
window.currentFormRowIndex = 0;
window.loadedAdjustValue = 0;
