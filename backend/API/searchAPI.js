import express from 'express'
import { cardModel, pageModel, boardModel, userModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const searchAPP = express.Router()

// universal search
searchAPP.get('/', verifyToken(), async (req, res, next) => {
    try {
        const { q, workspace, type } = req.query

        if (!q) {
            return res.status(400).json({
                message: "Please enter a search query"
            })
        }

        const searchRegex = new RegExp(q, 'i')
        const results = []

        // Build workspace filter for boards
        const boardFilter = { title: searchRegex, archived: false }
        if (workspace) boardFilter.workspace = workspace

        // Search Boards (unless type filter excludes them)
        if (!type || type === 'Board') {
            const boards = await boardModel.find(boardFilter)
            boards.forEach(board => {
                results.push({
                    _id: board._id,
                    type: "Board",
                    title: board.title,
                    description: board.description || '',
                })
            })
        }

        // Search Pages
        if (!type || type === 'Page') {
            const pageFilter = {
                $or: [
                    { title: searchRegex },
                    { content: searchRegex }
                ],
                isArchived: false
            }
            if (workspace) pageFilter.workspace = workspace

            const pages = await pageModel.find(pageFilter)
            pages.forEach(page => {
                results.push({
                    _id: page._id,
                    type: "Page",
                    title: page.title,
                    description: page.content ? page.content.substring(0, 150) : '',
                })
            })
        }

        // Search Cards
        if (!type || type === 'Card') {
            const cardFilter = {
                $or: [
                    { title: searchRegex },
                    { description: searchRegex }
                ],
                archived: false
            }

            // If workspace filter, find boards in that workspace first
            if (workspace) {
                const wsBoards = await boardModel.find({ workspace, archived: false }).select('_id')
                const boardIds = wsBoards.map(b => b._id)
                cardFilter.board = { $in: boardIds }
            }

            const cards = await cardModel.find(cardFilter).populate('board', 'title')
            cards.forEach(card => {
                results.push({
                    _id: card._id,
                    type: "Card",
                    title: card.title,
                    description: card.description || '',
                    board: card.board?._id,
                    boardTitle: card.board?.title,
                })
            })
        }

        res.status(200).json({
            success: true,
            message: "Search results",
            payload: results
        })

    } catch (err) {
        next(err)
    }
})