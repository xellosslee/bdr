const { Sequelize, Op } = require('sequelize')

let logging = (...msg) => {
	console.log(msg[0], msg[1]?.bind || '')
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
}

DB.Usages.belongsTo(DB.Item, { foreignKey: 'itemId', as: 'Item', constraints: false, foreignKeyConstraint: false })
DB.Usages.belongsTo(DB.Item, { foreignKey: 'resultItemCd', targetKey: 'itemCd', as: 'resultItem', constraints: false, foreignKeyConstraint: false })

DB.Item.hasOne(DB.File, { foreignKey: 'fileId', as: 'itemImage', constraints: false, foreignKeyConstraint: false })

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
		sq.sync().then(function () {
			console.log('All models were synchronized successfully.')
			console.log('Skipped db Sync')
			DB.initialized = true
		})
	}
}

module.exports = { DB, sq, Op }
