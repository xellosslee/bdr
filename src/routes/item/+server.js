import { json } from '@sveltejs/kit'
import prisma from '$lib/prisma.js'
import { encode, decode } from '$lib/util/crypt.js'

export async function PUT({ request, cookies }) {
	let transaction = await sq.transaction()
	try {
		let bdrId = cookies.get('bdrId')
		if (!bdrId) {
			return json({ code: '97', message: '비정상 적인 접근입니다.' })
		}
		let { itemCd, itemId, itemIdEnc, itemCdEnc, name, fileId, grade, desc, Earns, Usages } = await request.json()
		if (itemCdEnc == null) {
			let newItemCd = await DB.Item.max('itemCd')
			itemCd = newItemCd + 1
		} else {
			itemCd = decode(itemCdEnc)
		}
		let cnt = await prisma.file.count({ where: { itemCd: itemCd, removed: 0 } })
		// let cnt = await DB.Item.count({ where: { itemCd: itemCd, removed: 0 } })
		if (cnt >= 3) {
			return json({ code: '01', message: '동일한 아이템을 3개를 초과하여 만들 수 없습니다.' })
		}
		let item = {}
		// 기존 아이템 수정 - (수정하여 새로운 레코드 생성)
		if (itemIdEnc) {
			itemId = decode(itemIdEnc)
			item = await DB.Item.findOne({ attributes: ['itemCd', 'name', 'fileId', 'grade', 'desc'], where: { itemId: itemId } })
			let newItem = await DB.Item.create({ itemCd: item.itemCd, name: name || item.name, fileId: fileId || item.fileId, grade: grade || item.grade, desc: desc || item.desc }, { transaction })
			for (let i = 0; i < Earns.length; i++) {
				let earn = await DB.Earn.create({ ...Earns[i], itemId: newItem.itemId }, { transaction })
				if (Array.isArray(Earns[i].Crafts)) {
					await DB.Craft.bulkCreate(
						Earns[i].Crafts.map((e) => ({ earnId: earn.id, itemCd: decode(e.itemCd), count: e.count })),
						{ transaction },
					)
				}
			}
			await DB.Usages.bulkCreate(
				Usages.map((e) => ({ itemId: newItem.itemId, resultItemCd: decode(e.resultItemCd) })),
				{ transaction },
			)
		} else {
			// 신규 아이템 생성
		}
		await transaction.commit()
		return json({ code: '00' })
	} catch (err) {
		console.error(err.original || err)
		await transaction.rollback()
		if (typeof err == 'object') {
			return json({ code: '99', ...err })
		} else {
			return json({ code: '99' })
		}
	}
}

export async function POST({ request, cookies }) {
	let bdrId = cookies.get('bdrId')
	if (!bdrId) {
		throw { code: '97', message: '비정상 적인 접근입니다.' }
	}
	const { search } = await request.json()
	if (search == null || search == '') {
		return json({ code: '00', message: '검색단어가 없습니다.' })
	}
	let data = []
	let items = await prisma.item.findMany({
		select: { itemCd: true, name: true, grade: true, itemImg: { select: { imgUrl: true } } },
		where: { name: { contains: search } },
		orderBy: { name: 'asc' },
		// 원래 name 의 length 기준으로 짧은 순으로 정렬하고 싶은데 아직 prisma에서 하는법 모름
		take: 10,
	})
	for (let i = 0; i < items.length; i++) {
		let url = '/' + encode(items[i].itemCd.toString())
		let exists = data.find((e) => e.url == url)
		// 동일 아이템이 이미 검색 되었다면 두번째 이상은 제거
		if (exists) {
			continue
		}
		data.push({
			url: url,
			name: items[i].name,
			grade: items[i].grade,
			imgUrl: items[i].itemImg.imgUrl,
		})
	}
	return json({ code: '00', data })
}
