/**
 * @file activityAPP.js
 * @module activityAPP
 * @description Express router endpoints for activityAPP. Handles CRUD operations and validation.
 */

import express from 'express'
import { activityModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const activityAPP = express.Router()

// Get activity feed for workspace (with optional entity filter)
// GET /activity?workspace={workspaceId}&entityType={entityType}&entityId={entityId}
activityAPP.get("/", verifyToken(), async (request, response, next) => {
    try {
        const { workspace, entityType, entityId } = request.query

        if (!workspace) {
            return response.status(400).json({ message: "workspace query parameters required" })
        }

        const filter = { workspace }

        if (entityType) filter.entityType = entityType
        if (entityId) filter.entityId = entityId

        const activities = await activityModel
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("performedBy", "firstName lastName avatarUrl email")

        return response.status(200).json({ message: "Activity fetched", payload: activities })
    } catch (error) {
        next(error)
    }
})

// Get my activity (performed by current user)
// GET /activity/me
activityAPP.get("/me", verifyToken(), async (request, response, next) => {
    try {
        const activities = await activityModel
            .find({ performedBy: request.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("performedBy", "firstName lastName avatarUrl email")

        return response.status(200).json({ message: "Your activity fetched", payload: activities })
    } catch (error) {
        next(error)
    }
})
