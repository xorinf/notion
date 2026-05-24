import mongoose from "mongoose";

/**
 * @module CardSchema
 * @description The core task entity in the Kanban system. Cards belong to a List
 * and contain highly detailed metadata (labels, checklists, dueDate, comments, etc.).
 */
export const cardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },

  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
  list: { type: mongoose.Schema.Types.ObjectId, ref: "List", required: true },

  position: { type: Number, required: true },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  labels: [{
    name: { type: String, required: true },
    color: { type: String, required: true }
  }],

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    default: "MEDIUM"
  },

  dueDate: { type: Date },
  completed: { type: Boolean, default: false },

  checklist: [{
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],

  coverImage: { type: String, default: "" },

  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attachment"
  }],

  comments: [{
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
  }],

  archived: { type: Boolean, default: false },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, {
  timestamps: true,
  versionKey: false
});

cardSchema.index({ list: 1, position: 1 });
