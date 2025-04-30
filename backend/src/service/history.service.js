import { Service } from '../db/service'
import { Video } from '../db/video'

export class HistoryService {
    /**
     * @type {import('../repository/checkResult.repository').default}
     */
    checkResultRepository

    constructor(checkResultRepository) {
        this.checkResultRepository = checkResultRepository
    }

    /**
     *
     * @typedef {Object} CheckHistory
     * @property {string} result
     * @property {string} details
     * @property {string} checked_at
     * @property {string} updated_at
     * @property {Service} service
     * @property {Video} video
     *
     * @returns {Promise<CheckHistory[]>}
     */
    async getCheckHistory() {
        return await this.checkResultRepository.getCheckHistory()
    }

    /**
     * @param {string} videoId
     * @returns {Promise<CheckHistory[]>}
     */
    async getCheckHistoryByVideoId(videoId) {
        return await this.checkResultRepository.getCheckHistoryByVideoId(
            videoId,
        )
    }
}

export default new HistoryService()
