/**
 * @file pageAPI.js
 * @module pageAPI
 * @description Express router endpoints for pageAPI. Handles CRUD operations and validation.
 */

import express from 'express'
import { pageModel, workspaceModel, activityModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const pageAPP = express.Router()

// helper to log activity
const logActivity = async (action, entityId, details, userId, workspace) => {
    try {
        await activityModel.create({
            action,
            entityType: "Page",
            entityId,
            details,
            performedBy: userId,
            workspace
        })
    } catch (err) {
        console.log("Activity log error:", err.message)
    }
}

// Create page in workspace
pageAPP.post("/", verifyToken(), async (request, response, next) => {
    try {
        const content = request.body
        content.createdBy = request.user.id
        content.lastEditedBy = request.user.id

        const newPage = new pageModel(content)
        await newPage.save()

        // add page to workspace.pages
        await workspaceModel.findByIdAndUpdate(content.workspace, { $push: { pages: newPage._id } })

        // if this is a sub-page, add to parent's children
        if (content.parent) {
            await pageModel.findByIdAndUpdate(content.parent, { $push: { children: newPage._id } })
        }

        await logActivity("CREATED", newPage._id, `Created page "${newPage.title}"`, request.user.id, content.workspace)

        response.status(201).json({ message: "Page created", payload: newPage })
    } catch (error) {
        next(error)
    }
})

// Get all pages in workspace (top-level only)
pageAPP.get("/", verifyToken(), async (request, response, next) => {
    try {
        const { workspace } = request.query
        if (!workspace) return response.status(400).json({ message: "workspace query param required" })

        const pages = await pageModel
            .find({ workspace, parent: null, isArchived: false })
            .sort({ updatedAt: -1 })
            .populate("createdBy", "firstName lastName avatarUrl")
            .populate("children")

        return response.status(200).json({ message: "Pages fetched", payload: pages })
    } catch (error) {
        next(error)
    }
})

// Get page by ID
pageAPP.get("/:id", verifyToken(), async (request, response, next) => {
    try {
        const page = await pageModel.findById(request.params.id)
            .populate("createdBy", "firstName lastName avatarUrl")
            .populate("lastEditedBy", "firstName lastName avatarUrl")
            .populate("children", "title icon isArchived")
            .populate("parent", "title icon")

        if (!page) return response.status(404).json({ message: "Page Not Found" })
        return response.status(200).json({ message: "Page fetched", payload: page })
    } catch (error) {
        next(error)
    }
})

// Update page
pageAPP.put("/:id", verifyToken(), async (request, response, next) => {
    try {
        const updates = request.body
        updates.lastEditedBy = request.user.id

        const page = await pageModel.findByIdAndUpdate(
            request.params.id,
            updates,
            { returnDocument: 'after' }
        )
        if (!page) return response.status(404).json({ message: "Page Not Found" })

        await logActivity("UPDATED", page._id, `Updated page "${page.title}"`, request.user.id, page.workspace)

        response.status(200).json({ message: "Page updated", payload: page })
    } catch (error) {
        next(error)
    }
})

// Update page cover image
pageAPP.put("/:id/cover", verifyToken(), async (request, response, next) => {
    try {
        const { coverImage } = request.body
        const page = await pageModel.findByIdAndUpdate(
            request.params.id,
            { coverImage, lastEditedBy: request.user.id },
            { returnDocument: 'after' }
        )
        if (!page) return response.status(404).json({ message: "Page Not Found" })
        response.status(200).json({ message: "Cover updated", payload: page })
    } catch (error) {
        next(error)
    }
})

// Move page to different parent
pageAPP.put("/:id/move", verifyToken(), async (request, response, next) => {
    try {
        const { parent: newParent } = request.body
        const page = await pageModel.findById(request.params.id)
        if (!page) return response.status(404).json({ message: "Page Not Found" })

        // remove from old parent's children
        if (page.parent) {
            await pageModel.findByIdAndUpdate(page.parent, { $pull: { children: page._id } })
        }

        // add to new parent's children (if not moving to top-level)
        if (newParent) {
            await pageModel.findByIdAndUpdate(newParent, { $push: { children: page._id } })
        }

        page.parent = newParent || null
        page.lastEditedBy = request.user.id
        await page.save()

        await logActivity("MOVED", page._id, `Moved page "${page.title}"`, request.user.id, page.workspace)

        response.status(200).json({ message: "Page moved", payload: page })
    } catch (error) {
        next(error)
    }
})

// Archive page
pageAPP.put("/:id/archive", verifyToken(), async (request, response, next) => {
    try {
        const page = await pageModel.findByIdAndUpdate(
            request.params.id,
            { isArchived: true, lastEditedBy: request.user.id },
            { returnDocument: 'after' }
        )
        if (!page) return response.status(404).json({ message: "Page Not Found" })

        await logActivity("ARCHIVED", page._id, `Archived page "${page.title}"`, request.user.id, page.workspace)

        response.status(200).json({ message: "Page archived", payload: page })
    } catch (error) {
        next(error)
    }
})

// Unarchive page
pageAPP.put("/:id/unarchive", verifyToken(), async (request, response, next) => {
    try {
        const page = await pageModel.findByIdAndUpdate(
            request.params.id,
            { isArchived: false, lastEditedBy: request.user.id },
            { returnDocument: 'after' }
        )
        if (!page) return response.status(404).json({ message: "Page Not Found" })
        response.status(200).json({ message: "Page unarchived", payload: page })
    } catch (error) {
        next(error)
    }
})

// Toggle favorite
pageAPP.put("/:id/favorite", verifyToken(), async (request, response, next) => {
    try {
        const page = await pageModel.findById(request.params.id)
        if (!page) return response.status(404).json({ message: "Page Not Found" })

        page.isFavorite = !page.isFavorite
        await page.save()

        response.status(200).json({ message: page.isFavorite ? "Added to favorites" : "Removed from favorites", payload: page })
    } catch (error) {
        next(error)
    }
})

// Delete page
pageAPP.delete("/:id", verifyToken(), async (request, response, next) => {
    try {
        const page = await pageModel.findById(request.params.id)
        if (!page) return response.status(404).json({ message: "Page Not Found" })

        // remove from parent's children
        if (page.parent) {
            await pageModel.findByIdAndUpdate(page.parent, { $pull: { children: page._id } })
        }

        // remove from workspace pages
        await workspaceModel.findByIdAndUpdate(page.workspace, { $pull: { pages: page._id } })

        // recursively delete children
        const deleteChildren = async (pageId) => {
            const p = await pageModel.findById(pageId)
            if (p && p.children.length > 0) {
                for (const childId of p.children) {
                    await deleteChildren(childId)
                }
            }
            await pageModel.findByIdAndDelete(pageId)
        }
        await deleteChildren(page._id)

        await logActivity("DELETED", page._id, `Deleted page "${page.title}"`, request.user.id, page.workspace)

        response.status(200).json({ message: "Page deleted" })
    } catch (error) {
        next(error)
    }
})
