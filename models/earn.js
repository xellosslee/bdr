const { Model, DataTypes } = require('sequelize')
class Earn extends Model {}

module.exports = (sq) => {
	Earn.init(
		{
			id: {
				type: DataTypes.BIGINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			itemId: {
				type: DataTypes.BIGINT.UNSIGNED,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING,
				comment: '획득 or 제작',
			},
			work: {
				type: DataTypes.STRING,
				comment: '획득 방식',
			},
			path: {
				type: DataTypes.TEXT,
				comment: '획득 경로',
			},
		},
		{
			sequelize: sq,
			tableName: 'earn',
			charset: 'utf8mb4',
			collate: 'utf8mb4_0900_ai_ci',
			indexes: [{ fields: ['itemId'] }],
		},
	)
	return Earn
}
