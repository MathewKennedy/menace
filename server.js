const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");
const path = require("path");
require("dotenv").config();

const { BoardState } = require("./classes/StateTree.js");
const { Menace } = require("./classes/Menace.js");
const { loadData } = require("./utils/utils.js");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// env
let PORT = process.env.PORT || 3000;

// data
let data = loadData();

// decision graph
let root = new BoardState(undefined, undefined, data);
root.generateChildren();

const games = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("startGame", () => {
    console.log(`Starting game for user ${socket.id}`);

    let menaceFirst = true;
    let menace = new Menace(root, menaceFirst);

    games[socket.id] = menace;
    socket.emit("gameStarted", menace.visualState);
  });
  // move made
  socket.on("makeMove", (move) => {
    const menace = games[socket.id];
    if (!menace) {
      socket.emit("error", "Game not found. Please start a new game.");
      return;
    }
    let chosen_id = move.space_id;

    let response_state = menace.MakeMove(chosen_id);

    socket.emit("moveMade", response_state);
  });
  socket.on("reset", () => {
    let menace = games[socket.id];
    socket.emit("gameStarted", menace.visualState);
  });
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete games[socket.id];
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(PORT | 3000, () => {
  console.log(`Tic tac toe server listening on port ${PORT}!`);
});
