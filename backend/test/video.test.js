import { expect, describe, it, beforeAll, beforeEach } from '@jest/globals'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import ServiceStatusEnum from '../src/enum/service-status.enum'
import { Service } from '../src/db/service'
import request from 'supertest'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import app from '../src/app'
import { EXTERNAL_SERVICE_NAME } from '../src/enum/external-service-name.enum'

let services = []
describe('檢測服務驗收測試', () => {
    beforeAll(async () => {
        services = await setupServices()
    })

    beforeEach(() => {
        if (!globalThis.window) {
            globalThis.window = {
                fetch: globalThis.fetch,
                setTimeout: globalThis.setTimeout,
                clearTimeout: globalThis.clearTimeout,
            }
        }
    })

    describe(`驗收測試 - 影片檢測API`, () => {
        it(`
        Given
            videoData: <使用者上傳的 dataURL>
            AI音訊檢測, 可用
            AI影片檢測, 不可用
            文字詐騙檢測, 可用
        When
            匿名使用者上傳了一部影片進行檢測

            透過可用的 host + /api/check 進行 POST API CALL<夾帶影片資料>
            e.g.
            POST http://192.168.1.123:8081
            POST http://192.168.1.123:8083
            {
            videoData: <dataURL>
            }
        Then
            預期得到每一項服務的檢測結果
            [
                {
                    name: 'AI音訊檢測',
                    result: 'risky',
                },
                {
                    name: '文字詐騙檢測',
                    result: 'pass',
                    details: {  
                        text: '影片文字'
                    },
                },
            ]
            檢測結果存到check_result資料表
        WHEN
            查詢本次檢測紀錄
        THEN
            影片連結
            各種檢測的檢測結果
    `, async () => {
            // given
            const videoData =
                'data:video/x-matroska;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr9tZGF0AAACoAYF//+c3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDEyNSAtIEguMjY0L01QRUctNCBBVkMgY29kZWMgLSBDb3B5bGVmdCAyMDAzLTIwMTIgLSBodHRwOi8vd3d3LnZpZGVvbGFuLm9yZy94MjY0Lmh0bWwgLSBvcHRpb25zOiBjYWJhYz0xIHJlZj0zIGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDM6MHgxMTMgbWU9aGV4IHN1Ym1lPTcgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGN0PTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz02IGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MyBiX3B5cmFtaWQ9MiBiX2FkYXB0PTEgYl9iaWFzPTAgZGlyZWN0PTEgd2VpZ2h0Yj0xIG9wZW5fZ29wPTAgd2VpZ2h0cD0yIGtleWludD0yNTAga2V5aW50X21pbj0yNCBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTQwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAAA9liIQAV/0TAAYdeBTXzg8AAALvbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAACoAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAhl0cmFrAAAAXHRraGQAAAAPAAAAAAAAAAAAAAABAAAAAAAAACoAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAgAAAAIAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAAqAAAAAAABAAAAAAGRbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAAAgBVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABPG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAPxzdGJsAAAAmHN0c2QAAAAAAAAAAQAAAIhhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAgACABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAMmF2Y0MBZAAK/+EAGWdkAAqs2V+WXAWyAAADAAIAAAMAYB4kSywBAAZo6+PLIsAAAAAYc3R0cwAAAAAAAAABAAAAAQAAAgAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAACtwAAAAEAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTQuNjMuMTA0'
            // when
            mockAxios(services)
            const { url } = request(app).get('/')

            // Use fetch-event-source to listen for SSE events
            const events = []

            // Start the SSE connection in a separate promise
            const ssePromise = new Promise((resolve) => {
                try {
                    fetchEventSource(`${url}api/check`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            videoData: videoData,
                        }),
                        openWhenHidden: true,
                        onmessage: (event) => {
                            const data = JSON.parse(event.data)
                            events.push(data)
                            // Once we receive final result, resolve the promise
                            if (data.type === 'AllCheckFinished') {
                                resolve(events)
                            }
                        },
                        onerror: (error) => {
                            return 99999
                        },
                    }).catch((error) => {
                        console.error('Error in fetchEventSource:', error)
                        resolve([])
                    })
                } catch (error) {
                    console.error('Error setting up SSE:', error)
                    resolve([])
                }
            })

            // Wait for SSE events to complete
            const receivedEvents = await ssePromise

            // Check the events received via SSE
            expect(receivedEvents.length).toBeGreaterThan(0)

            console.log('Received events:', receivedEvents)
            // Check if we received progress events and final result
            expect(
                receivedEvents.filter((event) => event.type === 'VideoUploaded')
                    .length,
            ).toBe(1)
            expect(
                receivedEvents.filter(
                    (event) => event.type === 'VideoCheckFinished',
                ).length,
            ).toBe(
                services.filter(
                    (x) =>
                        x.status === ServiceStatusEnum.可用 &&
                        x.name !== EXTERNAL_SERVICE_NAME.URL2BASE64,
                ).length,
            )
            expect(
                receivedEvents.filter(
                    (event) => event.type === 'AllCheckFinished',
                ).length,
            ).toBe(1)

            // Verify the check results
            const checkList = receivedEvents.filter(
                (event) => event.type === 'VideoCheckFinished',
            )
            expect(checkList?.length).toBeGreaterThan(0)
            checkList.forEach(({ data: item }) => {
                expect(item.id).toEqual(expect.any(String))
                expect(item.name).toBeOneOf(['AI音訊檢測', '文字詐騙檢測'])
                if (item.name === 'AI音訊檢測') {
                    expect(item.result).toBe('risky')
                } else {
                    expect(item.result).toBe('pass')
                    expect(item?.details).toEqual({
                        text: expect.any(String),
                    })
                }
            })

            // when - check history
            await new Promise((resolve) => setTimeout(resolve, 2000))
            const history = await request(app).get('/api/history')

            // then
            const data = history.body.data?.[0]
            expect(data.services.length).toBe(2)
            expect(data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    source: '使用者上傳',
                    video_path: expect.stringContaining(
                        process.env.RESOURCES_PATH,
                    ),
                    services: expect.arrayContaining([
                        expect.objectContaining({
                            name: expect.toBeOneOf([
                                'AI音訊檢測',
                                '文字詐騙檢測',
                            ]),
                            result: expect.toBeOneOf(['pass', 'risky']),
                            details: expect.toBeOneOf([
                                undefined,
                                expect.anything(),
                            ]),
                        }),
                    ]),
                    checked_at: expect.any(String),
                }),
            )
        })
    })

    describe(`驗收測試 - youtube 影片上傳檢測 API`, () => {
        it(`
        given
            url: <youtube url>
            AI音訊檢測, 可用
            AI影片檢測, 不可用
            文字詐騙檢測, 可用
        when
            使用者上傳了一部youtube影片進行檢測
        then
            預期得到每一項服務的檢測結果
            [
                {
                    name: 'AI音訊檢測',
                    result: 'risky',
                },
                {
                    name: '文字詐騙檢測',
                    result: 'pass',
                    details: {  
                        text: '影片文字'
                    },
                },
            ]
            檢測結果存到check_result資料表
        when
            查詢本次檢測紀錄
        then
            影片連結
            各種檢測的檢測結果
        `, async () => {
            // given
            const url = 'https://www.youtube.com/watch?v=1'

            // when
            mockAxios(services, url)
            const { url: baseUrl } = request(app).get('/')

            // Use fetch-event-source to listen for SSE events
            const events = []

            // Start the SSE connection in a separate promise
            const ssePromise = new Promise((resolve) => {
                try {
                    fetchEventSource(`${baseUrl}api/check/url`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            url,
                        }),
                        openWhenHidden: true,
                        onmessage: (event) => {
                            const data = JSON.parse(event.data)
                            events.push(data)
                            // Once we receive final result, resolve the promise
                            if (data.type === 'AllCheckFinished') {
                                resolve(events)
                            }
                        },
                        onerror: (error) => {
                            return 99999
                        },
                    }).catch((error) => {
                        console.error('Error in fetchEventSource:', error)
                        resolve([])
                    })
                } catch (error) {
                    console.error('Error setting up SSE:', error)
                    resolve([])
                }
            })

            // Wait for SSE events to complete
            const receivedEvents = await ssePromise

            // Check the events received via SSE
            expect(receivedEvents.length).toBeGreaterThan(0)

            console.log('Received events:', receivedEvents)

            // Check if we received progress events and final result
            expect(
                receivedEvents.filter((event) => event.type === 'VideoUploaded')
                    .length,
            ).toBe(1)
            expect(
                receivedEvents.filter(
                    (event) => event.type === 'VideoCheckFinished',
                ).length,
            ).toBe(
                services.filter(
                    (x) =>
                        x.status === ServiceStatusEnum.可用 &&
                        x.name !== EXTERNAL_SERVICE_NAME.URL2BASE64,
                ).length,
            )
            expect(
                receivedEvents.filter(
                    (event) => event.type === 'AllCheckFinished',
                ).length,
            ).toBe(1)

            // Verify the check results
            const checkList = receivedEvents.filter(
                (event) => event.type === 'VideoCheckFinished',
            )
            expect(checkList?.length).toBeGreaterThan(0)
            checkList.forEach(({ data: item }) => {
                expect(item.id).toEqual(expect.any(String))
                expect(item.name).toBeOneOf(['AI音訊檢測', '文字詐騙檢測'])
                if (item.name === 'AI音訊檢測') {
                    expect(item.result).toBe('risky')
                } else {
                    expect(item.result).toBe('pass')
                    expect(item?.details).toEqual({
                        text: expect.any(String),
                    })
                }
            })

            // when - check history
            await new Promise((resolve) => setTimeout(resolve, 2000))
            const history = await request(app).get('/api/history')

            // then
            const data = history.body.data?.[0]
            expect(data.services.length).toBe(2)
            expect(data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    source: 'Youtube',
                    video_path: expect.stringContaining(
                        process.env.RESOURCES_PATH,
                    ),
                    services: expect.arrayContaining([
                        expect.objectContaining({
                            name: expect.toBeOneOf([
                                'AI音訊檢測',
                                '文字詐騙檢測',
                            ]),
                            result: expect.toBeOneOf(['pass', 'risky']),
                            details: expect.toBeOneOf([
                                undefined,
                                expect.anything(),
                            ]),
                        }),
                    ]),
                    checked_at: expect.any(String),
                }),
            )
        })

        it(`上傳非youtube影片時，應該回傳錯誤`, async () => {
            // given
            const url = 'https://www.google.com'
            // when
            const { url: baseUrl } = request(app).get('/')
            const events = []

            await new Promise((resolve) => {
                fetchEventSource(`${baseUrl}api/check/url`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url,
                    }),
                    openWhenHidden: true,
                    onmessage: (event) => {
                        const data = JSON.parse(event.data)
                        events.push(data)
                        console.log('Received event:', data)
                        if (data.type === 'ValidationError') {
                            resolve()
                        }
                    },
                    onerror: (err) => {
                        return 99999
                    },
                })
            })
            // then
            expect(events.length).toBe(1)
            expect(
                events.filter((event) => event.type === 'ValidationError')
                    .length,
            ).toBe(1)
            expect(events[0].data.message).toBe('只接受 YouTube 影片連結')
        })
    })
})

async function setupServices() {
    const services = [
        {
            name: 'AI音訊檢測',
            host: 'http://192.168.1.123:8081',
            status: ServiceStatusEnum.可用,
        },
        {
            name: 'AI影片檢測',
            host: 'http://192.168.1.123:8082',
            status: ServiceStatusEnum.不可用,
        },
        {
            name: '文字詐騙檢測',
            host: 'http://192.168.1.123:8083',
            status: ServiceStatusEnum.可用,
        },
        {
            name: 'URL轉換影片',
            host: 'http://192.168.1.1234:8082',
            status: ServiceStatusEnum.可用,
        },
    ]
    await Service.bulkCreate(services)
    return services
}

function mockAxios(services, url = '') {
    const mockAxios = new MockAdapter(axios)
    mockAxios.onPost(`${services[0].host}/api/check`).reply(200, {
        result: '此音訊可能為 AI',
    })
    mockAxios.onPost(`${services[2].host}/api/check`).reply(200, {
        result: '該文本無明顯詐騙風險',
        details: {
            text: '影片文字',
        },
    })
    mockAxios.onGet(`${services[3].host}?url=${url}`).reply(200, {
        result: 'data:video/mp4;base64, <base64>',
    })
}
