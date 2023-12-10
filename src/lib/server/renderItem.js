import { encode, decode } from '$lib/util/crypt.js'
import { NODE_ENV } from '$env/static/private'
import prisma from '$lib/prisma.js'

export async function renderItem(itemCd, force) {
	if (itemCd == null) {
		let item = await prisma.$queryRaw`SELECT itemCd FROM item WHERE removed = 0 ORDER BY RAND() LIMIT 1`
		itemCd = item[0].itemCd
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

	let itemsA = await prisma.item.findMany({
		include: {
			itemImg: { select: { imgUrl: true } },
			earns: {
				include: {
					crafts: true,
				},
			},
			usages: true,
		},
		where: { itemCd: itemCd, removed: 0 },
	})
	// console.debug(itemsA[0])
	// console.debug(itemsA[0].earns[0].crafts)
	let relateItemCds = []
	itemsA.forEach((e) => {
		e.earns.forEach((r) => {
			relateItemCds = relateItemCds.concat(r.crafts.map((t) => t.itemCd))
		})
		relateItemCds = relateItemCds.concat(e.usages.map((x) => x.resultItemCd))
	})
	// console.debug(relateItemCds)

	let relateItems = await prisma.item.findMany({
		include: {
			itemImg: { select: { imgUrl: true } },
		},
		where: { itemCd: { in: relateItemCds }, priority: 1 },
	})
	// console.debug(relateItems)
	let resultItems = itemsA.map((e) => ({
		itemIdEnc: encode(e.itemId.toString()),
		itemCdEnc: encode(e.itemCd.toString()),
		name: e.name,
		desc: e.desc,
		grade: e.grade,
		likeCount: e.likeCount,
		createdAt: e.createdAt,
		itemImage: e.itemImg,
		Earns: e.earns.map((r) => {
			return {
				type: r.type,
				work: r.work,
				path: r.path,
				Crafts: r.crafts
					.map((t) => {
						let item = relateItems.find((q) => {
							return q.itemCd == t.itemCd
						})
						if (!item) {
							console.warn('craft item is null')
							return null
						}
						return {
							url: '/' + encode(item.itemCd.toString()),
							imgUrl: item.itemImg.imgUrl,
							name: item.name,
							grade: item.grade,
							count: t.count,
						}
					})
					.filter((e) => e != null),
			}
		}),
		Usages: e.usages
			.map((r) => {
				let item = relateItems.find((q) => q.itemCd == r.resultItemCd)
				if (!item) {
					return null
				}
				return {
					url: '/' + encode(item.itemCd.toString()),
					imgUrl: item.itemImg.imgUrl,
					name: item.name,
					grade: item.grade,
				}
			})
			.filter((e) => e),
	}))
	console.debug(resultItems)
	console.debug(resultItems[0].Earns[0].Crafts)
	console.debug(resultItems[0].Usages)
	return {
		items: resultItems,
	}
}
