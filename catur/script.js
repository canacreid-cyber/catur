// Chess Game with 2 players + AI (placeholder)
const boardElement = document.getElementById("chessboard");
const undoBtn = document.getElementById("undoBtn");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const toggleAIBtn = document.getElementById("toggleAIBtn");
const aiDepthInput = document.getElementById("aiDepth");

let board = [];
let history = [];
let selected = null;
let turn = "w";
let aiEnabled = false;

// Unicode chess symbols
const pieces = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
};

function initBoard() {
  board = [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
  ];
  turn = "w";
  history = [];
  renderBoard();
}

function renderBoard() {
  boardElement.innerHTML = "";
  for (let row=0; row<8; row++) {
    for (let col=0; col<8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((row+col)%2===0 ? "white" : "black");
      square.dataset.row = row;
      square.dataset.col = col;
      if (board[row][col]) {
        square.textContent = pieces[board[row][col]];
      }
      if (selected) {
        const moves = getValidMoves(selected.row, selected.col);
        if (moves.some(m=>m[0]===row && m[1]===col)) {
          square.classList.add("move");
        }
      }
      square.addEventListener("click", onSquareClick);
      boardElement.appendChild(square);
    }
  }
}

function onSquareClick(e) {
  const row = parseInt(e.currentTarget.dataset.row);
  const col = parseInt(e.currentTarget.dataset.col);

  if (selected) {
    const moves = getValidMoves(selected.row, selected.col);
    if (moves.some(m=>m[0]===row && m[1]===col)) {
      movePiece(selected.row, selected.col, row, col);
      selected = null;
      renderBoard();
      if (aiEnabled && turn==="b") {
        setTimeout(aiMove, 500);
      }
    } else {
      selected = null;
      renderBoard();
    }
  } else {
    if (board[row][col] && isWhite(board[row][col]) === (turn==="w")) {
      selected = {row,col};
      renderBoard();
    }
  }
}

// ===== RULES =====
function getValidMoves(r,c) {
  const piece = board[r][c];
  if (!piece) return [];
  let moves = [];
  const isW = isWhite(piece);

  switch (piece.toLowerCase()) {
    case "p": // Pawn
      const dir = isW ? -1 : 1;
      const startRow = isW ? 6 : 1;
      if (!board[r+dir][c]) moves.push([r+dir,c]);
      if (r===startRow && !board[r+dir][c] && !board[r+2*dir][c]) {
        moves.push([r+2*dir,c]);
      }
      for (let dc of [-1,1]) {
        if (board[r+dir] && board[r+dir][c+dc]) {
          if (isWhite(board[r+dir][c+dc])!==isW) {
            moves.push([r+dir,c+dc]);
          }
        }
      }
      break;
    case "n": // Knight
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc])=>{
        const nr=r+dr,nc=c+dc;
        if (inBounds(nr,nc) && (!board[nr][nc]||isWhite(board[nr][nc])!==isW)){
          moves.push([nr,nc]);
        }
      });
      break;
    case "b": // Bishop
      moves = moves.concat(slideMoves(r,c,isW, [[1,1],[1,-1],[-1,1],[-1,-1]]));
      break;
    case "r": // Rook
      moves = moves.concat(slideMoves(r,c,isW, [[1,0],[-1,0],[0,1],[0,-1]]));
      break;
    case "q": // Queen
      moves = moves.concat(slideMoves(r,c,isW, [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]));
      break;
    case "k": // King
      for (let dr=-1;dr<=1;dr++){
        for (let dc=-1;dc<=1;dc++){
          if (dr===0 && dc===0) continue;
          const nr=r+dr,nc=c+dc;
          if (inBounds(nr,nc) && (!board[nr][nc]||isWhite(board[nr][nc])!==isW)){
            moves.push([nr,nc]);
          }
        }
      }
      // Castling bisa ditambahkan di sini
      break;
  }
  return moves.filter(([rr,cc])=>inBounds(rr,cc));
}

function slideMoves(r,c,isW,directions) {
  let res=[];
  for (let [dr,dc] of directions){
    let nr=r+dr,nc=c+dc;
    while (inBounds(nr,nc)){
      if (!board[nr][nc]){
        res.push([nr,nc]);
      } else {
        if (isWhite(board[nr][nc])!==isW) res.push([nr,nc]);
        break;
      }
      nr+=dr; nc+=dc;
    }
  }
  return res;
}

function inBounds(r,c){return r>=0&&r<8&&c>=0&&c<8;}

// ===== MOVE =====
function movePiece(r1,c1,r2,c2) {
  if (!board[r1][c1]) return;
  history.push(JSON.parse(JSON.stringify(board)));
  board[r2][c2] = board[r1][c1];
  board[r1][c1] = "";
  turn = (turn==="w") ? "b" : "w";
}

function isWhite(piece) {
  return piece === piece.toUpperCase();
}

// ===== CONTROLS =====
undoBtn.onclick = ()=>{
  if (history.length>0) {
    board = history.pop();
    turn = (turn==="w") ? "b" : "w";
    renderBoard();
  }
};
saveBtn.onclick = ()=>{
  localStorage.setItem("chessSave", JSON.stringify({board, turn, history}));
  alert("Game saved!");
};
loadBtn.onclick = ()=>{
  const save = JSON.parse(localStorage.getItem("chessSave"));
  if (save) {
    board = save.board;
    turn = save.turn;
    history = save.history;
    renderBoard();
  }
};
toggleAIBtn.onclick = ()=>{
  aiEnabled = !aiEnabled;
  alert("AI " + (aiEnabled ? "Enabled" : "Disabled"));
};

// ===== AI Placeholder =====
function aiMove() {
  let moves=[];
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      if (board[r][c] && !isWhite(board[r][c])){
        const vm = getValidMoves(r,c);
        vm.forEach(([rr,cc])=>moves.push({r,c,rr,cc}));
      }
    }
  }
  if (moves.length>0){
    const m = moves[Math.floor(Math.random()*moves.length)];
    movePiece(m.r,m.c,m.rr,m.cc);
    renderBoard();
  }
}

initBoard();
// ===== CHECK & CHECKMATE =====
function isInCheck(color) {
  // cari posisi raja
  let kingPos = null;
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      if (board[r][c] && board[r][c].toLowerCase()==="k" && isWhite(board[r][c])===(color==="w")){
        kingPos = [r,c];
      }
    }
  }
  if (!kingPos) return false;

  // cek apakah ada bidak lawan yang bisa memakan raja
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      if (board[r][c] && isWhite(board[r][c]) !== (color==="w")){
        const moves = getValidMoves(r,c);
        if (moves.some(([rr,cc])=> rr===kingPos[0] && cc===kingPos[1])){
          return true;
        }
      }
    }
  }
  return false;
}

function hasValidMoves(color) {
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      if (board[r][c] && isWhite(board[r][c])===(color==="w")){
        const moves = getValidMoves(r,c);
        for (let [rr,cc] of moves){
          // coba gerakan sementara
          const backup = JSON.parse(JSON.stringify(board));
          const temp = board[rr][cc];
          board[rr][cc] = board[r][c];
          board[r][c] = "";
          const stillSafe = !isInCheck(color);
          board = backup;
          if (stillSafe) return true;
        }
      }
    }
  }
  return false;
}
 
function movePiece(r1,c1,r2,c2) {
  if (!board[r1][c1]) return;
  history.push(JSON.parse(JSON.stringify(board)));
  board[r2][c2] = board[r1][c1];
  board[r1][c1] = "";
  turn = (turn==="w") ? "b" : "w";

  // ===== CEK CHECKMATE =====
  if (!hasValidMoves(turn)) {
    if (isInCheck(turn)) {
      setTimeout(()=>alert("Checkmate! " + (turn==="w"?"Black":"White") + " wins!"), 100);
    } else {
      setTimeout(()=>alert("Stalemate! Draw!"), 100);
    }
  }
}

