const cron = require('node-cron')
const { DB, sq, Op } = require('./mysql')

// 새벽 4시
cron.schedule('0 4 * * *', negativeItemRemove)
// 매 시각 0분
cron.schedule('0 * * * *', updatePriority)
async function negativeItemRemove(time) {
	try {
		await DB.Item.update({ removed: 1 }, { where: { likeCount: { [Op.lt]: 0 } } })
	} catch (err) {
		console.error('negativeItemRemove', err)
	}
}
async function updatePriority(time) {
	try {
		await DB.Item.update({ removed: 1 }, { where: { likeCount: { [Op.lt]: 0 } } })
	} catch (err) {
		console.error('negativeItemRemove', err)
	}
}
