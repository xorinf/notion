import express from 'express';
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

config({ path: "../.env", encoding: "UTF-8", quiet: true });
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
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

// health check
app.get('/', (req, res) => {
  res.send('active!');
});

// db connect + start
const db_address = process.env.DB_URL;
const port = process.env.PORT;
try {
  await connect(db_address);
  console.log(`The DataBase is connected!`);
  app.listen(port || 6767, () => console.log(`server listening at port : ${port || 6767} ...`));
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
  console.log("Error code:", err.code);
  console.log("Error cause:", err.cause);
  console.log("Full error:", JSON.stringify(err, null, 2));
  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }

  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;
  // check mongoose error!
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
