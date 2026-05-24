import mongoose from "mongoose";

/**
 * @module ListSchema
 * @description Represents a column/list within a Kanban board.
 * Maintains an ordered array of Card references.
 */
export const listSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },

  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true
  },

  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card"
  }],

  position: { type: Number, required: true },

  archived: { type: Boolean, default: false },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, {
  timestamps: true,
  versionKey: false
});

listSchema.index({ board: 1, position: 1 });