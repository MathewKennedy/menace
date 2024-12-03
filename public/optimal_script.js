const socket = io("http://localhost:3000");

let visual_state = [];
let loading = false;

// Function to find optimal move based on board state
function findOptimalMove(board, player) {
  const opponent = player === 1 ? 2 : 1;

  // Define winning combinations
  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Check if player can win or needs to block opponent
  function canWinOrBlock(currPlayer) {
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] === currPlayer && board[b] === currPlayer && board[c] === 0)
        return c;
      if (board[a] === currPlayer && board[c] === currPlayer && board[b] === 0)
        return b;
      if (board[b] === currPlayer && board[c] === currPlayer && board[a] === 0)
        return a;
    }
    return null;
  }

  // Win if possible
  let winningMove = canWinOrBlock(player);
  if (winningMove !== null) return winningMove;

  // Block opponent's win
  let blockingMove = canWinOrBlock(opponent);
  if (blockingMove !== null) return blockingMove;

  // Prioritize center, then corners, then sides
  const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (let move of preferredMoves) {
    if (board[move] === 0) return move;
  }
  return null;
}

// start game on page load
socket.emit("startGame");

socket.on("gameStarted", (state_array) => {
  visual_state = state_array;

  // Make the first move if the board is empty
  if (visual_state.every((cell) => cell === 0)) {
    const firstMove = findOptimalMove(visual_state, 2); // Assuming player 2 (cross) is optimal opponent
    if (firstMove !== null) {
      socket.emit("makeMove", { space_id: firstMove });
    }
  }
});

socket.on("moveMade", (new_state_object) => {
  visual_state = new_state_object.state;
  loading = false;

  // Check if MENACE made a move and there's no outcome yet
  if (new_state_object.outcome === null) {
    const optimalMove = findOptimalMove(visual_state, 2); // Assume player 2 (cross) is optimal opponent

    // Make the optimal move
    if (optimalMove !== null) {
      socket.emit("makeMove", { space_id: optimalMove });
    }
  } else {
    visual_state = [];
    loading = false;
  }
});

// Listen for disconnect event
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
