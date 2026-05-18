import express from 'express'
import { listModel, boardModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const listAPP = express.Router()

// to create list
listAPP.post('/', verifyToken(), async(req,res,next)=>{
    try {
        const newList = req.body
        newList.createdBy = req.user.id
        const newListDoc = await listModel.create(newList)
        // push list into the board's lists array
        await boardModel.findByIdAndUpdate(newList.board, { $push: { lists: newListDoc._id } })
        res.status(201).json({message:"list created",payload:newListDoc})
    } catch(err) { next(err) }
})

// Get all lists in board
listAPP.get("/", verifyToken(), async (req, res, next) => {
    try {
        const { board } = req.query
        const lists = await listModel.find({ board, archived: false }).sort({ position: 1 })
        res.status(200).json({message: "Lists fetched successfully",payload:lists})
    } catch(err) { next(err) }
})

// Get list by ID
listAPP.get("/:id", verifyToken(), async (req, res, next) => {
    try {
        const { id } = req.params
        const list = await listModel.findById(id).populate("cards")
        if (!list) return res.status(404).json({ message: "List not found" })
        res.status(200).json({ message: "List fetched successfully",payload:list })
    } catch(err) { next(err) }
})

// Update list title
listAPP.put("/:id", verifyToken(), async (req, res, next) => {
    try {
        const { id } = req.params
        const { title } = req.body
        const updateList = await listModel.findByIdAndUpdate(id,{ title },{ new: true })
        if (!updateList) return res.status(404).json({ message: "List not found" })
        res.status(200).json({message: "List updated successfully",payload:updateList})
    } catch(err) { next(err) }
})

// Reorder list
listAPP.put("/:id/reorder", verifyToken(), async (req, res, next) => {
    try {
        const { id } = req.params
        const { position } = req.body
        const reorderList = await listModel.findByIdAndUpdate(id,{ position }, { new: true })
        if (!reorderList) return res.status(404).json({ message: "List not found"})
        res.status(200).json({message: "List reordered successfully", payload:reorderList})
    } catch(err) { next(err) }
})

// Archive list
listAPP.put("/:id/archive", verifyToken(), async (req, res, next) => {
    try {
        const { id } = req.params
        const archiveList = await listModel.findByIdAndUpdate(id, { archived: true }, { new: true })
        if (!archiveList) return res.status(404).json({ message: "List not found" })
        res.status(200).json({ message: "List archived successfully", payload: archiveList })
    } catch(err) { next(err) }
})

// Unarchive list
listAPP.put("/:id/unarchive", verifyToken(), async (req, res, next) => {
    try {
        const { id } = req.params
        const unarchiveList = await listModel.findByIdAndUpdate(id, { archived: false }, { new: true })
        if (!unarchiveList) return res.status(404).json({ message: "List not found" })
        res.status(200).json({ message: "List unarchived successfully", payload: unarchiveList })
    } catch(err) { next(err) }
})

// Delete list
listAPP.delete("/:id", verifyToken(), async (req, res, next) => {
    try {
        const { id } = req.params
        const deleteList = await listModel.findByIdAndDelete(id)
        if (!deleteList) return res.status(404).json({ message: "List not found" })
        res.status(200).json({message: "List deleted successfully"})
    } catch(err) { next(err) }
})