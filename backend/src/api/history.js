import express from 'express'
import historyController from '../controller/history.controller'

const router = express.Router()

router.get('', historyController.getCheckHistory.bind(historyController))

router.get(
    '/:videoId',
    historyController.getCheckHistoryByVideoId.bind(historyController),
)

export default router
