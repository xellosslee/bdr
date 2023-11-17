const { Model, DataTypes } = require('sequelize')
class Usages extends Model {}

module.exports = (sq) => {
	Usages.init(
		{
			itemId: {
				type: DataTypes.BIGINT.UNSIGNED,
			},
			useItemId: {
				type: DataTypes.BIGINT.UNSIGNED,
			},
		},
		{
			sequelize: sq,
			tableName: 'usages',
			charset: 'utf8mb4',
			collate: 'utf8mb4_0900_ai_ci',
			indexes: [{ fields: ['itemId', 'useItemId'] }],
		},
	)
	return Usages
}
