import mongoose from "mongoose";

/**
 * @module BoardSchema
 * @description Defines the Kanban board structure. Boards belong to Workspaces
 * and contain an array of List references. Handles visibility and member access.
 */
export const boardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },

  description: { type: String, default: "" },

  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true
  },

  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: {
      type: String,
      enum: ["EDIT", "COMMENT", "VIEW"],
      default: "VIEW"
    }
  }],

  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "List"
  }],

  background: { type: String, default: "#1e1e2e" },

  visibility: {
    type: String,
    enum: ["PRIVATE", "WORKSPACE", "PUBLIC"],
    default: "WORKSPACE"
  },

  isTemplate: { type: Boolean, default: false },

  archived: { type: Boolean, default: false },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, {
  timestamps: true,
  versionKey: false
});