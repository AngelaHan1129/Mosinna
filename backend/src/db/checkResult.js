import { Model, DataTypes } from "sequelize";

export class CheckResult extends Model {
    // 這裡可以定義關聯
    static associate(models) {
      // 定義此 model 與其他 models 的關聯
      // 例如：this.belongsTo(models.User)

      this.belongsTo(models.Service, {
        foreignKey: "service_id",
        targetKey: "id",
      });
      this.belongsTo(models.Video, {
        foreignKey: "video_id",
        targetKey: "id",
      });
    }
  }
export default (sequelize) => {
  

  CheckResult.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'service',
            key: 'id'
        },
      },
      video_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'video',
            key: 'id'
        },
      },
      result:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      details: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize, // 傳入 sequelize 實例而不是 db
      modelName: "CheckResult",
      // 防止表名自動轉為複數
      freezeTableName: true,
      // 明確指定表名（選擇性的，但建議加上）
      tableName: "check_result",
      // 其他選項
      timestamps: true,
      createdAt: "checked_at",
      updatedAt: "updated_at",
      underscored: true, // 預設為 false
      // paranoid: false, // 預設為 false
    }
  );

  return CheckResult;
};
