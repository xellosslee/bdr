import { json } from '@sveltejs/kit'
import prisma from '$lib/prisma.js'
import { encode, decode } from '$lib/util/crypt.js'

export async function PUT({ request, cookies }) {
	try {
		let bdrId = cookies.get('bdrId')
		if (!bdrId) {
			return json({ code: '97', message: '비정상 적인 접근입니다.' })
		}
		let { itemCd, itemId, itemIdEnc, itemCdEnc, name, fileId, grade, desc, Earns, Usages } = await request.json()
		if (itemCdEnc == null) {
			let newItemCd = await prisma.item.aggregate({ _max: { itemCd: true } })
			itemCd = Number(newItemCd._max.itemCd) + 1
		} else {
			itemCd = decode(itemCdEnc)
		}
		let cnt = await prisma.item.count({ where: { itemCd: itemCd, removed: 0 } })
		if (cnt >= 3) {
			return json({ code: '01', message: '동일한 아이템을 3개를 초과하여 만들 수 없습니다.' })
		}
		let item = {}
		// 기존 아이템 수정이면 기존 아이템 레코드를 참조
		if (itemIdEnc) {
			itemId = decode(itemIdEnc)
			item = await prisma.item.findUnique({ select: { itemCd: true, name: true, fileId: true, grade: true, desc: true }, where: { itemId: itemId } })
		}
		// 최종 아이템 생성
		let itemResult = await prisma.item.create({
			data: {
				itemCd: itemCd || item.itemCd,
				name: name || item.name,
				fileId: fileId || item.fileId,
				grade: grade || item.grade,
				desc: desc || item.desc,
				likeCount: 0,
				removed: 0,
				usages: {
					createMany: { data: Usages.map((e) => ({ resultItemCd: decode(e.resultItemCd) })) },
				},
			},
		})
		// createMany 내부에 create나 createMany 가 중첩하여 존재 할 수 없음
		// 따라서 루프 돌면서 insert 진행해야 함.
		for (let i = 0; i < Earns.length; i++) {
			let e = Earns[i]
			await prisma.earn.create({
				data: {
					itemId: itemResult.itemId,
					type: e.type,
					work: e.work,
					path: e.path,
					crafts: {
						createMany: {
							data: e.Crafts.map((t) => ({
								itemCd: decode(t.itemCd),
								count: t.count,
							})),
						},
					},
				},
			})
		}
		console.log(itemResult)
		// await transaction.commit()
		return json({ code: '00' })
	} catch (err) {
		console.error(err.original || err)
		// await transaction.rollback()
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
