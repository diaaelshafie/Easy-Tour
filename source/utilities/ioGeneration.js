import { Server } from "socket.io"

let io
export function initiateIo(server) {
    io = new Server(server, { cors: '*' })
    return io
}

export function getIo() {
    if (!io) {
        return new Error('no Io is found!')
    }
    return io
}