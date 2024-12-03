const { transformationMapping } = require("./transformationMapping.js");
const {
  reverseTransformationMapping,
} = require("./reverseTransformationMapping.js");

/**
 * checks if array 1 is less than array 2 lexicologically
 * @param {Array<number>} arr1
 * @param {Array<number>} arr2
 * @returns {boolean}
 */
function isLessThan(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] < arr2[i]) {
      return true;
    } else if (arr1[i] > arr2[i]) {
      return false;
    }
  }
  return false;
}

/**
 * Applies a transformation to the board based on the given transformation index.
 *
 * @param {Array<string>} board - The current board state as a 1D array.
 * @param {number} transformationIndex - The index of the transformation to apply.
 * @returns {Array<string>} - The transformed board state.
 */
function applyTransformation(board, transformationIndex) {
  const mapping = transformationMapping[transformationIndex];
  return board.map((_, idx) => board[mapping[idx]]);
}

/**
 * Reverses a transformation to the board specified by the original transformationIndex.
 * @param {Array<string>} board - The current board state as a 1D array.
 * @param {number} transformationIndex - The index of the transformation to undo.
 * @returns {Array<string>} - The un-rotated board state.
 */
function reverseTransformation(board, transformationIndex) {
  const mapping =
    transformationMapping[reverseTransformationMapping[transformationIndex]];
  return board.map((_, idx) => board[mapping[idx]]);
}

/**
 * Finds the canonical form of a Tic-Tac-Toe board by accounting for D4 symmetry.
 * @param {Array<string>} board - The current board state as a 1D array (already transformed).
 * @returns {Object} - An object containing the canonical board and the transformation index used.
 */
function getCanonicalForm(board) {
  let canonicalBoard = board.slice();
  let transformationKey = 0; // default to identity transformation index
  for (let i = 0; i < transformationMapping.length; i++) {
    const transformedBoard = applyTransformation(board, i);
    if (isLessThan(transformedBoard, canonicalBoard)) {
      canonicalBoard = transformedBoard.slice();
      transformationKey = i;
    }
  }
  return {
    canonicalBoard,
    transformationKey,
  };
}

module.exports = {
  applyTransformation,
  reverseTransformation,
  getCanonicalForm,
};
