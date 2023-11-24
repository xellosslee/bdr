const { Sequelize, Op } = require('sequelize')

let logging = (...msg) => {
	if (process.env.NODE_ENV == 'local' || process.env.QUERY_PARAM_LOG == 1) {
		console.log(msg[0], msg[1]?.bind || '')
	} else {
		return false
	}
}
const sq = new Sequelize(process.env.DB_NAME || 'wing', process.env.DB_USER || 'root', process.env.DB_PASS, {
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 3306,
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
	Item: require('./models/item.js')(sq),
	Earn: require('./models/earn.js')(sq),
	Usages: require('./models/usages.js')(sq),
	File: require('./models/file.js')(sq),
	Craft: require('./models/craft.js')(sq),
	LikeHistory: require('./models/like_history.js')(sq),
}

DB.Usages.belongsTo(DB.Item, { foreignKey: 'itemId', as: 'Item', constraints: false, foreignKeyConstraint: false })
DB.Usages.hasMany(DB.Item, { foreignKey: 'itemCd', sourceKey: 'resultItemCd', as: 'resultItem', constraints: false, foreignKeyConstraint: false })

DB.Item.belongsTo(DB.File, { foreignKey: 'fileId', targetKey: 'fileId', as: 'itemImage', constraints: false, foreignKeyConstraint: false })

DB.Item.hasMany(DB.Usages, { foreignKey: 'itemId', targetKey: 'itemId', constraints: false, foreignKeyConstraint: false })
DB.Item.hasMany(DB.Earn, { foreignKey: 'itemId', targetKey: 'itemId', constraints: false, foreignKeyConstraint: false })

DB.Earn.hasMany(DB.Craft, { foreignKey: 'itemId', sourceKey: 'itemId', targetKey: 'itemId', constraints: false, foreignKeyConstraint: false })
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
	if (process.env.SYNC_DB === '2' && process.env.NODE_ENV !== 'prod') {
		await sq.sync({ force: true })
		console.log('All models were synchronized successfully.')
		DB.initialized = true
	} else if (process.env.SYNC_DB === '1') {
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

module.exports = { DB, sq, Op }
