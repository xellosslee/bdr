import { Model, DataTypes } from 'sequelize'
class Earn extends Model {}

export default (sq) => {
	Earn.init(
		{
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
				type: DataTypes.STRING,
				comment: '획득 경로',
			},
			craftList: {
				type: DataTypes.JSON,
				comment: '제조 레시피 목록',
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
