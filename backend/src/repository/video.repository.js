import { Video } from '../db/video'
import path from 'path'
import fs from 'fs'

export class VideoRepository {
    /**
     * @param {String} dataUrl
     * @param {String} sourceType
     * @param {String | null} url
     *
     * @returns {Promise<Video>}
     */
    async saveVideo(dataUrl, sourceType, url = null) {
        const arr = dataUrl.split(',')
        //提取出 MIME 類型，例如 video/mp4
        const mime = arr[0].match(/:(.*?);/)[1]
        // 取後面的部分作為檔案的副檔名
        const fileExtension = getExtention(mime)
        const fileName = `${Date.now()}.${fileExtension}`
        // 轉換成二進位
        const bstr = Buffer.from(arr[1], 'base64')
        //儲存影片的資料夾
        const folderPath = path.join(__dirname, '..', '..', 'videos')
        //完整的檔案儲存路徑
        const filePath = path.join(folderPath, fileName)
        //fs.writeFile 寫入檔案。filePath 是完整的檔案儲存路徑，bstr 是要寫入檔案的內容。如果出現錯誤，會返回 err
        new Promise((resolve) => {
            fs.writeFile(filePath, bstr, (err) => {
                if (err) {
                    console.error('Error writing file:', err)
                    resolve(false)
                } else {
                    console.log(`File saved successfully as ${filePath}`)
                    resolve(filePath)
                }
            })
        })
        return (
            await Video.create({
                video_path: fileName,
                source: sourceType,
                url,
            })
        ).dataValues
    }
}

function getExtention(mime) {
    const mimeType_to_extention = {
        'video/mp4': 'mp4',
        'video/x-matroska': 'mkv',
        'video/quicktime': 'mov',
        'video/x-msvideo': 'avi',
        'video/x-flv': 'flv',
        'video/webm': 'webm',
    }
    return mimeType_to_extention[mime]
}
export default new VideoRepository()
