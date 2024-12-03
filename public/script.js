const socket = io("http://localhost:7001");

let visual_state = [];
let loading = false;
let resultDisplay = document.getElementById("result-display");
let errorDisplay = document.getElementById("error-display");

// display timeouts
let resultTimeout;
let errorTimeout;

let spaces = document.querySelectorAll(".space");

let resetError = () => {
  errorDisplay.style.display = "none";
  errorDisplay.innerHTML = "";
};

let resetResult = () => {
  resultDisplay.style.display = "none";
  resultDisplay.innerHTML = "";
};

spaces.forEach((space) => {
  space.addEventListener("click", async (e) => {
    if (!loading) {
      loading = true;
      let id = e.target.getAttribute("id");
      socket.emit("makeMove", { space_id: id });
    }
  });
});

// reset board
function resetBoard() {
  spaces.forEach((space) => {
    space.classList.remove("cross_square");
    space.classList.remove("naught_square");
  });
}

// Function to update the board visually
function updateBoard(board) {
  board.forEach((square, i) => {
    let relatedButton = document.getElementById(i);
    if (square == 2) {
      relatedButton.classList.add("cross_square");
    } else if (square == 1) {
      relatedButton.classList.add("naught_square");
    } else {
      relatedButton.classList.remove("cross_square", "naught_square"); // Reset if empty
    }
  });
}

// start game on page load
socket.emit("startGame");

socket.on("gameStarted", (state_array) => {
  visual_state = state_array;
  updateBoard(state_array);
});

socket.on("moveMade", (new_state_object) => {
  if (errorTimeout) clearTimeout(errorTimeout);
  resetError();
  resetResult();
  if (new_state_object.state == null) {
    errorDisplay.innerHTML = new_state_object.error;
    errorDisplay.style.display = "grid";
    // debounce error
    errorTimeout = setTimeout(resetError, 3000);
    loading = false;
  }
  if (new_state_object.outcome != null) {
    if (resultTimeout) clearTimeout(resultTimeout);

    resultDisplay.style.display = "grid";
    resultDisplay.innerHTML = `${new_state_object.outcome}`;
    resetBoard();
    socket.emit("reset");
    resultTimeout = setTimeout(resetResult, 3000);
    loading = false;
  } else {
    updateBoard(new_state_object.state);
    loading = false;
  }
});

// Listen for disconnect event
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
