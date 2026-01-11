const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.render("index");
});

// SOCKET LOGIC
const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    users[socket.id] = username;
    console.log(`User joined: ${username} (${socket.id})`);
  });

  socket.on("location", ({ latitude, longitude }) => {
    socket.broadcast.emit("user-location", {
      id: socket.id,
      username: users[socket.id],
      latitude,
      longitude
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", socket.id);
    delete users[socket.id];
  });
});
server.listen(3000,()=>{
    console.log("listening on 3000 ")

})
