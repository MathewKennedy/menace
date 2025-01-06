const {
  getCanonicalForm,
} = require("../transformation/transformationFunctions.js");
const { checkOutcome } = require("../utils/utils.js");

// for debugging 304 menace states
// let menaceTurns = 0;

class BoardState {
  constructor(
    state = Array(9).fill(0),
    xTurn = true,
    loadData = {},
    statesSeenMap = new Map(),
    depth = 0,
    key
  ) {
    this.state = state;
    this.key = key || state.join("");
    this.xTurn = xTurn;
    this.childStateChances = {};
    this.childLinks = [];
    this.loadData = loadData;
    this.outcome = checkOutcome(this.state);
    this.statesSeenMap = statesSeenMap;
    this.depth = depth;
    this.generateChildren();
    // if (this.xTurn && !this.outcome && this.depth < 7) {
    //   menaceTurns++;
    // }
  }

  generateChildren() {
    if (this.outcome != null) {
      return;
    }
    this.state.forEach((place, index) => {
      if (place == 0) {
        let childState = [...this.state];
        childState[index] = this.xTurn ? 2 : 1;

        let { canonicalBoard, transformationKey } =
          getCanonicalForm(childState);

        let childStateKey = canonicalBoard.join("");

        if (this.childExistsOnThisNode(childStateKey)) {
          return;
        }

        if (this.statesSeenMap.has(childStateKey)) {
          let childFromMap = this.statesSeenMap.get(childStateKey);
          this.addChild(childFromMap, transformationKey);
        } else {
          let newChildState = new BoardState(
            canonicalBoard,
            !this.xTurn,
            this.loadData,
            this.statesSeenMap,
            this.depth + 1,
            childStateKey
          );
          this.statesSeenMap.set(childStateKey, newChildState);
          this.addChild(newChildState, transformationKey);
        }
        this.loadChildProbabilities(childStateKey);
      }
    });
  }

  childExistsOnThisNode(childStateKey) {
    return this.childLinks.some(
      (childLink) => childLink.child.key === childStateKey
    );
  }

  addChild(childState, transformationKey) {
    this.childLinks.push({
      transformationByParent: transformationKey,
      child: childState,
    });
  }

  loadChildProbabilities(childStateKey) {
    if (this.loadData && childStateKey in this.loadData) {
      this.childStateChances[childStateKey] = this.loadData[childStateKey];
    } else {
      this.childStateChances[childStateKey] = 3;
    }
  }
}

// for post regarding 304 states:
// let testRoot = new BoardState();
// console.log(menaceTurns);

module.exports = {
  BoardState,
};
