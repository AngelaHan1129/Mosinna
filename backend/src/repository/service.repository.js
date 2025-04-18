import { Service } from '../db/service'
import { ServiceStatusEnum } from '../enum/service-status.enum'

export class ServiceRepository {
    /**
     * @typedef {Object} RegisterServiceInput
     * @property {string} host
     * @property {string} name
     *
     * @param {RegisterServiceInput} payload
     */
    async registerService(payload) {
        return await Service.create({
            name: payload.name,
            host: payload.host,
            status: ServiceStatusEnum.不可用,
        })
    }

    async getServices() {
        return (await Service.findAll()).map((x) => x.dataValues)
    }

    /**
     *
     * @returns {Promise<import("../db/service").Service[]>}
     */
    async getAllAvaliableServices() {
        return (
            await Service.findAll({
                where: { status: ServiceStatusEnum.可用 },
            })
        ).map((x) => x.dataValues)
    }
}

export default new ServiceRepository()
