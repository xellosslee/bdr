import { Sequelize, Op } from 'sequelize'
import Item from '$lib/models/item.js'
import Earn from '$lib/models/earn.js'
import Usages from '$lib/models/usages.js'
import File from '$lib/models/file.js'
import Craft from '$lib/models/craft.js'
import LikeHistory from '$lib/models/like_history.js'
import { NODE_ENV, QUERY_PARAM_LOG, DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT, SYNC_DB } from '$env/static/private'

let logging = (...msg) => {
	if (NODE_ENV == 'local' || QUERY_PARAM_LOG == 1) {
		console.log(msg[0], msg[1]?.bind || '')
	} else {
		return false
	}
}
const sq = new Sequelize(DB_NAME || 'wing', DB_USER || 'root', DB_PASS, {
	host: DB_HOST || 'localhost',
	port: DB_PORT || 3306,
	timezone: '+09:00', // SETUP THE TIMEZONE
	dialect: 'mysql',
	dialectOptions: { dateStrings: true, typeCast: true },
	define: { charset: 'utf8', collate: 'utf8_general_ci' },
	pool: { min: 0, max: 5, acquire: 30000, idle: 10000 },
	logging: logging,
})

let DB = {
	initialized: false,
	sq,
	Item: Item(sq),
	Earn: Earn(sq),
	Usages: Usages(sq),
	File: File(sq),
	Craft: Craft(sq),
	LikeHistory: LikeHistory(sq),
}

DB.Usages.belongsTo(DB.Item, { foreignKey: 'itemId', as: 'Item', constraints: false, foreignKeyConstraint: false })
DB.Usages.hasMany(DB.Item, { foreignKey: 'itemCd', sourceKey: 'resultItemCd', as: 'resultItem', constraints: false, foreignKeyConstraint: false })

DB.Item.belongsTo(DB.File, { foreignKey: 'fileId', targetKey: 'fileId', as: 'itemImage', constraints: false, foreignKeyConstraint: false })

DB.Item.hasMany(DB.Usages, { foreignKey: 'itemId', targetKey: 'itemId', constraints: false, foreignKeyConstraint: false })
DB.Item.hasMany(DB.Earn, { foreignKey: 'itemId', targetKey: 'itemId', constraints: false, foreignKeyConstraint: false })

DB.Earn.hasMany(DB.Craft, { foreignKey: 'earnId', sourceKey: 'id', targetKey: 'earnId', constraints: false, foreignKeyConstraint: false })
DB.Craft.hasMany(DB.Item, { foreignKey: 'itemCd', sourceKey: 'itemCd', targetKey: 'itemCd', as: 'craftItems', constraints: false, foreignKeyConstraint: false })
DB.Usages.hasMany(DB.Item, { foreignKey: 'itemCd', sourceKey: 'resultItemCd', targetKey: 'itemCd', as: 'usageItems', constraints: false, foreignKeyConstraint: false })
// DB.Craft.belongsTo(DB.Earn, { foreignKey: 'itemId', targetKey: 'itemId', constraints: false, foreignKeyConstraint: false })

// db connection 끊기지 않게 주기적으로 ping 수행
function ping() {
	sq.query('SELECT 1', { logging: false })
}
setInterval(ping, 28500 * 1000)

DBSync()
async function DBSync() {
	if (SYNC_DB === '2' && NODE_ENV !== 'production') {
		await sq.sync({ force: true })
		console.log('All models were synchronized successfully.')
		DB.initialized = true
	} else if (SYNC_DB === '1') {
		await sq.sync({ alter: true })
		console.log('All models were synchronized successfully.')
		DB.initialized = true
	} else {
		// sq.sync().then(function () {
		// 	console.log('All models were synchronized successfully.')
		console.log('Skipped db Sync')
		DB.initialized = true
		// })
	}
}

export { DB, sq, Op }
