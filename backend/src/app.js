import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import 'dotenv/config'
import  middlewares from './middlewares.js'
import  api from './api/index.js'
import db from './db/index.js'

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// module.exports = app;

export default app
