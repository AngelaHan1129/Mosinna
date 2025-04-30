import { CheckResultRepository } from '../repository/checkResult.repository'
import { ServiceRepository } from '../repository/service.repository'
import { CheckService } from '../service/check.service'
import { VideoService } from '../service/video.service'
import { apiFormatter } from '../utils/api-formatter'

export class CheckController {
    /**
     * @type {import('../service/check.service').default;}
     */
    checkService
    /**
     * @type {import('../service/video.service').default;}
     */
    videoService

    constructor() {
        this.checkService = new CheckService(
            new ServiceRepository(),
            new CheckResultRepository(),
        )
        this.videoService = new VideoService()
    }
    /**
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    async uploadVideo(req, res) {
        try {
            req.on('close', () => {
                console.log('Client disconnected')
            })
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
            })
            // proxy to ai detection services
            const { videoData } = req.body
            const result = await this.checkService.proxyToCheckServiceSSE(res, {
                videoData,
            })

            // store video
            const video = await this.videoService.saveVideo(
                videoData,
                '使用者上傳',
            )

            // store check result
            const saved = await this.checkService.saveCheckResult({
                video_id: video?.id,
                source: '使用者上傳',
                ip: req.ip,
                checkResult: result.map((x) => {
                    return {
                        service_id: x.id,
                        details: x?.details,
                        result: x.result,
                    }
                }),
            })
            this.checkService.sendSSE(res, 'CheckResultSaved', {
                checkResultId: saved[0].video_id,
            })
            res.end()
        } catch (error) {
            console.error(error)
            return res.status(500).json(apiFormatter(null, 500, '伺服器錯誤'))
        }
    }

    /**
     * @param {import("express").Request<unknown, unknown, {url: string}>} req
     * @param {import("express").Response} res
     */
    async uploadUrl(req, res) {
        try {
            req.on('close', () => {
                console.log('Client disconnected')
            })
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
            })
            const { url } = req.body
            if (
                !url ||
                (!url.startsWith('https://www.youtube.com/') &&
                    !url.startsWith('https://youtube.com/') &&
                    !url.startsWith('https://youtu.be/'))
            ) {
                throw new Error('只接受 YouTube 影片連結')
            }

            const videoData = await this.videoService.getVideoData(url)
            const result = await this.checkService.proxyToCheckServiceSSE(res, {
                videoData,
            })

            // store video
            const video = await this.videoService.saveVideo(
                videoData,
                'Youtube',
                url,
            )

            // store check result
            const saved = await this.checkService.saveCheckResult({
                video_id: video?.id,
                source: 'Youtube',
                ip: req.ip,
                checkResult: result.map((x) => {
                    return {
                        service_id: x.id,
                        details: x?.details,
                        result: x.result,
                    }
                }),
            })

            this.checkService.sendSSE(res, 'CheckResultSaved', {
                checkResultId: saved[0].video_id,
            })
            res.end()
        } catch (error) {
            console.error(error)
            if (
                error.message === '只接受 YouTube 影片連結' ||
                error.message === '檔案過大或此影片已下架'
            ) {
                return this.checkService.sendSSE(res, 'ValidationError', {
                    message: error.message,
                })
            }
            return res.status(500).json(apiFormatter(null, 500, '伺服器錯誤'))
        }
    }
}

export default new CheckController()
