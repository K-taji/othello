(function(){
  'use strict';

  const SIZE = 8;
  const EMPTY = 0, BLACK = 1, WHITE = -1;

  /**
   * Game state
   */
  let board = createInitialBoard();
  let turn = BLACK; // black starts
  let gameOver = false;

  // DOM refs
  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const msgEl = document.getElementById('message');
  const turnLabel = document.getElementById('turnLabel');
  const resetBtn = document.getElementById('resetBtn');

  resetBtn.addEventListener('click', () => reset());

  // Build cells
  const cells = [];
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.setAttribute('role','gridcell');
      cell.setAttribute('aria-label', `${r+1}行 ${c+1}列`);
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
      cells.push(cell);
    }
  }

  function reset(){
    board = createInitialBoard();
    turn = BLACK;
    gameOver = false;
    render();
  }

  function createInitialBoard(){
    const b = Array.from({length: SIZE}, () => Array(SIZE).fill(EMPTY));
    // Standard start: center 2x2 at middle for even sizes
    const mid = Math.floor(SIZE/2);
    b[mid-1][mid-1] = WHITE;
    b[mid][mid] = WHITE;
    b[mid-1][mid] = BLACK;
    b[mid][mid-1] = BLACK;
    return b;
  }

  function onCellClick(e){
    if(gameOver) return;
    const r = Number(e.currentTarget.dataset.r);
    const c = Number(e.currentTarget.dataset.c);
    if(!isLegalMove(board, r, c, turn)) return;
    board = applyMove(board, r, c, turn);
    turn = -turn;
    stepTurn();
    render();
  }

  function stepTurn(){
    const hasCurrent = listLegalMoves(board, turn).length > 0;
    const hasOpponent = listLegalMoves(board, -turn).length > 0;
    if(!hasCurrent && hasOpponent){
      // pass
      turn = -turn;
      msgEl.textContent = '打てる手がないためパスしました。';
    } else if(!hasCurrent && !hasOpponent){
      gameOver = true;
      const {black, white} = countDiscs(board);
      let result = '引き分け';
      if(black>white) result = '黒の勝ち';
      else if(white>black) result = '白の勝ち';
      msgEl.textContent = `ゲーム終了：${result}`;
    } else {
      msgEl.textContent = '';
    }
  }

  function render(){
    // update cells
    const playable = new Set(listLegalMoves(board, turn).map(([r,c])=>`${r},${c}`));
    for(let r=0;r<SIZE;r++){
      for(let c=0;c<SIZE;c++){
        const idx = r*SIZE + c;
        const cell = cells[idx];
        cell.innerHTML = '';
        cell.classList.toggle('playable', playable.has(`${r},${c}`));
        const v = board[r][c];
        if(v === BLACK || v === WHITE){
          const disc = document.createElement('div');
          disc.className = 'disc ' + (v===BLACK?'black':'white');
          cell.appendChild(disc);
        } else if(playable.has(`${r},${c}`)){
          const hint = document.createElement('div');
          hint.className = 'hint';
          cell.appendChild(hint);
        }
      }
    }
    const {black, white} = countDiscs(board);
    scoreEl.textContent = `黒: ${black}　白: ${white}`;
    if(!gameOver){
      turnLabel.textContent = `手番: ${turn===BLACK?'黒':'白'}`;
    } else {
      turnLabel.textContent = '終了';
    }
  }

  // Logic
  const DIRS = [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1],[1,0],[1,1]
  ];

  function onBoard(r,c){
    return r>=0 && r<SIZE && c>=0 && c<SIZE;
  }

  function isLegalMove(b, r, c, player){
    if(!onBoard(r,c) || b[r][c] !== EMPTY) return false;
    for(const [dr,dc] of DIRS){
      let rr=r+dr, cc=c+dc, seenOpp=false;
      while(onBoard(rr,cc) && b[rr][cc] === -player){
        rr+=dr; cc+=dc; seenOpp=true;
      }
      if(seenOpp && onBoard(rr,cc) && b[rr][cc] === player){
        return true;
      }
    }
    return false;
  }

  function listLegalMoves(b, player){
    const moves=[];
    for(let r=0;r<SIZE;r++){
      for(let c=0;c<SIZE;c++){
        if(isLegalMove(b,r,c,player)) moves.push([r,c]);
      }
    }
    return moves;
  }

  function applyMove(b, r, c, player){
    const next = b.map(row=>row.slice());
    next[r][c] = player;
    for(const [dr,dc] of DIRS){
      let path=[];
      let rr=r+dr, cc=c+dc;
      while(onBoard(rr,cc) && next[rr][cc] === -player){
        path.push([rr,cc]);
        rr+=dr; cc+=dc;
      }
      if(path.length && onBoard(rr,cc) && next[rr][cc] === player){
        for(const [pr,pc] of path){ next[pr][pc] = player; }
      }
    }
    return next;
  }

  function countDiscs(b){
    let black=0, white=0;
    for(let r=0;r<SIZE;r++){
      for(let c=0;c<SIZE;c++){
        if(b[r][c]===BLACK) black++;
        else if(b[r][c]===WHITE) white++;
      }
    }
    return {black, white};
  }

  // initial render
  render();
  stepTurn();
  render();
})();


