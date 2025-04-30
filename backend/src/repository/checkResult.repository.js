import { CheckResult } from '../db/checkResult'
import { Service } from '../db/service'
import { Video } from '../db/video'

export class CheckResultRepository {
    /**
     * @typedef {Object} checkResult
     * @property {string} service_id
     * @property {string} result
     * @property {Object} details
     *
     * @param {{checkResult: checkResult[], video_id: string }} result
     */
    async saveCheckResult(result) {
        return await CheckResult.bulkCreate(
            result.checkResult.map((x) => {
                return {
                    ...x,
                    video_id: result.video_id,
                    source: result.source,
                    ip: result.ip,
                    details: JSON.stringify(x.details),
                }
            }),
        )
    }

    /**
     *
     * @returns {Promise<CheckResult[]>}
     */
    async getCheckHistory() {
        return (
            await CheckResult.findAll({
                include: [
                    {
                        model: Video,
                        as: 'video',
                    },
                    {
                        model: Service,
                        as: 'service',
                    },
                ],
                order: [['checked_at', 'DESC']],
                // limit: 150,
            })
        ).map((el) => el.get({ plain: true }))
    }

    /**
     * @param {string} videoId
     *
     * @returns {Promise<CheckResult[]>}
     */
    async getCheckHistoryByVideoId(videoId) {
        return (
            await CheckResult.findAll({
                where: {
                    video_id: videoId,
                },
                include: [
                    {
                        model: Video,
                        as: 'video',
                    },
                    {
                        model: Service,
                        as: 'service',
                    },
                ],
                order: [['checked_at', 'DESC']],
            }).catch((err) => {
                console.log('getCheckHistoryByVideoId error', err?.message)
                return []
            })
        ).map((el) => el.get({ plain: true }))
    }
}

export default new CheckResultRepository()
