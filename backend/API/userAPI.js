/**
 * @file userAPI.js
 * @module userAPI
 * @description Express router endpoints for userAPI. Handles CRUD operations and validation.
 */

import express from 'express'
import { userModel, boardModel, pageModel, workspaceModel } from '../models/mainModels.js'
import { hash, compare } from "bcryptjs"
import { verifyToken } from '../middleware/verifyToken.js'

export const userAPP = express.Router()

//get user profile
userAPP.get("/me", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const user = await userModel.findById(userId).select("-password")
        if(!user) return res.status(404).json({message:"User not found"})
        res.status(200).json({message:"user profile",payload:user})
    } catch(err) { next(err) }
})

//update my profile
userAPP.put("/me", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const {firstName,lastName,avatarUrl} = req.body
        const modifieduser = await userModel.findOneAndUpdate(
            {_id:userId},
            {$set:{firstName,lastName,avatarUrl}},
            {new:true}
        ).select("-password")
        
        if(!modifieduser) return res.status(404).json({message:"User not found"})
        res.status(200).json({message:"Profile updated successfully",payload:modifieduser})
    } catch(err) { next(err) }
})

//change password
userAPP.put("/change-password", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const {currentPassword,newPassword} = req.body
        const user = await userModel.findById(userId)
        
        if(!user) return res.status(404).json({message:"user not found"})
        
        const isMatch = await compare(currentPassword, user.password)
        if(!isMatch) return res.status(400).json({message:"Current password incorrect"})
        
        const hashedPassword = await hash(newPassword,12)
        user.password = hashedPassword
        await user.save()
        
        res.status(200).json({message:"Password changed successfully"})
    } catch(err) { next(err) }
})

//star a board
userAPP.post("/star/board/:boardId", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const boardId = req.params.boardId
        
        const board = await boardModel.findById(boardId)
        if(!board) return res.status(404).json({message:"Board not found"})
        
        const user = await userModel.findById(userId)
        if(user.starredBoards.includes(boardId)) {
            return res.status(400).json({message:"Board is already starred"})
        }
        
        user.starredBoards.push(boardId)
        await user.save()
        
        res.status(200).json({message:"Board starred successfully",payload:user})
    } catch(err) { next(err) }
})

//unstar a board
userAPP.delete("/star/board/:boardId", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const boardId = req.params.boardId
        
        const user = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { starredBoards: boardId } },
            { new: true }
        ).select("-password")
        
        res.status(200).json({message:"Board unstarred successfully",payload:user})
    } catch(err) { next(err) }
})

//star page 
userAPP.post("/star/page/:pageId", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const pageId = req.params.pageId
        
        const page = await pageModel.findById(pageId)
        if(!page) return res.status(404).json({message:"Page not found"})
        
        const user = await userModel.findById(userId)
        if(user.starredPages.includes(pageId)) {
            return res.status(400).json({message:"Page is already starred"})
        }
        
        user.starredPages.push(pageId)
        await user.save()
        
        res.status(200).json({message:"Page starred successfully",payload:user})
    } catch(err) { next(err) }
})

//unstar a page
userAPP.delete("/star/page/:pageId", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const pageId = req.params.pageId
        
        const user = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { starredPages: pageId } },
            { new: true }
        ).select("-password")
        
        res.status(200).json({message:"Page unstarred successfully",payload:user})
    } catch(err) { next(err) }
})

//get all starred items
userAPP.get("/starred", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const user = await userModel.findById(userId)
            .populate("starredBoards")
            .populate("starredPages")
            .select("-password")
            
        if(!user) return res.status(404).json({message:"User not found"})
        res.status(200).json({message:"Starred items",payload: { starredBoards: user.starredBoards, starredPages: user.starredPages }})
    } catch(err) { next(err) }
})

//delete my account
userAPP.delete("/me", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const user = await userModel.findByIdAndDelete(userId)
        if(!user) return res.status(404).json({message:"User not found"})
        
        // Remove user from all workspaces they are a member of
        await workspaceModel.updateMany(
            { "members.user": userId },
            { $pull: { members: { user: userId } } }
        )
        
        res.status(200).json({message:"User deleted successfully"})
    } catch(err) { next(err) }
})

//search user by email
userAPP.get("/search", verifyToken(), async(req,res,next)=>{
    try {
        const { email } = req.query
        if(!email) return res.status(400).json({message:"Email query parameter is required"})
        
        // Use regex for case-insensitive partial match or exact match
        const users = await userModel.find({ email: { $regex: new RegExp(email, 'i') } })
            .select("_id firstName lastName email avatarUrl")
            .limit(5)
            
        res.status(200).json({message:"Users found",payload:users})
    } catch(err) { next(err) }
})

