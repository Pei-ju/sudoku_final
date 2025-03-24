let startTime = 0;  // 計時器開始的時間（秒）
let running = false;  // 判斷計時器是否正在運行
let timerInterval;
let pausedTime = 0;  // 記錄暫停時的時間
const overlay = document.getElementById('overlay');

// 轉換秒數為 HH:MM:SS 格式的函數
function formatTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let sec = seconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(sec)}`;
}

// 補零函數
function padZero(num) {
    return num < 10 ? "0" + num : num;
}

// 設定遮罩層位置和大小
function gridSize() {
    // 顯示遮罩層
    const grid = document.getElementById('sudoku-grid');
    // 設定遮罩層位置和大小
    const gridRect = grid.getBoundingClientRect();
    // 獲取當前滾動位置
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    overlay.style.top = gridRect.top + scrollY + 'px';
    overlay.style.left = gridRect.left + 'px';
    overlay.style.width = gridRect.width + 'px';
    overlay.style.height = gridRect.height + 'px';
    return overlay;
}
window.addEventListener('resize', function () {
    gridSize(); // 每次螢幕大小變化時重新調整遮罩層
});

// 禁用或啟用 #sudoku-grid 的輸入
function toggleInputs(isDisabled) {
    const inputs = document.querySelectorAll('#sudoku-grid input');
    inputs.forEach(input => {
        input.disabled = isDisabled;  // 禁用或啟用每個格子的輸入
    });
}

// 禁用或啟用按鈕
function toggleButtons(isDisabled) {
    const buttons = document.querySelectorAll('.btn'); // 選取所有的按鈕
    buttons.forEach(button => {
        if (!button.classList.contains('start-pause-btn') && !button.classList.contains('btnn') && !button.classList.contains('read-only')) {  // 排除暫停按鈕，避免將暫停按鈕禁用
            button.disabled = isDisabled;  // 禁用或啟用按鈕
        }
    });
}

// 開始計時
function startTimer() {
    if (!running) {
        running = true;
        // 每秒更新一次計時器
        timerInterval = setInterval(function () {
            startTime++;
            document.getElementById('timer').textContent = formatTime(startTime);
        }, 1000);

        // 根據時間是否暫停來禁用或啟用 #sudoku-grid 和按鈕
        toggleInputs(!running);
        toggleButtons(!running);

        // 隱藏遮罩層
        overlay.style.display = 'none';

        // 按鈕文字切換
        document.getElementById('startPauseBtn').innerHTML = '暫停 <i class="bi bi-pause-circle-fill"></i>';
    }
}

// 暫停計時
function pauseTimer() {
    if (running) {
        running = false;
        clearInterval(timerInterval);  // 暫停計時器
        pausedTime = startTime;  // 記錄暫停的時間
        // 根據時間是否暫停來禁用或啟用 #sudoku-grid 和按鈕
        toggleInputs(!running);
        toggleButtons(!running);
        // 按鈕文字切換
        document.getElementById('startPauseBtn').innerHTML = '開始 <i class="bi bi-play-circle-fill"></i>';
        document.getElementById('overlayText').innerHTML = '計時暫停，請按 <i class="bi bi-play-circle-fill"></i> 開啟題目!';
        // 調整遮罩層大小
        gridSize();
        overlay.style.display = 'flex';
    }
}

// 繼續計時
function resumeTimer() {
    if (!running && pausedTime > 0) {
        running = true;
        // 重新啟動計時器，從暫停的時間繼續
        timerInterval = setInterval(function () {
            startTime++;
            document.getElementById('timer').textContent = formatTime(startTime);
        }, 1000);

        // 根據時間是否暫停來禁用或啟用 #sudoku-grid 和按鈕
        toggleInputs(!running);
        toggleButtons(!running);

        // 隱藏遮罩層
        overlay.style.display = 'none';

        // 按鈕文字切換
        document.getElementById('startPauseBtn').innerHTML = '暫停 <i class="bi bi-pause-circle-fill"></i>';
    }
}

// 重置計時
function resetTimer() {
    running = false;
    clearInterval(timerInterval);  // 停止計時器
    startTime = 0;  // 重置時間
    document.getElementById('timer').textContent = formatTime(startTime);
    document.getElementById('startPauseBtn').disabled = false;
    startTimer();
}

function stopTimer() {
    running = false;
    clearInterval(timerInterval);
    // 按鈕文字切換
    document.getElementById('startPauseBtn').innerHTML = '停止 <i class="bi bi-stop-circle-fill"></i>';
    document.getElementById('startPauseBtn').disabled = true;
}

// 切換計時器（開始、暫停、繼續）
function toggleTimer() {
    if (running) {
        pauseTimer();  // 暫停計時
    } else {
        if (pausedTime > 0) {
            resumeTimer();  // 繼續計時
        } else {
            startTimer();  // 開始計時
        }
    }
}

// 綁定按鈕點擊事件
document.getElementById('startPauseBtn').addEventListener('click', toggleTimer);
document.getElementById('clear-button').addEventListener('click', resetTimer);
document.getElementById('solve-button').addEventListener('click', stopTimer);
// document.getElementById('play-again').addEventListener('click', resetTimer);
// document.getElementById('overlay').addEventListener('click', resumeTimer);

gridSize();
// 根據時間是否暫停來禁用或啟用 #sudoku-grid 和按鈕
toggleInputs(!running);
toggleButtons(!running);




