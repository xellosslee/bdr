const cron = require('node-cron')
const { DB, sq, Op } = require('./mysql')

cron.schedule('0 4 * * *', negativeItemRemove)
async function negativeItemRemove(time) {
	try {
		await DB.Item.update({ removed: 1 }, { where: { likeCount: { [Op.lt]: 0 } } })
	} catch (err) {
		console.error('negativeItemRemove', err)
	}
}
