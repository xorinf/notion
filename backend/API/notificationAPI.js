/**
 * @file notificationAPI.js
 * @module notificationAPI
 * @description Express router endpoints for notificationAPI. Handles CRUD operations and validation.
 */

import express from 'express'
import { notificationModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const notificationAPP = express.Router()

// to get all notifications
notificationAPP.get("/", verifyToken(), async(req,res,next)=>{
    try {
        const notifications=await notificationModel.find({recipient:req.user.id}).sort({ createdAt: -1 })
        res.status(200).json({message:"Notifications fetched successfully!!",payload:notifications})
    } catch(err) { next(err) }
})

// to get count of unread notifications
notificationAPP.get('/unread-count', verifyToken(), async(req,res,next)=>{
    try {
        const count=await notificationModel.countDocuments({recipient:req.user.id,isRead:false})
        res.status(200).json({message:"Notification count fetched succesfully!",count: count})
    } catch(err) { next(err) }
})

// to mark the notification read
notificationAPP.put("/:id/read", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const read=await notificationModel.findByIdAndUpdate(id,{isRead:true}, {new:true})
        if(!read) return res.status(404).json({message:"Notification not found!!"})
        res.status(200).json({message:"Notification marked as read", payload:read})
    } catch(err) { next(err) }
})

// to mark all notifications as read
notificationAPP.put("/read-all", verifyToken(), async(req,res,next)=>{
    try {
        await notificationModel.updateMany({recipient:req.user.id,isRead:false},{isRead:true})
        res.status(200).json({message:"All notifications marked as read"})
    } catch(err) { next(err) }
})

// to delete notifications
notificationAPP.delete("/:id", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const delete_notification=await notificationModel.findByIdAndDelete(id)
        if(!delete_notification) return res.status(404).json({message:"Notification not found"})
        res.status(200).json({message:"Notification deleted"})
    } catch(err) { next(err) }
})

// to delete all read notifications
notificationAPP.delete("/clear-read", verifyToken(), async(req,res,next)=>{
    try {
        await notificationModel.deleteMany({recipient:req.user.id,isRead:true})
        res.status(200).json({message:"All read notifications are deleted successfully!"})
    } catch(err) { next(err) }
})