import { Model, DataTypes } from 'sequelize'

export class Video extends Model {
    // 這裡可以定義關聯
    static associate(models) {
        // 定義此 model 與其他 models 的關聯
        // 例如：this.belongsTo(models.User)
        this.hasMany(models.CheckResult, {
            foreignKey: 'video_id',
            as: 'checkResult',
        })
    }
}

export default (sequelize) => {
    Video.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            video_path: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            url: {
                type: DataTypes.STRING(1024),
                allowNull: true,
            },
            source: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize, // 傳入 sequelize 實例而不是 db
            modelName: 'Video',
            // 防止表名自動轉為複數
            freezeTableName: true,
            // 明確指定表名（選擇性的，但建議加上）
            tableName: 'video',
            // 其他選項
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true, // 預設為 false
            // paranoid: false, // 預設為 false
        },
    )

    return Video
}
