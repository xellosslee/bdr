const cron = require('node-cron')
const { DB, sq, Op } = require('./mysql')

// 새벽 4시
cron.schedule('0 4 * * *', negativeItemRemove)
// negativeItemRemove()
async function negativeItemRemove(time) {
	try {
		// // 2개 이상인 아이템만 뽑기
		// let items = await DB.Item.findAll({ attributes: ['itemCd'], where: { removed: 0 }, group: ['itemCd'], having: sq.literal('COUNT(*) > 1'), raw: 1 })
		// items.forEach(async (e) => {
		// 	// 2개 이상인 아이템 중 음수인 아이템 찾기
		// 	let targetItems = await DB.Item.findAll({ where: { itemCd: e.itemCd }, raw: 1 })
		// 	targetItems
		// })
		await DB.Item.update({ removed: 1 }, { where: { likeCount: { [Op.lt]: 0 } } })
	} catch (err) {
		console.error('negativeItemRemove', err)
	}
}
