import { Model, DataTypes } from "sequelize";

export class Service extends Model {
  // 這裡可以定義關聯
  static associate(models) {
    // 定義此 model 與其他 models 的關聯
    // 例如：this.belongsTo(models.User)
    this.hasMany(models.CheckResult, {
      foreignKey: 'service_id'
    })
  }
}

export default (sequelize) => {
  Service.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      host: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("可用", "不可用"),
        allowNull: false,
        defaultValue: "不可用",
      },
    },
    {
      sequelize, // 傳入 sequelize 實例而不是 db
      modelName: "Service",
      // 防止表名自動轉為複數
      freezeTableName: true,
      // 明確指定表名（選擇性的，但建議加上）
      tableName: "service",
      // 其他選項
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true, // 預設為 false
      // paranoid: false, // 預設為 false
    }
  );

  return Service;
};
