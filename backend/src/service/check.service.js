import axios from 'axios'
import { EXTERNAL_SERVICE_NAME } from '../enum/external-service-name.enum'

export class CheckService {
    /**
     * @type {import('../repository/service.repository').default}
     */
    serviceRepository
    /**
     * @type {import('../repository/checkResult.repository').default}
     */
    checkResultRepository
    constructor(serviceRepository, checkResultRepository) {
        this.serviceRepository = serviceRepository
        this.checkResultRepository = checkResultRepository
    }

    /**
     *
     * @param {import("express").Response} res
     * @param {string} type
     * @param {*} data
     * @returns
     */
    sendSSE(res, type, data) {
        res.write(
            `data: ${JSON.stringify({
                type,
                data: data,
            })} \n\n`,
        )
        console.log(
            `SSE: ${type} - ${JSON.stringify(data)} - ${new Date().toISOString()}`,
        )
        // res.flush()
    }

    /**
     *
     * @param {import("express").Response} res
     * @param {{videoData: string}} input
     * @returns
     */
    async proxyToCheckServiceSSE(res, input) {
        const { videoData } = input
        // 找出所有可用的 Services
        const services = (
            await this.serviceRepository.getAllAvaliableServices()
        ).filter((x) => x.name !== EXTERNAL_SERVICE_NAME.URL2BASE64)

        if (!services.length) {
            this.sendSSE(res, 'ValidationError', {
                message: '沒有可用的檢測服務',
            })
            return
        }
        this.sendSSE(res, 'VideoUploaded', {
            checkServices: services.map((x) => ({
                id: x.id,
                name: x.name,
            })),
        })
        // 透過 axios 呼叫檢測服務
        const results = await Promise.all(
            services.map(async (service) => {
                try {
                    const endPoint = `${service.host}/api/check`
                    let responseData

                    // Use simulation mode if SSE_TEST is enabled
                    if (
                        process.env.SSE_TEST === 'true' &&
                        process.env.NODE_ENV !== 'test'
                    ) {
                        // throw new Error('SSE_TEST is enabled')

                        // Default simulation: 5-10 seconds
                        const mockResponseTime =
                            5 + Math.floor(Math.random() * 6)
                        // Simulate processing delay
                        await new Promise((resolve) =>
                            setTimeout(resolve, mockResponseTime * 1000),
                        )
                        // Create mock response
                        responseData = {
                            result: Math.random() > 0.5 ? '可能為 ai' : 'pass',
                            details: `Checked in ${mockResponseTime} seconds`,
                        }
                    } else {
                        // Call actual service API
                        const response = await axios.post(endPoint, {
                            videoData,
                        })
                        responseData = response.data
                        console.log(new Date())
                        console.log(responseData)
                    }

                    // Prepare result payload
                    const payload = {
                        id: service.id,
                        name: service.name,
                        result: mapResultToPassOrRisky(responseData?.result),
                        details: responseData?.details || undefined,
                    }

                    // Send event to client
                    this.sendSSE(res, 'VideoCheckFinished', payload)
                    return payload
                } catch (error) {
                    console.log(error.message)
                    const payload = {
                        id: service.id,
                        name: service.name,
                        result: 'error',
                        details: {
                            message: `檢測服務異常: 可能原因(影片過長/過短；沒有聲音；沒有畫面；服務異常等)`,
                        },
                    }
                    this.sendSSE(res, 'VideoCheckFinished', payload)
                    return payload
                }
            }),
        )
        this.sendSSE(res, 'AllCheckFinished', {
            message: '所有檢測服務已完成',
        })

        // 彙整所有檢測結果並回傳
        return results.filter((x) => x !== null)
    }

    /**
     * @typedef {Object} checkResult
     * @property {string} service_id
     * @property {string} result
     * @property {string} details
     *
     * @param {{checkResult: checkResult[], video_id: string, source: string, ip: string }} result
     */
    async saveCheckResult(result) {
        return await this.checkResultRepository.saveCheckResult(result)
    }
}

/**
 *
 * @param {String} message
 * @returns {'risky' | 'pass'}
 */
function mapResultToPassOrRisky(message) {
    const msg = message.toLowerCase()
    const resultMap = new Map([
        [true, 'risky'],
        [false, 'pass'],
    ])
    const isRisky =
        msg.includes('可能為 ai') ||
        msg.includes('可能涉及詐騙') ||
        msg.includes('fake')
    return resultMap.get(isRisky)
}

export default new CheckService()
