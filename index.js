const express = require('express')
const http = require('http')
const { Server } = require('socket.io')


const app = express();
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3001",
    }
})

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    console.log("connection received")
    console.log(socket.handshake.auth)

    

    socket.username = username;
    next();
})


io.on('connection', (socket) => {

    console.log("connection received " + socket.username)
    const users = []

    for(let [id, socket] of io.of("/").sockets) {
        users.push({
            userid: id,
            username: socket.username
        })
    }
    
    console.log(users)
    socket.emit("users", users)

    socket.broadcast.emit("user connected", {
        userid: socket.id,
        username: socket.username
    })

    socket.on("private message", ({message, to}) => {
        socket.to(to).emit("private message", {
            message,
            from: socket.id,
        })
        console.log(message + to)
    })
    
})





httpServer.listen(3000, () => console.log("server is listening on port 3000"))