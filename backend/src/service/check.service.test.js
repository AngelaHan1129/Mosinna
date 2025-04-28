import { CheckService } from './check.service'
import { describe, expect, it, jest } from '@jest/globals'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import * as matchers from 'jest-extended'
import { CheckResultRepository } from '../repository/checkResult.repository'
expect.extend(matchers)

class FakeServiceRepository {
    async getAllAvaliableServices() {
        return [
            {
                id: '1',
                name: 'AI 音訊檢測服務',
                host: 'http://192.168.1.123:8081',
            },
            {
                id: '2',
                name: '文字詐騙檢測服務',
                host: 'http://192.168.1.123:8083',
            },
        ]
    }
}

describe(`Unit test for CheckService`, () => {
    it(`
        轉至檢測服務

        given
            上傳一個影片{ videoData }
        when
            從服務註冊表找所有可檢測的服務
            呼叫可用的服務檢測並得到檢測結果
        then
            匯出所有檢測結果，包括
            [
                {
                    服務id
                    服務名稱
                    檢測結果
                    詳細描述
                },...
            ]
    `, async () => {
        // given
        const payload = {
            videoData:
                'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr9tZGF0AAACoAYF//+c3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDEyNSAtIEguMjY0L01QRUctNCBBVkMgY29kZWMgLSBDb3B5bGVmdCAyMDAzLTIwMTIgLSBodHRwOi8vd3d3LnZpZGVvbGFuLm9yZy94MjY0Lmh0bWwgLSBvcHRpb25zOiBjYWJhYz0xIHJlZj0zIGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDM6MHgxMTMgbWU9aGV4IHN1Ym1lPTcgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGN0PTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz02IGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MyBiX3B5cmFtaWQ9MiBiX2FkYXB0PTEgYl9iaWFzPTAgZGlyZWN0PTEgd2VpZ2h0Yj0xIG9wZW5fZ29wPTAgd2VpZ2h0cD0yIGtleWludD0yNTAga2V5aW50X21pbj0yNCBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTQwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAAA9liIQAV/0TAAYdeBTXzg8AAALvbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAACoAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAhl0cmFrAAAAXHRraGQAAAAPAAAAAAAAAAAAAAABAAAAAAAAACoAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAgAAAAIAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAAqAAAAAAABAAAAAAGRbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAAAgBVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABPG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAPxzdGJsAAAAmHN0c2QAAAAAAAAAAQAAAIhhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAgACABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAMmF2Y0MBZAAK/+EAGWdkAAqs2V+WXAWyAAADAAIAAAMAYB4kSywBAAZo6+PLIsAAAAAYc3R0cwAAAAAAAAABAAAAAQAAAgAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAACtwAAAAEAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTQuNjMuMTA0',
        }

        const repository = new FakeServiceRepository()
        const service = new CheckService(repository)
        const mockAxios = new MockAdapter(axios)
        const avaliableServices = await repository.getAllAvaliableServices()
        jest.spyOn(repository, 'getAllAvaliableServices')
        jest.spyOn(axios, 'post')
        mockAxios.onPost(`${avaliableServices[0].host}/api/check`).reply(200, {
            result: '此音訊可能為 AI',
        })
        mockAxios.onPost(`${avaliableServices[1].host}/api/check`).reply(200, {
            result: '該文本無明顯詐騙風險',
            details: {
                text: '影片文字',
            },
        })
        const mockRes = {
            write: jest.fn(),
        }
        // when
        const result = await service.proxyToCheckServiceSSE(mockRes, payload)

        // then
        expect(repository.getAllAvaliableServices).toHaveBeenCalledTimes(1)
        expect(axios.post).toHaveBeenCalledTimes(2)
        expect(axios.post).toHaveBeenCalledWith(expect.any(String), payload)
        result.forEach((item) => {
            expect(item.id).toBeOneOf(avaliableServices.map((x) => x.id))
            expect(item.name).toBeOneOf(avaliableServices.map((x) => x.name))
            if (item.name === avaliableServices[0].name) {
                expect(item.result).toBe('risky')
            } else {
                expect(item.result).toBe('pass')
                expect(item?.details).toEqual({
                    text: expect.any(String),
                })
            }
        })
    })

    it(`
        如果可用的檢測服務為 0，則擲出錯誤    
    `, async () => {
        const payload = {
            videoData:
                'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr9tZGF0AAACoAYF//+c3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDEyNSAtIEguMjY0L01QRUctNCBBVkMgY29kZWMgLSBDb3B5bGVmdCAyMDAzLTIwMTIgLSBodHRwOi8vd3d3LnZpZGVvbGFuLm9yZy94MjY0Lmh0bWwgLSBvcHRpb25zOiBjYWJhYz0xIHJlZj0zIGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDM6MHgxMTMgbWU9aGV4IHN1Ym1lPTcgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGN0PTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz02IGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MyBiX3B5cmFtaWQ9MiBiX2FkYXB0PTEgYl9iaWFzPTAgZGlyZWN0PTEgd2VpZ2h0Yj0xIG9wZW5fZ29wPTAgd2VpZ2h0cD0yIGtleWludD0yNTAga2V5aW50X21pbj0yNCBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTQwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAAA9liIQAV/0TAAYdeBTXzg8AAALvbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAACoAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAhl0cmFrAAAAXHRraGQAAAAPAAAAAAAAAAAAAAABAAAAAAAAACoAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAgAAAAIAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAAqAAAAAAABAAAAAAGRbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAAAgBVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABPG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAPxzdGJsAAAAmHN0c2QAAAAAAAAAAQAAAIhhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAgACABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAMmF2Y0MBZAAK/+EAGWdkAAqs2V+WXAWyAAADAAIAAAMAYB4kSywBAAZo6+PLIsAAAAAYc3R0cwAAAAAAAAABAAAAAQAAAgAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAACtwAAAAEAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTQuNjMuMTA0',
        }

        const repository = new FakeServiceRepository()
        const service = new CheckService(repository)
        jest.spyOn(repository, 'getAllAvaliableServices').mockResolvedValue([])
        const mockRes = {
            write: jest.fn(),
        }

        // when
        await service.proxyToCheckServiceSSE(mockRes, payload)

        // then
        expect(mockRes.write).toHaveBeenCalledWith(
            `data: ${JSON.stringify({
                type: 'ValidationError',
                data: {
                    message: '沒有可用的檢測服務',
                },
            })} \n\n`,
        )
    })

    it(`
        檢測結果儲存
        given
            檢測結果已產生
            video_id,
            [
                {
                    服務id
                    檢測結果
                    詳細描述
                },...
            ]
        when
            儲存歷史紀錄(repository)
        then
            儲存成功
    `, async () => {
        //given
        const videoId = 'AAAAAAAAAAAAAAA'
        const checkResult = [
            {
                service_id: '1',
                result: 'pass',
                details: '',
            },
            {
                service_id: '2',
                result: 'risky',
                details: '',
            },
            {
                service_id: '3',
                result: 'pass',
                details: '',
            },
        ]
        const checkResultRepository = new CheckResultRepository()
        const checkService = new CheckService(undefined, checkResultRepository)
        //when
        jest.spyOn(
            checkResultRepository,
            'saveCheckResult',
        ).mockImplementation()
        await checkService.saveCheckResult({
            videoId,
            checkResult,
        })
        //then
        expect(checkResultRepository.saveCheckResult).toBeCalledWith({
            videoId,
            checkResult,
        })
    })
})
