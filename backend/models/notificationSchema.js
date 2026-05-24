import mongoose from "mongoose";

/**
 * @module NotificationSchema
 * @description System notifications model. Used to push alerts to users when
 * they are assigned to tasks, mentioned, invited, or facing upcoming due dates.
 */
export const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["ASSIGNED", "MENTIONED", "DUE_SOON", "COMMENT", "INVITE", "BOARD_UPDATE"],
    required: true
  },

  title: { type: String, required: true },

  message: { type: String },

  link: { type: String },

  isRead: { type: Boolean, default: false },

  relatedEntity: {
    entityType: {
      type: String,
      enum: ["Card", "Board", "Page", "Workspace"]
    },
    entityId: { type: mongoose.Schema.Types.ObjectId }
  }
}, {
  timestamps: true,
  versionKey: false
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
