import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Feedback extends Model {
    // 這裡可以定義關聯
    static associate(models) {
      // 定義此 model 與其他 models 的關聯
      // 例如：this.belongsTo(models.User)
    }
  }

  Feedback.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize, // 傳入 sequelize 實例而不是 db
      modelName: "Feedback",
      // 防止表名自動轉為複數
      freezeTableName: true,
      // 明確指定表名（選擇性的，但建議加上）
      tableName: 'feedback',
      // 其他選項
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true, // 預設為 false
      // paranoid: false, // 預設為 false
    }
  );

  return Feedback;
};