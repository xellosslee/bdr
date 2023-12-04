import { DB, sq, Op } from '$lib/server/mysql.js'
import { encode, decode } from '$lib/util/crypt.js'
import { NODE_ENV } from '$env/static/private'

export async function load({ params, cookies }) {
	let bdrId = cookies.get('bdrId')
	if (!bdrId) {
		bdrId = crypto.randomUUID()
		cookies.set('bdrId', bdrId, { path: '/' })
	}
	let item = await DB.Item.findOne({ attributes: ['itemCd'], order: [sq.fn('rand')] })
	let itemCd = item.itemCd
	let items = null
	let itemIncludeArray = [
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
					where: { removed: 0 },
				},
			},
		},
		{
			model: DB.Usages,
			include: {
				model: DB.Item,
				as: 'usageItems',
				attributes: ['name', 'itemCd', 'fileId', 'grade'],
				include: [{ model: DB.File, attributes: ['imgUrl'], as: 'itemImage', required: true }],
				order: [
					['likeCount', 'desc'],
					['name', 'asc'],
				],
				where: { removed: 0 },
				limit: 1,
			},
		},
	]
	// 운영에서는 숫자 조회 불가능하게 방지
	if (process.env.NODE_ENV != 'production') {
		if (!Number.isNaN(Number(itemCd))) {
			items = await DB.Item.findAll({
				include: itemIncludeArray,
				where: { itemCd: Number(itemCd), removed: 0 },
				order: [['likeCount', 'desc']],
			})
		}
	}
	if (!items) {
		try {
			// console.debug(params.itemCd, decode(params.itemCd), data)
			params.itemCd = decode(params.itemCd)
			items = await DB.Item.findAll({
				include: itemIncludeArray,
				where: { itemCd: params.itemCd, removed: 0 },
				order: [['likeCount', 'desc']],
				logging: console.log,
			})
			console.debug(params.itemCd)
		} catch (err) {
			console.error(err)
			throw { code: '01' }
		}
	}
	if (!items) {
		throw { code: '02' }
	}
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
