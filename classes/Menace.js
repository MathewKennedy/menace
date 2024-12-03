const {
  getCanonicalForm,
  reverseTransformation,
  applyTransformation,
} = require("../transformation/transformationFunctions.js");
const { weightedRandomChoice } = require("../utils/utils.js");
const updateQueue = require("./UpdateQueue.js"); // singleton, shared between all MENACE instances.

class Menace {
  constructor(root, iAmX = true) {
    this.visualState = Array(9).fill(0);
    this.root = root;
    this.iAmX = iAmX;
    this.currentState = root;
    this.statesThisGame = [root];
    if (this.iAmX) {
      this.makeFirstMove();
    }
  }

  reset() {
    this.visualState = Array(9).fill(0);
    this.currentState = this.root;
    this.statesThisGame = [this.root];
    if (this.iAmX) {
      this.makeFirstMove();
    }
  }

  train() {
    const statesThisGameSnapshot = [...this.statesThisGame];
    const outcome = this.currentState.outcome;
    const iAmX = this.iAmX;

    const trainTask = async (loadDataBuffer) => {
      let prevState = null;

      if (outcome == "draw") {
        return;
      }

      let aiWin = (outcome == "x win") == iAmX;

      statesThisGameSnapshot.forEach((stateObj) => {
        if (prevState) {
          Object.entries(prevState.childStateChances).forEach(
            ([key, value]) => {
              if (key === stateObj.key) {
                const aiTurn = iAmX ? prevState.xTurn : !prevState.xTurn;
                let adjustment = aiTurn === aiWin ? 3 : -1;
                prevState.childStateChances[key] = Math.max(
                  1,
                  value + adjustment
                );
                // update the loadData in the current graph
                this.currentState.loadData[key] =
                  prevState.childStateChances[key];

                // update the buffer that was passed by the queue class
                loadDataBuffer[key] = prevState.childStateChances[key];
              }
            }
          );
        }
        prevState = stateObj;
      });
    };
    updateQueue.enqueue(trainTask);
  }

  moveToChildByKey(childKey) {
    const matchingChildLink = this.currentState.childLinks.find(
      (childLink) => childLink.child.key === childKey
    );
    if (matchingChildLink) {
      this.currentState = matchingChildLink.child;
      this.statesThisGame.push(this.currentState);
    }
    return matchingChildLink;
  }

  makeFirstMove() {
    // choose child from weights as usual:
    let menaceChoiceKey = weightedRandomChoice(
      this.currentState.childStateChances
    );
    this.moveToChildByKey(menaceChoiceKey);
    this.statesThisGame.push(this.currentState);
    // randomly transform for visual
    this.visualState = applyTransformation(
      this.currentState.state,
      Math.floor(Math.random() * 8)
    );
  }

  MakeMove(playerMoveIndex) {
    if (this.visualState[playerMoveIndex] != 0) {
      return this.moveError("The chosen tile was not empty");
    }
    let visualStateCopy = [...this.visualState];
    visualStateCopy[playerMoveIndex] = this.iAmX ? 1 : 2;

    let { canonicalBoard, transformationKey } =
      getCanonicalForm(visualStateCopy);

    let playerStateKey = canonicalBoard.join("");

    let foundChild = this.moveToChildByKey(playerStateKey);
    if (!foundChild) {
      return this.moveError("No matching child state found");
    }

    if (this.currentState.outcome != null) return this.endGame();

    let menaceChoiceKey = weightedRandomChoice(
      this.currentState.childStateChances
    );

    let menaceChoiceLink = this.moveToChildByKey(menaceChoiceKey);

    // undo transformations parent used to generate current state
    let stateInParentForm = reverseTransformation(
      this.currentState.state,
      menaceChoiceLink.transformationByParent
    );

    // undo transformations to get from visual state to parent state
    let stateInVisualForm = reverseTransformation(
      stateInParentForm,
      transformationKey
    );

    this.visualState = stateInVisualForm;

    if (this.currentState.outcome != null) return this.endGame();

    return {
      state: this.visualState,
      outcome: null,
    };
  }

  playSelf(games = 300) {
    while (games > 0) {
      let selfChoiceKey = weightedRandomChoice(
        this.currentState.childStateChances
      );
      this.moveToChildByKey(selfChoiceKey);
      this.statesThisGame.push(this.currentState);
      if (this.currentState.outcome != null) {
        this.train();
        this.reset();
        games--;
      }
    }
  }

  endGame() {
    let savedState = [...this.visualState];
    let savedOutcome = this.currentState.outcome;
    this.train();
    this.reset();
    return {
      state: savedState,
      outcome: savedOutcome,
    };
  }

  moveError(message) {
    return {
      state: null,
      outocme: null,
      error: message,
    };
  }
}

module.exports = {
  Menace,
};
