import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import process from 'process';

// 修正 Windows 路徑問題
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// 使用 URL 建構子來處理配置文件的路徑
const configPath = new URL('./config/config.json', import.meta.url);
const configFile = await import(configPath, {
  assert: { type: 'json' }
});
const config = configFile.default[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 讀取模型文件
const files = fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  });

// 使用 URL 建構子來處理模型文件的路徑
for (const file of files) {
  const modelPath = new URL(file, import.meta.url);
  const modelModule = await import(modelPath);
  const model = modelModule.default(sequelize);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;


export const database = sequelize
export default db;