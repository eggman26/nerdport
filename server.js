const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

const users = {};

io.on("connection", socket => {

    socket.on("join", username => {

        users[socket.id] = username;

        socket.broadcast.emit(
            "user-connected",
            {
                id: socket.id,
                username
            }
        );

        io.emit("users", users);

    });

    socket.on("signal", data => {

        io.to(data.to).emit(
            "signal",
            {
                from: socket.id,
                signal: data.signal
            }
        );

    });

    socket.on("message", data => {

        io.emit("message", data);

    });

    socket.on("disconnect", () => {

        delete users[socket.id];

        io.emit("users", users);

        socket.broadcast.emit(
            "user-disconnected",
            socket.id
        );

    });

});

server.listen(
    process.env.PORT || 3000,
    () => console.log("Server Running")
);
