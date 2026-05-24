/**
 * @file superadminAPI.js
 * @module superadminAPI
 * @description Express router endpoints for superadminAPI. Handles CRUD operations and validation.
 */

import express from 'express';
import {
  userModel,
  workspaceModel,
  boardModel,
  listModel,
  cardModel,
  attachmentModel,
  pageModel,
  activityModel,
  notificationModel,
  inviteModel,
} from '../models/mainModels.js';
import { verifyToken } from '../middleware/verifyToken.js';

export const superadminAPP = express.Router();

// All superadmin routes require a valid session token
superadminAPP.use(verifyToken());

// GET /superadmin/stats — system-wide document counts
superadminAPP.get('/stats', async (req, res, next) => {
  try {
    const [users, workspaces, boards, pages, cards, lists, invites] = await Promise.all([
      userModel.countDocuments(),
      workspaceModel.countDocuments(),
      boardModel.countDocuments(),
      pageModel.countDocuments(),
      cardModel.countDocuments(),
      listModel.countDocuments(),
      inviteModel.countDocuments(),
    ]);
    res.status(200).json({
      message: 'System stats',
      payload: { users, workspaces, boards, pages, cards, lists, invites },
    });
  } catch (err) {
    next(err);
  }
});

// GET /superadmin/users — all users
superadminAPP.get('/users', async (req, res, next) => {
  try {
    const users = await userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json({ message: 'All users', payload: users });
  } catch (err) {
    next(err);
  }
});

// DELETE /superadmin/users/:id — delete a specific user and clean up
superadminAPP.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userModel.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove user from all workspace memberships
    await workspaceModel.updateMany(
      { 'members.user': id },
      { $pull: { members: { user: id } } }
    );

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /superadmin/clear-all — wipe all collections except the calling user
superadminAPP.post('/clear-all', async (req, res, next) => {
  try {
    const callerId = req.user.id;

    await Promise.all([
      workspaceModel.deleteMany({}),
      boardModel.deleteMany({}),
      listModel.deleteMany({}),
      cardModel.deleteMany({}),
      attachmentModel.deleteMany({}),
      pageModel.deleteMany({}),
      activityModel.deleteMany({}),
      notificationModel.deleteMany({}),
      inviteModel.deleteMany({}),
      // Delete every user except the superadmin caller
      userModel.deleteMany({ _id: { $ne: callerId } }),
    ]);

    res.status(200).json({ message: 'All collections cleared. Your account is preserved.' });
  } catch (err) {
    next(err);
  }
});
