import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const logNamespace = io.of("/api/log");

logNamespace.on("connection", (socket) => {
  console.log(`🔗 FluentD connected`);

  socket.on("log", (data) => {
    console.log(`[LOG] ${new Date().toDateString()} ==> ${data}`);
  });

  socket.on("disconnetct", () => {
    console.log("❌ FluentD disconnected");
  });
});

app.use(express.json());
app.use(cors());

server.listen(4000, () => {
  console.log("server listening on port 4000");
});
