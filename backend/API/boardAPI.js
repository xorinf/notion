/**
 * @file boardAPI.js
 * @module boardAPI
 * @description Express router endpoints for boardAPI. Handles CRUD operations and validation.
 */

import express from 'express'
import { boardModel, listModel, cardModel, workspaceModel, activityModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const boardAPP = express.Router()

// helper to log activity
const logActivity = async (action, entityId, details, userId, workspace) => {
    try {
        await activityModel.create({
            action,
            entityType: "Board",
            entityId,
            details,
            performedBy: userId,
            workspace
        })
    } catch (err) {
        console.log("Activity log error:", err.message)
    }
}

// Get all board templates (must be before /:id to avoid conflict)
boardAPP.get("/templates", verifyToken(), async (request, response, next) => {
    try {
        const { workspace } = request.query
        const filter = { isTemplate: true }
        if (workspace) filter.workspace = workspace

        const templates = await boardModel.find(filter)
            .populate("createdBy", "firstName lastName avatarUrl")
            .sort({ createdAt: -1 })

        return response.status(200).json({ message: "Templates fetched", payload: templates })
    } catch (error) {
        next(error)
    }
})

// Create board from template
boardAPP.post("/from-template", verifyToken(), async (request, response, next) => {
    try {
        const { templateId, title, workspace } = request.body

        const template = await boardModel.findById(templateId).populate({
            path: "lists",
            populate: { path: "cards" }
        })
        if (!template) return response.status(404).json({ message: "Template Not Found" })

        // create the new board
        const newBoard = new boardModel({
            title: title || template.title,
            description: template.description,
            workspace,
            background: template.background,
            visibility: template.visibility,
            createdBy: request.user.id,
            members: [{ user: request.user.id, role: "EDIT" }]
        })
        await newBoard.save()

        // duplicate lists and cards
        for (const list of template.lists) {
            const newList = new listModel({
                title: list.title,
                board: newBoard._id,
                position: list.position,
                createdBy: request.user.id
            })
            await newList.save()

            for (const card of list.cards) {
                const newCard = new cardModel({
                    title: card.title,
                    description: card.description,
                    list: newList._id,
                    board: newBoard._id,
                    position: card.position,
                    priority: card.priority,
                    labels: card.labels,
                    checklist: card.checklist.map(item => ({ text: item.text, completed: false })),
                    createdBy: request.user.id
                })
                await newCard.save()
                newList.cards.push(newCard._id)
            }
            await newList.save()
            newBoard.lists.push(newList._id)
        }
        await newBoard.save()

        // add board to workspace
        await workspaceModel.findByIdAndUpdate(workspace, { $push: { boards: newBoard._id } })

        await logActivity("CREATED", newBoard._id, `Created board "${newBoard.title}" from template`, request.user.id, workspace)

        response.status(201).json({ message: "Board created from template", payload: newBoard })
    } catch (error) {
        next(error)
    }
})

// Create board in workspace
boardAPP.post("/", verifyToken(), async (request, response, next) => {
    try {
        const content = request.body
        content.createdBy = request.user.id
        content.members = [{ user: request.user.id, role: "EDIT" }]

        const newBoard = new boardModel(content)
        await newBoard.save()

        // add board to workspace
        await workspaceModel.findByIdAndUpdate(content.workspace, { $push: { boards: newBoard._id } })

        await logActivity("CREATED", newBoard._id, `Created board "${newBoard.title}"`, request.user.id, content.workspace)

        response.status(201).json({ message: "Board created", payload: newBoard })
    } catch (error) {
        next(error)
    }
})

// Get all boards in workspace
boardAPP.get("/", verifyToken(), async (request, response, next) => {
    try {
        const { workspace } = request.query
        if (!workspace) return response.status(400).json({ message: "workspace query param required" })

        const boards = await boardModel.find({ workspace, archived: false, isTemplate: false })
            .populate("createdBy", "firstName lastName avatarUrl")
            .populate("members.user", "firstName lastName avatarUrl")
            .sort({ updatedAt: -1 })

        return response.status(200).json({ message: "Boards fetched", payload: boards })
    } catch (error) {
        next(error)
    }
})

// Get board by ID (with populated lists + cards)
boardAPP.get("/:id", verifyToken(), async (request, response, next) => {
    try {
        const board = await boardModel.findById(request.params.id)
            .populate("createdBy", "firstName lastName avatarUrl")
            .populate("members.user", "firstName lastName avatarUrl email")
            .populate({
                path: "lists",
                match: { archived: false },
                options: { sort: { position: 1 } },
                populate: {
                    path: "cards",
                    match: { archived: false },
                    options: { sort: { position: 1 } },
                    populate: [
                        { path: "members", select: "firstName lastName avatarUrl" },
                        { path: "createdBy", select: "firstName lastName" }
                    ]
                }
            })

        if (!board) return response.status(404).json({ message: "Board Not Found" })
        return response.status(200).json({ message: "Board fetched", payload: board })
    } catch (error) {
        next(error)
    }
})

// Update board
boardAPP.put("/:id", verifyToken(), async (request, response, next) => {
    try {
        const board = await boardModel.findByIdAndUpdate(
            request.params.id,
            request.body,
            { returnDocument: 'after' }
        )
        if (!board) return response.status(404).json({ message: "Board Not Found" })

        await logActivity("UPDATED", board._id, `Updated board "${board.title}"`, request.user.id, board.workspace)

        response.status(200).json({ message: "Board updated", payload: board })
    } catch (error) {
        next(error)
    }
})

// Archive board
boardAPP.put("/:id/archive", verifyToken(), async (request, response, next) => {
    try {
        const board = await boardModel.findByIdAndUpdate(
            request.params.id,
            { archived: true },
            { returnDocument: 'after' }
        )
        if (!board) return response.status(404).json({ message: "Board Not Found" })

        await logActivity("ARCHIVED", board._id, `Archived board "${board.title}"`, request.user.id, board.workspace)

        response.status(200).json({ message: "Board archived", payload: board })
    } catch (error) {
        next(error)
    }
})

// Unarchive board
boardAPP.put("/:id/unarchive", verifyToken(), async (request, response, next) => {
    try {
        const board = await boardModel.findByIdAndUpdate(
            request.params.id,
            { archived: false },
            { returnDocument: 'after' }
        )
        if (!board) return response.status(404).json({ message: "Board Not Found" })
        response.status(200).json({ message: "Board unarchived", payload: board })
    } catch (error) {
        next(error)
    }
})

// Delete board
boardAPP.delete("/:id", verifyToken(), async (request, response, next) => {
    try {
        const board = await boardModel.findById(request.params.id)
        if (!board) return response.status(404).json({ message: "Board Not Found" })

        // delete all cards in all lists of this board
        for (const listId of board.lists) {
            await cardModel.deleteMany({ list: listId })
        }
        // delete all lists
        await listModel.deleteMany({ board: board._id })

        // remove from workspace
        await workspaceModel.findByIdAndUpdate(board.workspace, { $pull: { boards: board._id } })

        await boardModel.findByIdAndDelete(board._id)

        await logActivity("DELETED", board._id, `Deleted board "${board.title}"`, request.user.id, board.workspace)

        response.status(200).json({ message: "Board deleted" })
    } catch (error) {
        next(error)
    }
})

// Add member to board
boardAPP.post("/:id/members", verifyToken(), async (request, response, next) => {
    try {
        const { userId, role } = request.body
        const board = await boardModel.findById(request.params.id)
        if (!board) return response.status(404).json({ message: "Board Not Found" })

        // check if already a member
        const existing = board.members.find(m => m.user.toString() === userId)
        if (existing) return response.status(409).json({ message: "User is already a member" })

        board.members.push({ user: userId, role: role || "VIEW" })
        await board.save()

        await logActivity("ASSIGNED", board._id, `Added member to board "${board.title}"`, request.user.id, board.workspace)

        const populated = await board.populate("members.user", "firstName lastName avatarUrl email")
        response.status(200).json({ message: "Member added", payload: populated })
    } catch (error) {
        next(error)
    }
})

// Update board member role
boardAPP.put("/:id/members/:userId", verifyToken(), async (request, response, next) => {
    try {
        const { role } = request.body
        const board = await boardModel.findOneAndUpdate(
            { _id: request.params.id, "members.user": request.params.userId },
            { $set: { "members.$.role": role } },
            { returnDocument: 'after' }
        ).populate("members.user", "firstName lastName avatarUrl email")

        if (!board) return response.status(404).json({ message: "Board or member Not Found" })
        response.status(200).json({ message: "Member role updated", payload: board })
    } catch (error) {
        next(error)
    }
})

// Remove member from board
boardAPP.delete("/:id/members/:userId", verifyToken(), async (request, response, next) => {
    try {
        const board = await boardModel.findByIdAndUpdate(
            request.params.id,
            { $pull: { members: { user: request.params.userId } } },
            { returnDocument: 'after' }
        ).populate("members.user", "firstName lastName avatarUrl email")

        if (!board) return response.status(404).json({ message: "Board Not Found" })
        response.status(200).json({ message: "Member removed", payload: board })
    } catch (error) {
        next(error)
    }
})

// Save board as template
boardAPP.post("/:id/save-template", verifyToken(), async (request, response, next) => {
    try {
        const board = await boardModel.findByIdAndUpdate(
            request.params.id,
            { isTemplate: true },
            { returnDocument: 'after' }
        )
        if (!board) return response.status(404).json({ message: "Board Not Found" })
        response.status(200).json({ message: "Board saved as template", payload: board })
    } catch (error) {
        next(error)
    }
})
