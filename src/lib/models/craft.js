import { Model, DataTypes } from 'sequelize'
class Craft extends Model {}

export default (sq) => {
	Craft.init(
		{
			id: {
				type: DataTypes.BIGINT.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			earnId: {
				type: DataTypes.BIGINT.UNSIGNED,
				comment: 'earnId',
			},
			itemCd: {
				type: DataTypes.BIGINT.UNSIGNED,
				comment: '재료 아이템 Cd',
			},
			count: {
				type: DataTypes.BIGINT.UNSIGNED,
				comment: '개수',
			},
		},
		{
			updatedAt: false,
			sequelize: sq,
			tableName: 'craft',
			charset: 'utf8mb4',
			collate: 'utf8mb4_0900_ai_ci',
			indexes: [{ fields: ['earnId'] }, { fields: ['itemCd'] }],
		},
	)
	return Craft
}
