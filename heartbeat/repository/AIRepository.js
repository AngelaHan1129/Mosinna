import { ServiceStatusEnum } from "../services/ServiceStatusEnum.js";

class AIRepository {
    
  services = [
    {
      name: "文字詐騙檢測服務",
      host: "http://127.0.0.1:3000",
      status: ServiceStatusEnum.不可用,
    },
  ];

  getServices() {
    return this.services;
  }

  changeStatus(name, status) {
    const service = this.services.find((s) => {
      return s.name === name;
    });
    service.status = status;
  }
}
export default AIRepository;
