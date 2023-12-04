import { Model, DataTypes } from 'sequelize'
class Item extends Model {}

export default (sq) => {
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
			grade: {
				type: DataTypes.TINYINT,
				defaultValue: 1,
				comment: '아이템 등급 1부터 회색, 녹색, 파랑, 노랑, 빨강',
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
