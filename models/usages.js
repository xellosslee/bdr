const { Model, DataTypes } = require('sequelize')
class Usages extends Model {}

module.exports = (sq) => {
	Usages.init(
		{
			itemId: {
				type: DataTypes.BIGINT.UNSIGNED,
				comment: '재료 아이템',
			},
			resultItemId: {
				type: DataTypes.BIGINT.UNSIGNED,
				comment: '제작 가능 아이템',
			},
		},
		{
			sequelize: sq,
			tableName: 'usages',
			charset: 'utf8mb4',
			collate: 'utf8mb4_0900_ai_ci',
			indexes: [{ fields: ['itemId', 'resultItemId'] }],
		},
	)
	return Usages
}
