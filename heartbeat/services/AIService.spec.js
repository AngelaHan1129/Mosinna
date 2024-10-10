import { expect, jest } from "@jest/globals";
import axios from "axios";
import { AIService } from "./AIService.js";
import MockAdapter from 'axios-mock-adapter';
import { ServiceStatusEnum } from "./ServiceStatusEnum.js";

class FakeRepository {
  services = [
    {
      name: "AI 音訊檢測服務",
      host: "http://192.168.1.123",
      status: ServiceStatusEnum.不可用
    },
    {
      name: "文字詐騙檢測服務",
      host: "http://192.168.1.124",
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

describe("心跳檢測", () => {
  it(`
        Given (前提)
            服務註冊表中有 2 個服務
            分別為 
            AI 音訊檢測服務: 
            1. 服務端點: http://192.168.1.123/api
            2. 目前狀態: 不可用
            文字詐騙檢測服務:
            1. 服務端點: http://192.168.1.124/api
            2. 目前狀態: 不可用
        When (做)
            服務心跳檢測(打API)
            AI 音訊檢測服務可用
            文字詐騙檢測不可用
        Then (後置條件、預期結果)
            服務註冊表會變成怎樣？
            AI 音訊檢測服務
            目前狀態: 可用
            文字詐騙檢測服務
            目前狀態: 不可用 
    `, async () => {
    // given
    const repository = new FakeRepository();
    const aiService = new AIService(repository);
    const mockAxios = new MockAdapter(axios);
    const services = repository.getServices()
    mockAxios.onGet(`${services[0].host}/api/health`).reply(200)
    mockAxios.onGet(`${services[1].host}/api/health`).reply(404)

    // when
    await aiService.heartbeat();

    // then
    const afterService = repository.getServices();
    expect(afterService[0].status).toBe(ServiceStatusEnum.可用);
    expect(afterService[1].status).toBe(ServiceStatusEnum.不可用);
  });
});
