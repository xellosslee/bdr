import { Model, DataTypes } from 'sequelize'
class File extends Model {}

export default (sq) => {
	File.init(
		{
			fileId: {
				type: DataTypes.BIGINT.UNSIGNED,
				primaryKey: true,
				allowNull: false,
			},
			imgUrl: {
				type: DataTypes.STRING,
			},
			name: {
				type: DataTypes.STRING,
			},
		},
		{
			sequelize: sq,
			tableName: 'file',
			charset: 'utf8mb4',
			collate: 'utf8mb4_0900_ai_ci',
			indexes: [],
		},
	)
	return File
}
