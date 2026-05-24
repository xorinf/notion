import express from 'express'
import { workspaceModel, userModel, boardModel, pageModel, activityModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const workspaceAPP = express.Router()

//create workspace
workspaceAPP.post("/", verifyToken(), async(req,res,next)=>{
    try {
        const {name,description,icon}=req.body
        const userId=req.user.id
        const workspace=await workspaceModel.create({
            name,
            description,
            icon,
            createdBy:userId,
            members: [{ user: userId, role: "ADMIN" }]
        })
        await userModel.findByIdAndUpdate(userId, { $push: { workspaces: workspace._id } })
        res.status(201).json({message:"Workspace created successfully",payload:workspace})
    } catch(err) { next(err) }
})

//get all workspaces
workspaceAPP.get("/", verifyToken(), async(req,res,next)=>{
    try {
        const userId=req.user.id
        // user is part of the workspace either as creator or member
        const workspaces=await workspaceModel.find({ $or: [{ createdBy: userId }, { "members.user": userId }] })
        res.status(200).json({message:"All workspaces fetched successfully",payload:workspaces})
    } catch(err) { next(err) }
})

//get workspace by id
workspaceAPP.get("/:id", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const workspace=await workspaceModel.findById(id).populate("members.user", "_id firstName lastName email avatarUrl")
        if (!workspace) return res.status(404).json({ message: "Workspace not found" })
        res.status(200).json({message:"Workspace fetched successfully",payload:workspace})
    } catch(err) { next(err) }
})

//update workspace
workspaceAPP.put("/:id", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const {name,description,icon}=req.body
        const workspace=await workspaceModel.findByIdAndUpdate(id,{name,description,icon}, {new:true})
        res.status(200).json({message:"Workspace updated successfully",payload:workspace})
    } catch(err) { next(err) }
})

//delete workspace
workspaceAPP.delete("/:id", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const workspace=await workspaceModel.findByIdAndDelete(id)
        if (!workspace) return res.status(404).json({ message: "Workspace not found" })
        
        await userModel.updateMany({ workspaces: id }, { $pull: { workspaces: id } })
        await boardModel.deleteMany({workspace:id})
        await pageModel.deleteMany({workspace:id})
        
        res.status(200).json({message:"Workspace deleted successfully",payload:workspace})
    } catch(err) { next(err) }
})

//add member to workspace
workspaceAPP.post("/:id/members", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const {userId, role}=req.body
        const workspace=await workspaceModel.findByIdAndUpdate(id,{$push:{members:{user:userId, role: role || 'VIEW'}}})
        await userModel.findByIdAndUpdate(userId, { $push: { workspaces: id } })
        res.status(200).json({message:"Member added successfully",payload:workspace})
    } catch(err) { next(err) }
})

//remove member from workspace
workspaceAPP.delete("/:id/members/:userId", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const {userId}=req.params
        const workspace=await workspaceModel.findByIdAndUpdate(id,{$pull:{members:{user:userId}}})
        await userModel.findByIdAndUpdate(userId, { $pull: { workspaces: id } })
        res.status(200).json({message:"Member removed successfully",payload:workspace})
    } catch(err) { next(err) }
})

//get workspace members
workspaceAPP.get("/:id/members", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const workspace=await workspaceModel.findById(id).populate("members.user","_id firstName lastName email avatarUrl")
        if(!workspace) return res.status(404).json({message: "Workspace not found"})
        res.status(200).json({message:"Workspace members fetched successfully",payload:workspace.members})
    } catch(err) { next(err) }
})

//update member role
workspaceAPP.put("/:id/members/:userId", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const {userId}=req.params
        const {role}=req.body
        const workspace=await workspaceModel.findOneAndUpdate(
            { _id: id, "members.user": userId },
            { $set: { "members.$.role": role } },
            { new: true }
        )
        res.status(200).json({message:"Member role updated successfully",payload:workspace})
    } catch(err) { next(err) }
})

//get workspace activity
workspaceAPP.get("/:id/activity", verifyToken(), async(req,res,next)=>{
    try {
        const {id}=req.params
        const activities=await activityModel
            .find({ workspace: id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("performedBy", "firstName lastName avatarUrl email")
        res.status(200).json({message:"Workspace activity fetched successfully",payload:activities})
    } catch(err) { next(err) }
})