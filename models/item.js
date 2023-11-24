const { Model, DataTypes } = require('sequelize')
class Item extends Model {}

module.exports = (sq) => {
	Item.init(
		{
			itemId: {
				type: DataTypes.BIGINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			itemCd: {
				type: DataTypes.BIGINT.UNSIGNED,
			},
			name: {
				type: DataTypes.STRING,
			},
			desc: {
				type: DataTypes.TEXT,
			},
			fileId: {
				type: DataTypes.BIGINT.UNSIGNED,
			},
			likeCount: {
				type: DataTypes.BIGINT,
				defaultValue: 0,
			},
			removed: {
				type: DataTypes.TINYINT,
				defaultValue: 0,
			},
		},
		{
			sequelize: sq,
			tableName: 'item',
			charset: 'utf8mb4',
			collate: 'utf8mb4_0900_ai_ci',
			indexes: [{ fields: ['itemCd'] }, { fields: ['fileId'] }],
		},
	)
	return Item
}
