import mongoose from "mongoose";
import crypto from "crypto";

/**
 * @module InviteSchema
 * @description Handles secure, tokenized invitations for users to join workspaces.
 * Includes expiration dates and cryptographic token generation.
 */
export const inviteSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true
  },

  email: { type: String, required: true, lowercase: true, trim: true },

  role: {
    type: String,
    enum: ["ADMIN", "MEMBER", "VIEWER"],
    default: "MEMBER"
  },

  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"],
    default: "PENDING"
  },

  inviteToken: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(32).toString("hex")
  },

  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },

  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// inviteSchema.index({ inviteToken: 1 });
inviteSchema.index({ workspace: 1, email: 1 });
