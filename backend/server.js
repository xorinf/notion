import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cookieParser from "cookie-parser";
import cors from "cors";
import { commonAPP } from './API/commonAPI.js';
import { cardAPP } from './API/cardAPI.js';
import { activityAPP } from './API/activityAPP.js';
import { pageAPP } from './API/pageAPI.js';
import { boardAPP } from './API/boardAPI.js';
import { workspaceAPP } from './API/workspaceAPI.js';
import { listAPP } from './API/listAPI.js';
import { notificationAPP } from './API/notificationAPI.js';
import { searchAPP } from './API/searchAPI.js';
import { userAPP } from './API/userAPI.js';
import { attachmentAPP } from './API/attachmentAPI.js';
import { inviteAPP } from './API/inviteAPI.js';
import { superadminAPP } from './API/superadminAPI.js';

config({ path: "../.env", encoding: "UTF-8", quiet: true });

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Socket.io setup
const io = new SocketIO(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Board room management
  socket.on("join-board", (boardId) => {
    socket.join(`board:${boardId}`);
    console.log(`Socket ${socket.id} joined board:${boardId}`);
  });

  socket.on("leave-board", (boardId) => {
    socket.leave(`board:${boardId}`);
  });

  // Page room management
  socket.on("join-page", (pageId) => {
    socket.join(`page:${pageId}`);
  });

  socket.on("leave-page", (pageId) => {
    socket.leave(`page:${pageId}`);
  });

  // Real-time card events — broadcast to all in board room except sender
  socket.on("card-moved", ({ boardId, cardId, sourceListId, destListId, sourceIndex, destIndex }) => {
    socket.to(`board:${boardId}`).emit("card-moved", {
      cardId, sourceListId, destListId, sourceIndex, destIndex
    });
  });

  socket.on("card-updated", ({ boardId, cardId, updates }) => {
    socket.to(`board:${boardId}`).emit("card-updated", { cardId, updates });
  });

  socket.on("card-created", ({ boardId, card }) => {
    socket.to(`board:${boardId}`).emit("card-created", { card });
  });

  socket.on("card-deleted", ({ boardId, cardId, listId }) => {
    socket.to(`board:${boardId}`).emit("card-deleted", { cardId, listId });
  });

  socket.on("list-created", ({ boardId, list }) => {
    socket.to(`board:${boardId}`).emit("list-created", { list });
  });

  socket.on("list-updated", ({ boardId, listId, updates }) => {
    socket.to(`board:${boardId}`).emit("list-updated", { listId, updates });
  });

  // Real-time page editing events
  socket.on("page-updated", ({ pageId, userId, userName }) => {
    socket.to(`page:${pageId}`).emit("page-updated", { userId, userName });
  });

  socket.on("page-editing", ({ pageId, userId, userName }) => {
    socket.to(`page:${pageId}`).emit("page-editing", { userId, userName });
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io available to routes if needed
app.set("io", io);

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// routes
app.use("/auth", commonAPP);
app.use("/card", cardAPP);
app.use("/activity", activityAPP);
app.use("/page", pageAPP);
app.use("/board", boardAPP);
app.use("/workspace", workspaceAPP);
app.use("/list", listAPP);
app.use("/notification", notificationAPP);
app.use("/search", searchAPP);
app.use("/user", userAPP);
app.use("/attachment", attachmentAPP);
app.use("/invite", inviteAPP);
app.use("/superadmin", superadminAPP);

// health check
app.get('/', (req, res) => {
  res.send('active!');
});

// db connect + start
import mongoose from 'mongoose';
const db_address = process.env.DB_URL;
const port = process.env.PORT;

// Subscribe to connection logs
mongoose.connection.on('connected', () => console.log('Mongoose connected to DB'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.warn('Mongoose disconnected from DB'));

try {
  await mongoose.connect(db_address);
  httpServer.listen(port || 6767, () =>
    console.log(`Server + Socket.io listening at port: ${port || 6767}`)
  );
} catch (err) {
  console.log("con refused :", err);
}

// 404 handler
app.use((request, response, next) => {
  console.log("ERROR : INVALID URL");
  return response.status(404).json({ message: "Invalid URL" });
});

// global error handler
app.use((err, req, res, next) => {
  console.log("Error name:", err.name);
  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }
  res.status(500).json({ message: "error occurred", error: "Server side error" });
});

export default app;
