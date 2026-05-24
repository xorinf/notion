import mongoose from "mongoose";

/**
 * @module WorkspaceSchema
 * @description The highest-level organizational container.
 * Groups users, boards, and pages together with role-based access control (RBAC).
 */
export const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  description: { type: String, default: "" },

  icon: { type: String, default: ":D" },

  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
      default: "MEMBER"
    }
  }],

  boards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board"
  }],

  pages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page"
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, {
  timestamps: true,
  versionKey: false,
  strict: "throw"
});
