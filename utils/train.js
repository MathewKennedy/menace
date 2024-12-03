// run to train MENACE on a random strategy for the specified amount of games
const { BoardState } = require("./stateTree.js");
const { Menace } = require("./menace.js");
const { loadData } = require("./utils.js");

let menaceFirst = true;
let saveToFile = true;
let data = loadData();
let root = new BoardState(undefined, undefined, data);
root.generateChildren();
let MENACE = new Menace(root, menaceFirst, saveToFile);
MENACE.playSelf(5);
