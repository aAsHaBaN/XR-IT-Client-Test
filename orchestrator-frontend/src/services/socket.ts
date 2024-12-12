import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function connect() {
  const baseUrl = process.env.NEXT_PUBLIC_API_HOST ?? "http://localhost:8080";
  const url = `${baseUrl}/interfaces`;
  socket = io(url, {
    reconnectionAttempts: 100,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });
}

export function disconnect() {
  socket?.disconnect();
  socket = null;
}

export function getSocket() {
  if (!socket) connect();

  return socket;
}
