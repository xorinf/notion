import express from 'express'
import { cardModel, listModel, activityModel, attachmentModel, userModel, notificationModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const cardAPP = express.Router()

import { upload } from '../config/multer.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinaryUpload.js'

// log activity for card
const logActivity = async (action, entityId, details, userId, workspace) => {
    try {
        await activityModel.create({
            action,
            entityType: "Card",
            entityId,
            details,
            performedBy: userId,
            workspace
        })
    } catch (err) {
        console.log("Activity log error:", err.message)
    }
}

// Create card in list
cardAPP.post("", verifyToken(), async (request, response, next) => {
    try {
        let content = request.body
        content.createdBy = request.user?.id
        const newCard = new cardModel(content)
        await newCard.save()

        // push card into the list's cards array
        await listModel.findByIdAndUpdate(content.list, { $push: { cards: newCard._id } })

        // log activity
        const list = await listModel.findById(content.list).populate("board")
        if (list?.board?.workspace) {
            await logActivity("CREATED", newCard._id, `Created card "${newCard.title}"`, request.user.id, list.board.workspace)
        }

        response.status(201).json({ message: "New Card Created", payload: newCard })
    } catch (error) {
        next(error)
    }
})

// Get all cards in list
cardAPP.get("", async (request, response, next) => {
    try {
        const { list } = request.query
        const cards = await cardModel.find({ list }).sort({ position: 1 })
        return response.status(200).json({ message: "data fetched", payload: cards })
    } catch (error) {
        next(error)
    }
})

// Get card by ID
cardAPP.get("/:id", async (request, response, next) => {
    try {
        const data = await cardModel.findById(request.params.id)
            .populate("members", "firstName lastName avatarUrl email")
            .populate("comments.author", "firstName lastName avatarUrl")
        if (!data) return response.status(404).json({ message: "Card Not Found" })
        return response.status(200).json({ message: "data fetched", payload: data })
    } catch (error) {
        next(error)
    }
})

// Update card
cardAPP.put("/:id", verifyToken(), async (request, response, next) => {
    try {
        const updatedCard = await cardModel.findByIdAndUpdate(
            request.params.id,
            request.body,
            { returnDocument: 'after' }
        )
        if (!updatedCard) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Card updated", payload: updatedCard })
    } catch (error) {
        next(error)
    }
})

// Move card to different list
cardAPP.put("/:id/move", verifyToken(), async (request, response, next) => {
    try {
        const { targetList, position } = request.body
        const card = await cardModel.findById(request.params.id)
        if (!card) return response.status(404).json({ message: "Card Not Found" })

        const oldList = card.list

        // remove from old list
        await listModel.findByIdAndUpdate(oldList, { $pull: { cards: card._id } })

        // update card's list and position
        card.list = targetList
        card.position = position
        await card.save()

        // add to new list
        await listModel.findByIdAndUpdate(targetList, { $push: { cards: card._id } })

        // reorder cards in target list
        const targetCards = await cardModel.find({ list: targetList, _id: { $ne: card._id } }).sort({ position: 1 })
        let pos = 0
        for (const tc of targetCards) {
            if (pos === position) pos++
            tc.position = pos
            await tc.save()
            pos++
        }

        response.status(200).json({ message: "Card moved", payload: card })
    } catch (error) {
        next(error)
    }
})

// Reorder card within same list
cardAPP.put("/:id/reorder", verifyToken(), async (request, response, next) => {
    try {
        const { position } = request.body
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { position },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Card reordered", payload: card })
    } catch (error) {
        next(error)
    }
})

// Mark card as completed
cardAPP.put("/:id/complete", verifyToken(), async (request, response, next) => {
    try {
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { completed: true },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Card marked complete", payload: card })
    } catch (error) {
        next(error)
    }
})

// Mark card as incomplete
cardAPP.put("/:id/incomplete", verifyToken(), async (request, response, next) => {
    try {
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { completed: false },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Card marked incomplete", payload: card })
    } catch (error) {
        next(error)
    }
})

// Archive card
cardAPP.put("/:id/archive", verifyToken(), async (request, response, next) => {
    try {
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { archived: true },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Card archived", payload: card })
    } catch (error) {
        next(error)
    }
})

// Unarchive card
cardAPP.put("/:id/unarchive", verifyToken(), async (request, response, next) => {
    try {
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { archived: false },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Card unarchived", payload: card })
    } catch (error) {
        next(error)
    }
})

// Delete card
cardAPP.delete("/:id", verifyToken(), async (request, response, next) => {
    try {
        const card = await cardModel.findById(request.params.id)
        if (!card) return response.status(404).json({ message: "Card Not Found" })

        // remove from list
        await listModel.findByIdAndUpdate(card.list, { $pull: { cards: card._id } })

        await cardModel.findByIdAndDelete(request.params.id)
        response.status(200).json({ message: "Card deleted" })
    } catch (error) {
        next(error)
    }
})

// Assign member to card
cardAPP.post("/:id/members", verifyToken(), async (request, response, next) => {
    try {
        const { userId } = request.body
        const cardBefore = await cardModel.findById(request.params.id)
        if (!cardBefore) return response.status(404).json({ message: "Card Not Found" })

        const alreadyMember = cardBefore.members.some(m => m.toString() === userId)

        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $addToSet: { members: userId } },
            { returnDocument: 'after' }
        )

        if (!alreadyMember && userId !== request.user.id) {
            const assigner = await userModel.findById(request.user.id)
            const assignerName = assigner ? `${assigner.firstName} ${assigner.lastName}` : "Someone"
            
            await notificationModel.create({
                recipient: userId,
                type: "ASSIGNED",
                title: `Assigned to card: "${card.title}"`,
                message: `${assignerName} assigned you to the card "${card.title}"`,
                link: `/dashboard/board/${card.board}`,
                relatedEntity: {
                    entityType: "Card",
                    entityId: card._id
                }
            })
        }

        response.status(200).json({ message: "Member assigned", payload: card })
    } catch (error) {
        next(error)
    }
})

// Remove member from card
cardAPP.delete("/:id/members/:userId", verifyToken(), async (request, response, next) => {
    try {
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $pull: { members: request.params.userId } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Member removed", payload: card })
    } catch (error) {
        next(error)
    }
})

// Add label to card
cardAPP.post("/:id/labels", verifyToken(), async (request, response, next) => {
    try {
        const { name, color } = request.body
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $push: { labels: { name, color } } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Label added", payload: card })
    } catch (error) {
        next(error)
    }
})

// Remove label from card
cardAPP.delete("/:id/labels/:labelId", verifyToken(), async (request, response, next) => {
    try {
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $pull: { labels: { _id: request.params.labelId } } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Label removed", payload: card })
    } catch (error) {
        next(error)
    }
})

// Add checklist item
cardAPP.post("/:id/checklist", verifyToken(), async (request, response, next) => {
    try {
        const { text } = request.body
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $push: { checklist: { text, completed: false } } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Checklist item added", payload: card })
    } catch (error) {
        next(error)
    }
})

// Toggle checklist item
cardAPP.put("/:id/checklist/:itemId", verifyToken(), async (request, response, next) => {
    try {
        const { completed } = request.body
        const card = await cardModel.findOneAndUpdate(
            { _id: request.params.id, "checklist._id": request.params.itemId },
            { $set: { "checklist.$.completed": completed } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card or checklist item Not Found" })
        response.status(200).json({ message: "Checklist item updated", payload: card })
    } catch (error) {
        next(error)
    }
})

// Delete checklist item
cardAPP.delete("/:id/checklist/:itemId", verifyToken(), async (request, response, next) => {
    try {
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $pull: { checklist: { _id: request.params.itemId } } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Checklist item deleted", payload: card })
    } catch (error) {
        next(error)
    }
})

// Add comment to card
cardAPP.post("/:id/comments", verifyToken(), async (request, response, next) => {
    try {
        const { text } = request.body
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $push: { comments: { text, author: request.user.id } } },
            { returnDocument: 'after' }
        ).populate("comments.author", "firstName lastName avatarUrl")
        
        if (!card) return response.status(404).json({ message: "Card Not Found" })

        // Notify other card members
        const commenter = await userModel.findById(request.user.id)
        const commenterName = commenter ? `${commenter.firstName} ${commenter.lastName}` : "Someone"
        const otherMembers = card.members.filter(m => m.toString() !== request.user.id)
        
        for (const memberId of otherMembers) {
            await notificationModel.create({
                recipient: memberId,
                type: "COMMENT",
                title: `New comment on: "${card.title}"`,
                message: `${commenterName} commented: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
                link: `/dashboard/board/${card.board}`,
                relatedEntity: {
                    entityType: "Card",
                    entityId: card._id
                }
            })
        }

        response.status(201).json({ message: "Comment added", payload: card })
    } catch (error) {
        next(error)
    }
})

// Update comment
cardAPP.put("/:id/comments/:commentId", verifyToken(), async (request, response, next) => {
    try {
        const { text } = request.body
        const card = await cardModel.findOneAndUpdate(
            { _id: request.params.id, "comments._id": request.params.commentId },
            { $set: { "comments.$.text": text } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card or comment Not Found" })
        response.status(200).json({ message: "Comment updated", payload: card })
    } catch (error) {
        next(error)
    }
})

// Delete comment
cardAPP.delete("/:id/comments/:commentId", verifyToken(), async (request, response, next) => {
    try {
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $pull: { comments: { _id: request.params.commentId } } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })
        response.status(200).json({ message: "Comment deleted", payload: card })
    } catch (error) {
        next(error)
    }
})

// Add attachment to card
cardAPP.post("/:id/attachments", verifyToken(), upload.single("file"), async (request, response, next) => {
    try {
        if (!request.file) return response.status(400).json({ message: "No file uploaded" })

        // Upload to Cloudinary
        const result = await uploadToCloudinary(request.file.buffer)
        

        // Determine file type
        let fileType = "other"
        if (request.file.mimetype.startsWith("image/")) fileType = "image"
        else if (request.file.mimetype.startsWith("video/")) fileType = "video"
        else if (request.file.mimetype.includes("pdf") || request.file.mimetype.includes("document")) fileType = "document"

        // Create attachment document
        const newAttachment = new attachmentModel({
            filename: request.file.originalname,
            url: result.secure_url,
            fileType,
            card: request.params.id,
            uploadedBy: request.user.id
        })
        await newAttachment.save()

        // Link to card
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $push: { attachments: newAttachment._id } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })

        response.status(201).json({ message: "Attachment added", payload: newAttachment })
    } catch (error) {
        next(error)
    }
})

// Delete attachment from card
cardAPP.delete("/:id/attachments/:attachmentId", verifyToken(), async (request, response, next) => {
    try {
        const attachment = await attachmentModel.findById(request.params.attachmentId)
        if (attachment?.url) {
            await deleteFromCloudinary(attachment.url)
        }

        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { $pull: { attachments: request.params.attachmentId } },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })

        await attachmentModel.findByIdAndDelete(request.params.attachmentId)

        response.status(200).json({ message: "Attachment deleted" })
    } catch (error) {
        next(error)
    }
})

// Upload cover image to card
cardAPP.post("/:id/cover", verifyToken(), upload.single("file"), async (request, response, next) => {
    try {
        if (!request.file) return response.status(400).json({ message: "No file uploaded" })

        // Upload to Cloudinary
        const result = await uploadToCloudinary(request.file.buffer)

        // Link to card cover
        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { coverImage: result.secure_url },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })

        response.status(200).json({ message: "Cover image added", payload: card })
    } catch (error) {
        next(error)
    }
})

// Remove cover image from card
cardAPP.delete("/:id/cover", verifyToken(), async (request, response, next) => {
    try {
        const existingCard = await cardModel.findById(request.params.id)
        if (existingCard?.coverImage) {
            await deleteFromCloudinary(existingCard.coverImage)
        }

        const card = await cardModel.findByIdAndUpdate(
            request.params.id,
            { coverImage: "" },
            { returnDocument: 'after' }
        )
        if (!card) return response.status(404).json({ message: "Card Not Found" })

        response.status(200).json({ message: "Cover image removed", payload: card })
    } catch (error) {
        next(error)
    }
})
