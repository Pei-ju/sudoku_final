const sudokuGrid = document.getElementById("sudoku-grid");
const solveButton = document.getElementById("solve-button");
const clearButton = document.getElementById("clear-button");
const hintButton = document.getElementById("hint-button");
const xButton = document.getElementById("x-button");
const playAgain = document.getElementById("play-again");
let selectedCell = null; // 用來記錄當前選中的格子
let solution; // 用來記錄正確解答
let attempts = 20; // 用來記錄移除幾格數字

// 生成 9x9 數獨盤面
function createSudokuGrid() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement("input");
            cell.type = "text";
            cell.maxLength = 1;
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("focus", handleCellFocus);
            cell.addEventListener("focus", selectNumber);
            cell.addEventListener("input", validateInput);
            cell.addEventListener("blur", handleCellBlur);
            if (((row < 3 || row > 5) && col >= 3 && col < 6) ||
                (row >= 3 && row < 6 && (col < 3 || col > 5))
            ) {
                cell.style.backgroundColor = "#CDAA7D";
            }
            sudokuGrid.appendChild(cell);

        }
    }
}

// 確保輸入的數字合法
function validateInput(event) {
    const value = event.target.value;
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    // 檢查輸入是否為 1 到 9 的數字
    if (!/^[1-9]$/.test(value)) {
        event.target.value = "";
        event.target.style.color = ""; // 清除背景顏色
        return;
    }

    // 檢查是否在同一行或同一列已經有相同的數字
    let cells = sudokuGrid.getElementsByTagName("input");
    let isDuplicate = false;

    // 檢查同一行
    for (let i = 0; i < 9; i++) {
        if (i !== col && cells[row * 9 + i].value === value) {
            isDuplicate = true;
            break;
        }
    }

    // 檢查同一列
    for (let i = 0; i < 9; i++) {
        if (i !== row && cells[i * 9 + col].value === value) {
            isDuplicate = true;
            break;
        }
    }

    // 檢查同一 3x3 九宮格
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const r = startRow + i;
            const c = startCol + j;
            if ((r !== row || c !== col) && cells[r * 9 + c].value === value) {
                isDuplicate = true;
                break;
            }
        }
    }

    // 如果有重複，顯示紅色背景，否則恢復正常背景
    if (isDuplicate) {
        event.target.style.color = "red";
    } else {
        event.target.style.color = ""; // 恢復正常顏色
    }
}

// 判斷某數字是否可填入
function isValid(grid, row, col, num) {
    // 檢查行列和 3x3 子格
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) {
            return false;
        }
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }
    return true;
}

// 隨機化的回溯法來解決數獨
function solveSudoku(grid) {
    // 嘗試填充每個空格
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {  // 如果當前格子為 0
                // 隨機排列 1-9 的數字
                let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                shuffleArray(nums);
                for (let num of nums) {
                    if (isValid(grid, row, col, num)) {  // 如果該數字可填入
                        grid[row][col] = num;
                        if (solveSudoku(grid)) {  // 繼續填充
                            return true;
                        }
                        grid[row][col] = 0;  // 如果無法繼續，回溯
                    }
                }
                return false;  // 如果無法填入，回溯
            }
        }
    }
    return true;  // 完成數獨
}

// 隨機排列數字
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];  // 交換位置
    }
}

// 隨機填充有效的數獨盤面
function generateFullSudokuGrid() {
    let grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    // let grid1 = Array.from({ length: 9 }, () => Array(9).fill(0));
    // solution = grid;
    solveSudoku(grid);
    solution = JSON.parse(JSON.stringify(grid));
    return grid;
}

// 在頁面加載完成後，啟用 Popover
document.addEventListener("DOMContentLoaded", function () {
    // 初始化 Popover
    const popoverTrigger = new bootstrap.Popover(document.getElementById('play-again'), {
        html: true,  // 允許使用 HTML 內容
        content: document.getElementById('difficulty-options').innerHTML, // 動態載入選擇難度的內容
        sanitize: false,  // 禁用 HTML 清理（若使用內嵌 HTML 元素）
    });
    // 當 Popover 顯示時，才會綁定難度按鈕的點擊事件
    const playAgainBtn = document.getElementById('play-again');
    playAgainBtn.addEventListener('click', function () {
        // 觸發 Popover 顯示
        if (!popoverTrigger._isShown()) {
            popoverTrigger.show();
        }
    });
    // 使用事件代理綁定動態按鈕的點擊事件
    document.body.addEventListener('click', function (event) {
        // 確保只處理難度按鈕的點擊事件
        if (event.target.classList.contains('levelBtn')) {
            resetTimer();
            // 根據按鈕的 id 設置選擇的難度
            selectDifficulty(event.target.id);
            popoverTrigger.hide(); // 隱藏 Popover
        }
    });
});

// 根據難度返回對應的空格
function selectDifficulty(difficulty) {
    // 移除所有按鈕的 selected 類別
    document.querySelectorAll('.read-only').forEach(button => {
        button.classList.remove('selected');
    });
    switch (difficulty) {
        case "easy":
            attempts = 20;  // 簡單難度 20 格
            break;
        case "medium":
            attempts = 30;  // 中等難度 30 格
            break;
        case "hard":
            attempts = 50;  // 困難難度 50 格
            break;
        default:
            attempts = 20;  // 預設返回 20 格
            break;
    }
    let difficultlevel = difficulty + '-level';
    // 設置對應按鈕為選擇狀態
    document.getElementById(difficultlevel).classList.add('selected');
    generateSudokuPuzzle();
}

// 隨機移除數字生成題目
function generateSudokuPuzzle() {
    clearCellColors();
    let grid = generateFullSudokuGrid(); // 生成完整數獨盤面

    // let attempts = 40; // 控制難度，移除40個數字
    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        // 只移除非零的位置
        if (grid[row][col] !== 0) {
            grid[row][col] = 0;
            attempts--;
        }
    }

    setGridValues(grid);  // 更新盤面顯示
    updateNumberButtons();  // 更新數字按鈕狀態
}

// 清除所有格子的顏色樣式
function clearCellColors() {
    let cells = sudokuGrid.getElementsByTagName("input");
    for (let i = 0; i < cells.length; i++) {
        // cells[i].style.backgroundColor = ""; // 清除背景顏色
        cells[i].style.color = ""; // 清除字型顏色
    }
}

// 取得數獨盤面數據
function getGridValues() {
    const grid = [];
    const cells = sudokuGrid.getElementsByTagName("input");
    for (let i = 0; i < 9; i++) {
        grid[i] = [];
        for (let j = 0; j < 9; j++) {
            const value = cells[i * 9 + j].value;
            grid[i][j] = value ? parseInt(value) : 0;
        }
    }
    return grid;
}

// 將數據填入數獨盤面
function setGridValues(grid) {
    let cells = sudokuGrid.getElementsByTagName("input");
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] !== 0) {
                cells[i * 9 + j].value = grid[i][j];
                cells[i * 9 + j].style.color = "black";
                cells[i * 9 + j].readOnly = true; // 只讀
            } else {
                cells[i * 9 + j].value = "";
                cells[i * 9 + j].readOnly = false; // 可編輯
            }
        }
    }
}

// 點擊某個格子時的處理函數
function handleCellFocus(event) {
    const clickedValue = event.target.value;
    if (!clickedValue) return;

    // 先移除所有已經高亮的格子
    const highlightedCells = document.querySelectorAll(".highlight");
    highlightedCells.forEach(cell => cell.classList.remove("highlight"));

    // 高亮顯示所有相同數字的格子
    const allCells = sudokuGrid.getElementsByTagName("input");
    for (let cell of allCells) {
        if (cell.value === clickedValue) {
            cell.classList.add("highlight");
        }
    }
}

// 離開格子時的處理函數
function handleCellBlur(event) {
    // 移除所有高亮顯示
    const highlightedCells = document.querySelectorAll(".highlight");
    highlightedCells.forEach(cell => cell.classList.remove("highlight"));
}

// 點擊某個格子時的處理函數
function selectNumber(event) {
    selectedCell = event.target;  // 記錄選中的格子
}

// 檢查盤面是否有某個數字填了九次
function checkIfNumberFilled(num) {
    let count = 0;
    let cells = sudokuGrid.getElementsByTagName("input");
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].value === num.toString()) {
            count++;
        }
    }
    return count === 9;
}

// 更新數字按鈕的狀態
function updateNumberButtons() {
    const buttons = document.querySelectorAll(".number-button");
    buttons.forEach(button => {
        const number = parseInt(button.textContent);
        if (checkIfNumberFilled(number)) {
            button.setAttribute("disabled", true);  // 禁用按鈕
            button.style.backgroundColor = "#ccc"; // 可以改變按鈕顏色來顯示禁用狀態
        } else {
            button.removeAttribute("disabled");  // 啟用按鈕
            button.style.backgroundColor = ""; // 恢復按鈕顏色
        }
    });
}

// 按下數字按鈕時，填入所選的格子
function setCellValue(number) {
    if (selectNumber && !selectedCell.readOnly) {
        selectedCell.value = number; // 在選中的格子顯示數字
        const value = selectedCell.value;
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        // 檢查輸入是否為 1 到 9 的數字
        if (!/^[1-9]$/.test(value)) {
            selectedCell.value = "";
            selectedCell.style.color = ""; // 清除背景顏色
            return;
        }
        // 檢查是否在同一行或同一列已經有相同的數字
        let cells = sudokuGrid.getElementsByTagName("input");
        let isDuplicate = false;
        // 檢查同一行
        for (let i = 0; i < 9; i++) {
            if (i !== col && cells[row * 9 + i].value === value) {
                isDuplicate = true;
                break;
            }
        }
        // 檢查同一列
        for (let i = 0; i < 9; i++) {
            if (i !== row && cells[i * 9 + col].value === value) {
                isDuplicate = true;
                break;
            }
        }
        // 檢查同一 3x3 九宮格
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const r = startRow + i;
                const c = startCol + j;
                if ((r !== row || c !== col) && cells[r * 9 + c].value === value) {
                    isDuplicate = true;
                    break;
                }
            }
        }
        // 如果有重複，顯示紅色背景，否則恢復正常背景
        if (isDuplicate) {
            selectedCell.style.color = "red";
        } else {
            selectedCell.style.color = ""; // 恢復正常顏色
        }
        updateNumberButtons(); // 更新數字按鈕狀態
    }
}

// 生成數字按鈕並綁定事件
function bindNumberButtons() {
    const buttons = document.querySelectorAll(".number-button");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const number = button.textContent;
            setCellValue(number); // 點擊按鈕後將數字填入選中的格子
        });
    });
}

// 按下「清除選中數字」按鈕
xButton.addEventListener("click", () => {
    if (!selectedCell.readOnly) {
        selectedCell.value = "";  // 只清除選中的格子的數字
    }
    updateNumberButtons();  // 更新數字按鈕狀態
});


// 按下「提示」按鈕，檢查選中的格子是否正確
hintButton.addEventListener("click", () => {

    if (selectedCell) {
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);

        const correctValue = solution[row][col]; // 獲取正確的數字

        // 清除之前的顏色
        selectedCell.style.color = ""; // 清除背景顏色

        // 如果格子內沒有數字，顯示正確的數字
        if (!selectedCell.value) {
            selectedCell.value = correctValue; // 顯示正確的數字
            selectedCell.style.color = "purple"; // 顯示為黑色文字
        }
        else {
            // 檢查選中的格子是否與正確答案匹配
            if (parseInt(selectedCell.value) === correctValue) {
                selectedCell.style.color = "green"; // 正確，綠色
            }
            else {
                selectedCell.style.color = "red"; // 錯誤，紅色
            }
        }
        updateNumberButtons();  // 更新數字按鈕狀態
    } else {
        alert("請選擇一個格子！");
    }
});

// 按下「解答」按鈕，檢查選中的格子是否正確
solveButton.addEventListener("click", () => {
    let grid = getGridValues();
    let cells = sudokuGrid.getElementsByTagName("input"); // 獲取所有格子

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            
            const correctValue = solution[row][col]; // 獲取正確的數字
            const inputValue = grid[row][col];
            const currentCell = cells[row * 9 + col];  // 獲取當前格子的 DOM 元素

            if (currentCell.readOnly) {
                continue;  // 跳過該格子，不進行檢查
            }
            currentCell.style.color = ""; 
            
            if (!inputValue) {
                currentCell.value = correctValue; // 顯示正確的數字
                currentCell.style.color = "purple"; // 顯示為黑色文字
            }
            else {
                // 檢查選中的格子是否與正確答案匹配
                if (inputValue === correctValue) {
                    currentCell.style.color = "green"; // 正確，綠色
                }
                else {
                    currentCell.style.color = "red"; // 錯誤，紅色
                }
            }
        }
    }
    updateNumberButtons();  // 更新數字按鈕狀態
});

// // 按下「求解」按鈕
// solveButton.addEventListener("click", () => {
//     let grid = getGridValues();
//     if (solveSudoku(grid)) {
//         setGridValues(grid);
//     } else {
//         alert("無法解決此數獨！");
//     }
//     updateNumberButtons();  // 更新數字按鈕狀態
// });

// 按下「清除輸入」按鈕
clearButton.addEventListener("click", () => {
    const allCells = sudokuGrid.getElementsByTagName("input");
    for (let cell of allCells) {
        if (!cell.readOnly) {
            cell.value = "";  // 清除每個格子中的數字
            cell.classList.remove("highlight"); // 移除高亮顯示
        }
    }
    updateNumberButtons();  // 更新數字按鈕狀態
});

// 按下「新遊戲」按鈕
// playAgain.addEventListener("click", generateSudokuPuzzle);

// 初始化數獨盤面
createSudokuGrid();
// generateSudokuPuzzle(); // 生成題目
bindNumberButtons(); // 綁定數字按鈕
