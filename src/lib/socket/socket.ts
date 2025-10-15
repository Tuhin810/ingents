import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initiateSocket = (userToken: string) => {
  socket = io("http://localhost:8989", {
    auth: { token: userToken },
  });

  socket.on("connect", () => {
    console.log("✅ Connected to socket:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from socket");
  });
};

export const getSocket = () => socket;
