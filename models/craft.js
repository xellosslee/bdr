const { Model, DataTypes } = require('sequelize')
class Craft extends Model {}

module.exports = (sq) => {
	Craft.init(
		{
			id: {
				type: DataTypes.BIGINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			itemId: {
				type: DataTypes.BIGINT.UNSIGNED,
				comment: '재료 아이템',
			},
			count: {
				type: DataTypes.BIGINT.UNSIGNED,
				comment: '개수',
			},
		},
		{
			sequelize: sq,
			tableName: 'craft',
			charset: 'utf8mb4',
			collate: 'utf8mb4_0900_ai_ci',
			indexes: [{ fields: ['itemId'] }],
		},
	)
	return Craft
}
