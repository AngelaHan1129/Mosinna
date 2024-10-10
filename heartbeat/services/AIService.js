import axios from "axios";
import AIRepository from "../repository/AIRepository.js";
import { ServiceStatusEnum } from "./ServiceStatusEnum.js";

export class AIService {
  aiRepository;
  HeartbeatId;

  constructor(aiRepository) {
    this.aiRepository = aiRepository;
  }

  async heartbeat() {
    const services = await this.aiRepository.getServices();

    // await Promise.all(services.map)

    for await (const service of services) {
      console.log("heartbeat...");
      console.log(`service name: ${service.name}`);
      console.log(`service host: ${service.host}`);
      console.log("\n");
      axios
        .get(service.host + `/api/healthy`)
        .then(() => {
          console.log(`ping ${service.name} successfully!`);
          if (service.status === ServiceStatusEnum.可用) return;
          this.aiRepository.changeStatus(service.name, ServiceStatusEnum.可用);
        })
        .catch(() => {
          console.log(`ping ${service.name} error!`);
          if (service.status === ServiceStatusEnum.不可用) return;
          this.aiRepository.changeStatus(
            service.name,
            ServiceStatusEnum.不可用
          );
        });
    }
  }

  startHeartbeat(milliseconds) {
    if (this.HeartbeatId) return;
    this.HeartbeatId = setInterval(async () => {
      await this.heartbeat();
    }, Number(milliseconds));
  }
}

export default AIService;
