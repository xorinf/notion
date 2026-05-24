import express from 'express'
import { attachmentModel, cardModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const attachmentAPP = express.Router()

//upload attachment to card
attachmentAPP.post("/", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const {filename,url,fileType,card} = req.body
        const attachment = await attachmentModel.create({filename,url,fileType,card,uploadedBy:userId})
        
        // Push attachment reference to the card
        await cardModel.findByIdAndUpdate(card, { $push: { attachments: attachment._id } })
        
        res.status(201).json({message:"Attachment uploaded successfully",payload:attachment})
    } catch(err) { next(err) }
})

//get all attachments for a card
attachmentAPP.get("/", verifyToken(), async(req,res,next)=>{
    try {
        const cardId = req.query.card
        if(!cardId) return res.status(400).json({message: "card query param required"})
        const attachments = await attachmentModel.find({card:cardId})
        res.status(200).json({message:"Attachments fetched",payload:attachments})
    } catch(err) { next(err) }
})

//get attachment by ID
attachmentAPP.get("/:id", verifyToken(), async(req,res,next)=>{
    try {
        const {id} = req.params
        const attachment = await attachmentModel.findById(id)
        if(!attachment) return res.status(404).json({message:"Attachment not found"})
        res.status(200).json({message:"Attachment fetched",payload:attachment})
    } catch(err) { next(err) }
})

//delete attachment
attachmentAPP.delete("/:id", verifyToken(), async(req,res,next)=>{
    try {
        const {id} = req.params
        const attachment = await attachmentModel.findById(id)
        if(!attachment) return res.status(404).json({message:"Attachment not found"})
        
        // Delete from Cloudinary to prevent asset leakage
        if (attachment.url) {
            const { deleteFromCloudinary } = await import('../config/cloudinaryUpload.js');
            await deleteFromCloudinary(attachment.url);
        }

        // Remove reference from the card
        await cardModel.findByIdAndUpdate(attachment.card, { $pull: { attachments: id } })
        
        // Delete the attachment document
        await attachmentModel.findByIdAndDelete(id)
        
        res.status(200).json({message:"Attachment deleted successfully"})
    } catch(err) { next(err) }
})
