import express from "express"
import { inviteModel, workspaceModel, userModel, notificationModel } from "../models/mainModels.js"
import { verifyToken } from '../middleware/verifyToken.js'
import crypto from "crypto"

export const inviteAPP = express.Router()

//send invite
inviteAPP.post("/", verifyToken(), async(req,res,next)=>{
    try {
        const userId = req.user.id
        const {email,role,workspace} = req.body
        
        // Generate an invite token
        const inviteToken = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        
        const invite = await inviteModel.create({
            email,
            role,
            workspace,
            invitedBy: userId,
            inviteToken,
            expiresAt
        })

        // Try to find the user with the invited email in our system
        const recipientUser = await userModel.findOne({ email: email.toLowerCase() })
        if (recipientUser) {
            const inviter = await userModel.findById(userId)
            const workspaceObj = await workspaceModel.findById(workspace)
            const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : "Someone"
            const workspaceName = workspaceObj ? workspaceObj.name : "a workspace"

            await notificationModel.create({
                recipient: recipientUser._id,
                type: "INVITE",
                title: `${inviterName} invited you to join the workspace "${workspaceName}"`,
                message: `Click to accept or decline this invite.`,
                link: `/dashboard/workspace/invite/${inviteToken}`,
                relatedEntity: {
                    entityType: "Workspace",
                    entityId: workspace
                }
            })
        }

        // Emit real-time update
        const io = req.app.get("io")
        if (io) {
            io.to(`workspace:${workspaceId}`).emit("workspace-updated")
        }

        res.status(201).json({message:"Invite sent successfully",payload:invite})
    } catch(err) { next(err) }
})

//get all pending invites for workspace
inviteAPP.get("/", verifyToken(), async(req,res,next)=>{
    try {
        const workspaceId = req.query.workspace
        if(!workspaceId) return res.status(400).json({message:"workspace query param required"})
        
        const invites = await inviteModel.find({workspace:workspaceId, status: "PENDING"})
        res.status(200).json({message:"Invites fetched",payload:invites})
    } catch(err) { next(err) }
})

//accept invite via token
inviteAPP.post("/accept/:inviteToken", verifyToken(), async(req,res,next)=>{
    try {
        const inviteToken = req.params.inviteToken
        const invite = await inviteModel.findOne({inviteToken})
        
        if(!invite) return res.status(404).json({message:"Invite not found"})
        if(invite.expiresAt < Date.now()) return res.status(400).json({message:"Invite has expired"})
        if(invite.status !== "PENDING") return res.status(400).json({message:"Invite is no longer pending"})
        
        invite.status = "ACCEPTED"
        await invite.save()

        // Link the user to the workspace
        const workspaceId = invite.workspace
        const userId = req.user.id

        await workspaceModel.findByIdAndUpdate(workspaceId, {
            $addToSet: { members: { user: userId, role: invite.role || "MEMBER" } }
        })
        await userModel.findByIdAndUpdate(userId, {
            $addToSet: { workspaces: workspaceId }
        })
        
        // Emit real-time update
        const io = req.app.get("io")
        if (io) {
            io.to(`workspace:${workspaceId}`).emit("workspace-updated")
        }

        res.status(200).json({message:"Invite accepted successfully",payload:invite})
    } catch(err) { next(err) }
})

//decline invite via token
inviteAPP.post("/decline/:inviteToken", verifyToken(), async(req,res,next)=>{
    try {
        const inviteToken = req.params.inviteToken
        const invite = await inviteModel.findOne({inviteToken})
        
        if(!invite) return res.status(404).json({message:"Invite not found"})
        if(invite.expiresAt < Date.now()) return res.status(400).json({message:"Invite has expired"})
        if(invite.status !== "PENDING") return res.status(400).json({message:"Invite is no longer pending"})
        
        invite.status = "DECLINED"
        await invite.save()
        
        res.status(200).json({message:"Invite declined successfully",payload:invite})
    } catch(err) { next(err) }
})

//resend invite
inviteAPP.post("/:id/resend", verifyToken(), async(req,res,next)=>{
    try {
        const inviteId = req.params.id
        const invite = await inviteModel.findById(inviteId)
        
        if(!invite) return res.status(404).json({message:"Invite not found"})
        if(invite.status === "ACCEPTED" || invite.status === "DECLINED") {
            return res.status(400).json({message:"Cannot resend an accepted or declined invite."})
        }
        
        invite.inviteToken = crypto.randomBytes(32).toString("hex")
        invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        invite.status = "PENDING"
        await invite.save()
        
        res.status(200).json({message:"Invite resent successfully",payload:invite})
    } catch(err) { next(err) }
})

//cancel/delete invite
inviteAPP.delete("/:id", verifyToken(), async(req,res,next)=>{
    try {
        const inviteId = req.params.id
        const invite = await inviteModel.findByIdAndDelete(inviteId)
        if(!invite) return res.status(404).json({message:"Invite not found"})
        
        // Emit real-time update
        const io = req.app.get("io")
        if (io) {
            io.to(`workspace:${invite.workspace}`).emit("workspace-updated")
        }

        res.status(200).json({message:"Invite deleted successfully"})
    } catch(err) { next(err) }
})

//get invite details by token
inviteAPP.get("/details/:inviteToken", verifyToken(), async(req,res,next)=>{
    try {
        const inviteToken = req.params.inviteToken
        const invite = await inviteModel.findOne({inviteToken})
            .populate("workspace", "name description icon")
            .populate("invitedBy", "firstName lastName email avatarUrl")
        if(!invite) return res.status(404).json({message:"Invite not found"})
        res.status(200).json({message:"Invite details fetched",payload:invite})
    } catch(err) { next(err) }
})