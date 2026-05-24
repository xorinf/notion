import mongoose from "mongoose";

/**
 * @module UserSchema
 * @description Core user profile model. Stores authentication details,
 * global preferences, and references to starred items.
 */
export const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },

  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  avatarUrl: { type: String, default: "" },

  workspaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace"
  }],

  starredBoards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board"
  }],

  starredPages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page"
  }],

  lastActiveAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  versionKey: false
});

