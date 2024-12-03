const fs = require("fs");

function weightedRandomChoice(object) {
  const entries = Object.entries(object);
  if (entries.length < 1) {
    console.log("NO ENTRIES FOR WEIGHTED CHOICE");
  }
  const totalLikelihood = entries.reduce(
    (sum, [key, likelihood]) => sum + likelihood,
    0
  );

  const randomValue = Math.random() * totalLikelihood;
  let cumulativeLikelihood = 0;

  for (const [key, likelihood] of entries) {
    cumulativeLikelihood += likelihood;
    if (randomValue <= cumulativeLikelihood) {
      return key;
    }
  }

  return entries[entries.length - 1][0];
}

let winningLineIndexes = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkOutcome(state) {
  for (const [a, b, c] of winningLineIndexes) {
    if (state[a] !== 0 && state[a] === state[b] && state[b] === state[c]) {
      return state[a] === 2 ? "x win" : "x lose";
    }
  }

  return state.includes(0) ? null : "draw";
}

// load training data from file
function loadData() {
  try {
    const data = fs.readFileSync("loadData.json", "utf-8");
    if (data) {
      return JSON.parse(data);
    } else {
      console.log("No data from load file");
      return {};
    }
  } catch (err) {
    console.error(
      "A load file was not read - the load file should be called loadData.json (utf-8)"
    );
    return {};
  }
}

module.exports = {
  checkOutcome,
  weightedRandomChoice,
  loadData,
};
