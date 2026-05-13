import express from 'express'
import { cardModel, pageModel, boardModel, userModel } from '../models/mainModels.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const searchAPP = express.Router()

// universal search
searchAPP.get('/', verifyToken(), async (req, res, next) => {
    try {
        const { q } = req.query

        if (!q) {
            return res.status(400).json({
                message: "Please enter a search query"
            })
        }

        const searchRegex = new RegExp(q, 'i')

        const [cards, pages, boards, user] = await Promise.all([
            cardModel.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex }
                ],
                archived: false
            }),

            pageModel.find({
                $or: [
                    { title: searchRegex },
                    { content: searchRegex }
                ],
                isArchived: false
            }),

            boardModel.find({
                title: searchRegex,
                archived: false
            }),

            userModel.findById(req.user.id)
        ])
        // const user = await userModel.findById(req.user.id).populate("workspaces", "firstName lastName ")

        const workspaces = user.workspaces

        const payload = [
            ...cards.map(card => ({
                type: "card",
                id: card._id,
                link: `/card/${card._id}`,
                data: card
            })),

            ...pages.map(page => ({
                type: "page",
                id: page._id,
                link: `/page/${page._id}`,
                data: page
            })),

            ...boards.map(board => ({
                type: "board",
                id: board._id,
                link: `/board/${board._id}`,
                data: board
            })),

            ...workspaces.map(board => ({

            }))
        ]

        res.status(200).json({
            success: true,
            payload
        })

    } catch (err) {
        next(err)
    }
})