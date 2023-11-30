import { json } from '@sveltejs/kit'
import { DB, sq, Op } from '$lib/server/mysql.js'
import { encode, decode } from '$lib/util/crypt.js'

export async function POST({ request, cookies }) {
	let transaction = await sq.transaction()
	try {
		if (!req.headers['bdr-id']) {
			throw { code: '97', message: '비정상 적인 접근입니다.' }
		}
		// 크롤링용 코드
		// if (req.body.item.itemId != null) {
		// 	await DB.Item.upsert({ ...req.body.item, itemCd: req.body.item.itemId }, { where: { itemId: req.body.item.itemId }, transaction })
		// 	await DB.Earn.destroy({ where: { itemId: req.body.item.itemId }, transaction })
		// 	for (let i = 0; i < req.body.item.earnList.length; i++) {
		// 		let earn = await DB.Earn.create({ itemId: req.body.item.itemId, ...req.body.item.earnList[i] }, { transaction })
		// 		if (Array.isArray(req.body.item.earnList[i].craftList)) {
		// 			await DB.Craft.bulkCreate(
		// 				req.body.item.earnList[i].craftList.map((e) => ({ ...e, earnId: earn.id, itemCd: e.itemId })),
		// 				{ transaction },
		// 			)
		// 		}
		// 	}
		// 	await DB.Usages.destroy({ where: { itemId: req.body.item.itemId }, transaction })
		// 	await DB.Usages.bulkCreate(
		// 		req.body.item.usageList.map((e) => ({ itemId: req.body.item.itemId, ...e })),
		// 		{ transaction },
		// 	)
		// }
		if (req.body.itemCdEnc == null) {
			let newItemCd = await DB.Item.max('itemCd')
			req.body.itemCd = newItemCd + 1
		} else {
			req.body.itemCd = decode(req.body.itemCdEnc)
		}
		let cnt = await DB.Item.count({ where: { itemCd: req.body.itemCd, removed: 0 } })
		if (cnt >= 3) {
			throw { code: '01', message: '동일한 아이템을 3개를 초과하여 만들 수 없습니다.' }
		}
		let item = {}
		// 기존 아이템 수정 - (수정하여 새로운 레코드 생성)
		if (req.body.itemIdEnc) {
			req.body.itemId = decode(req.body.itemIdEnc)
			item = await DB.Item.findOne({ attributes: ['itemCd', 'name', 'fileId', 'grade', 'desc'], where: { itemId: req.body.itemId } })
			let newItem = await DB.Item.create({ itemCd: item.itemCd, name: req.body.name || item.name, fileId: req.body.fileId || item.fileId, grade: req.body.grade || item.grade, desc: req.body.desc || item.desc }, { transaction })
			for (let i = 0; i < req.body.Earns.length; i++) {
				let earn = await DB.Earn.create({ ...req.body.Earns[i], itemId: newItem.itemId }, { transaction })
				if (Array.isArray(req.body.Earns[i].Crafts)) {
					await DB.Craft.bulkCreate(
						req.body.Earns[i].Crafts.map((e) => ({ earnId: earn.id, itemCd: e.itemCd, count: e.count })),
						{ transaction },
					)
				}
			}
			await DB.Usages.bulkCreate(
				req.body.Usages.map((e) => ({ itemId: newItem.itemId, resultItemCd: e.resultItemCd })),
				{ transaction },
			)
		} else {
			// 신규 아이템 생성
		}
		await transaction.commit()
		return json({ code: '00' }, { status: 200 })
	} catch (err) {
		console.error(err.original || err)
		await transaction.rollback()
		if (typeof err == 'object') {
			return json({ code: '99', ...err }, { status: 200 })
		} else {
			return json({ code: '99' }, { status: 200 })
		}
	}
}
