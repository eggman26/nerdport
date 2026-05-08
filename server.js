const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

io.on("connection", socket => {

    socket.on("join-room", username => {

        socket.username = username;

        socket.broadcast.emit("user-connected", {
            id: socket.id,
            username
        });

    });
    
    socket.on("signal", data => {

        io.to(data.to).emit("signal", {
            from: socket.id,            signal: data.signal,
            username: socket.username
        });

    });

    socket.on("disconnect", () => {

        socket.broadcast.emit(
            "user-disconnected",
            socket.id
        );

    });

});

server.listen(
    process.env.PORT || 3000,
    () => console.log("Running")
);
