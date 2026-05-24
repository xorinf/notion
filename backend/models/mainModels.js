import { model } from "mongoose";
import { userSchema } from "./userSchema.js";
import { workspaceSchema } from "./workspaceSchema.js";
import { boardSchema } from "./boardSchema.js";
import { listSchema } from "./listSchema.js";
import { cardSchema } from "./cardSchema.js";
import { attachmentSchema } from "./attachmentSchema.js";
import { pageSchema } from "./pageSchema.js";
import { activitySchema } from "./activitySchema.js";
import { notificationSchema } from "./notificationSchema.js";
import { inviteSchema } from "./inviteSchema.js";

/**
 * @module MainModels
 * @description Centralized export file for all compiled Mongoose models.
 * This simplifies importing models across different API routes.
 */

// Models
export const userModel = model("User", userSchema);
export const workspaceModel = model("Workspace", workspaceSchema);
export const boardModel = model("Board", boardSchema);
export const listModel = model("List", listSchema);
export const cardModel = model("Card", cardSchema);
export const attachmentModel = model("Attachment", attachmentSchema);
export const pageModel = model("Page", pageSchema);
export const activityModel = model("Activity", activitySchema);
export const notificationModel = model("Notification", notificationSchema);
export const inviteModel = model("Invite", inviteSchema);