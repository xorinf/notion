import mongoose from "mongoose";

/**
 * @module PageSchema
 * @description Rich text documents/pages within a workspace.
 * Supports hierarchical nesting via parent/children references.
 */
export const pageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, default: "Untitled" },

  icon: { type: String, default: ":D" },

  coverImage: { type: String, default: "" },

  content: { type: String, default: "" },

  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page",
    default: null
  },

  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page"
  }],

  isArchived: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true,
  versionKey: false
});
