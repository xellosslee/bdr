const { Model, DataTypes } = require('sequelize')
class LikeHistory extends Model {}

module.exports = (sq) => {
	LikeHistory.init(
		{
			likeHistoryId: {
				type: DataTypes.BIGINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			itemId: {
				type: DataTypes.BIGINT.UNSIGNED,
				allowNull: false,
			},
			bdrId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			updatedAt: false,
			sequelize: sq,
			tableName: 'like_history',
			charset: 'utf8mb4',
			collate: 'utf8mb4_0900_ai_ci',
			indexes: [{ fields: ['itemId'] }, { fields: ['bdrId', 'createdAt', 'itemId'] }],
		},
	)
	return LikeHistory
}
