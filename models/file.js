const { Model, DataTypes } = require('sequelize')
class File extends Model {}

module.exports = (sq) => {
	File.init(
		{
			fileId: {
				type: DataTypes.BIGINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
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
