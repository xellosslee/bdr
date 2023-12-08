import { DB, sq, Op } from '$lib/server/mysql.js'
import { encode, decode } from '$lib/util/crypt.js'
import { NODE_ENV } from '$env/static/private'
// import prisma from '$lib/prisma.js'

export async function renderItem(itemCd, force) {
	if (itemCd == null) {
		// let item = await prisma.$queryRaw`SELECT itemCd FROM item WHERE removed = 0 ORDER BY RAND() LIMIT 1`
		// itemCd = item[0].itemCd
		let item = await DB.Item.findOne({ attributes: ['itemCd'], order: [sq.fn('rand')] })
		itemCd = item.itemCd
	}
	// 운영에서는 숫자 조회 불가능하게 방지
	if (NODE_ENV != 'production' || force) {
		if (!Number.isNaN(Number(itemCd))) {
			itemCd = Number(itemCd)
		} else {
			try {
				// console.debug(itemCd, decode(itemCd), data)
				itemCd = decode(itemCd)
			} catch (err) {
				console.error(err)
				throw { code: '01' }
			}
		}
	} else {
		try {
			// console.debug(itemCd, decode(itemCd), data)
			itemCd = decode(itemCd)
		} catch (err) {
			console.error(err)
			throw { code: '01' }
		}
	}
	// let itemsA = await prisma.item.findMany({
	// 	include: {
	// 		itemImg: { select: { imgUrl: true } },
	// 		earns: {
	// 			include: {
	// 				crafts: true,
	// 			},
	// 		},
	// 		usages: true,
	// 	},
	// 	where: { itemCd: itemCd, removed: 0 },
	// })
	// console.dir(itemsA[0])
	let items = await DB.Item.findAll({
		include: [
			{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] },
			{
				model: DB.Earn,
				include: {
					model: DB.Craft,
					include: {
						model: DB.Item,
						as: 'craftItems',
						attributes: ['name', 'itemCd', 'fileId', 'grade'],
						include: [{ model: DB.File, attributes: ['imgUrl'], as: 'itemImage' }],
						// order: [
						// 	['likeCount', 'desc'],
						// 	['name', 'asc'],
						// ],
						where: { removed: 0 },
						limit: 1,
					},
				},
			},
			{
				model: DB.Usages,
				include: {
					model: DB.Item,
					as: 'usageItems',
					attributes: ['name', 'likeCount', 'itemCd', 'fileId', 'grade'],
					include: [{ model: DB.File, attributes: ['imgUrl'], as: 'itemImage', required: true }],
					// order: [
					// 	['likeCount', 'desc'],
					// 	['name', 'asc'],
					// ],
					where: { removed: 0 },
					limit: 1,
				},
			},
		],
		where: { itemCd: itemCd, removed: 0 },
		order: [['likeCount', 'desc']],
		logging: console.log,
	})
	let resultItems = items.map((e) => ({
		itemIdEnc: encode(e.dataValues.itemId.toString()),
		itemCdEnc: encode(e.dataValues.itemCd.toString()),
		name: e.dataValues.name,
		desc: e.dataValues.desc,
		grade: e.dataValues.grade,
		likeCount: e.dataValues.likeCount,
		createdAt: e.dataValues.createdAt,
		itemImage: e.itemImage.dataValues,
		Earns: e.Earns.map((ee) => ({
			type: ee.dataValues.type,
			work: ee.dataValues.work,
			path: ee.dataValues.path,
			Crafts: ee.Crafts.map((t) =>
				t?.craftItems[0]
					? {
							url: '/' + encode(t?.craftItems[0]?.itemCd.toString()),
							imgUrl: t?.craftItems[0]?.itemImage?.imgUrl,
							name: t?.craftItems[0]?.name,
							grade: t?.craftItems[0]?.grade,
							itemCd: t?.craftItems[0]?.itemCd,
							count: t?.count,
					  }
					: null,
			).filter((e) => e != null),
		})),
		Usages: e.Usages.map((ee) =>
			ee?.usageItems[0]
				? {
						url: '/' + encode(ee?.usageItems[0]?.itemCd.toString()),
						imgUrl: ee?.usageItems[0]?.itemImage?.imgUrl,
						name: ee?.usageItems[0]?.name,
						grade: ee?.usageItems[0]?.grade,
				  }
				: null,
		).filter((e) => e != null),
	}))

	return {
		items: resultItems,
	}
}
