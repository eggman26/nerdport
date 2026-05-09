const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

const users = {};

io.on("connection", socket => {

    console.log("Connected:", socket.id);

    socket.on("join", username => {

        users[socket.id] = username;

        socket.emit("all-users", users);

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
                signal: data.signal,
                username: users[socket.id]
            }
        );

    });

    socket.on("message", data => {

        io.emit("message", data);

    });

    socket.on("disconnect", () => {

        console.log(
            "Disconnected:",
            socket.id
        );

        delete users[socket.id];

        io.emit("users", users);

        socket.broadcast.emit(
            "user-disconnected",
            socket.id
        );

    });

});

const PORT =
    process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(
        "Running on port",
        PORT
    );

});
