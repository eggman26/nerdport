const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

let users = [];

io.on("connection", socket => {

    socket.on("join", user => {

        users.push({
            id: socket.id,
            name: user.name
        });

        io.emit("users", users);

        socket.broadcast.emit("message", {
            user: "System",
            text: `${user.name} joined`
        });

    });

    socket.on("message", data => {

        io.emit("message", data);

    });

    socket.on("disconnect", () => {

        const leavingUser =
            users.find(
                u => u.id === socket.id
            );

        users =
            users.filter(
                u => u.id !== socket.id
            );

        io.emit("users", users);

        if(leavingUser){

            io.emit("message", {
                user: "System",
                text:
                leavingUser.name +
                " left"
            });

        }

    });

});

const PORT =
    process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(
        "Server running on port",
        PORT
    );

});