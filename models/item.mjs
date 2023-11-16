import { Model, DataTypes } from 'sequelize'
class Item extends Model {}

export default (sq) => {
	Item.init(
		{
			itemId: {
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
			desc: {
				type: DataTypes.STRING,
			},
		},
		{
			sequelize: sq,
			tableName: 'item',
			charset: 'utf8mb4',
			collate: 'utf8mb4_0900_ai_ci',
			indexes: [],
		},
	)
	return Item
}
