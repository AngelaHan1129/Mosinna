import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import 'dotenv/config'
import middlewares from './middlewares'
import api from './api'
import { sequelize } from './db'
import path from 'path'

const app = express()

app.use(morgan('dev'))
app.use(
    helmet({
        // crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
    }),
)
app.use(
    cors({
        origin: '*',
    }),
)
app.use(express.json({ limit: '50mb' }))
app.use(
    '/resources',
    express.static(path.resolve(__dirname, '..', 'videos'), {
        setHeaders: (res) => {
            res.setHeader('Content-Type', 'video/mp4')
        },
    }),
)

app.get('/', (req, res) => {
    res.json({
        message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
    })
})

app.use('/api', api)

app.use(middlewares.notFound)
app.use(middlewares.errorHandler)
;async () => {
    await sequelize
        .validate()
        .then(() => {
            console.log('Database connected')
        })
        .catch((error) => {
            console.error('Unable to connect to the database:', error)
        })
}

export default app
