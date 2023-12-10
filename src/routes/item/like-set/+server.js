import { json } from '@sveltejs/kit'
import prisma from '$lib/prisma.js'
import { encode, decode } from '$lib/util/crypt.js'
import dayjs from 'dayjs'

export async function POST({ request, cookies }) {
	const { itemId, like } = await request.json()
	let bdrId = cookies.get('bdrId')
	if (!bdrId) {
		throw { code: '97', message: '비정상 적인 접근입니다.' }
	}
	prisma.transaction
	let item = await prisma.item.findUnique({ select: { itemId: true, itemCd: true }, where: { itemId: decode(itemId) } })
	if (item) {
		let checkLimit = await prisma.like_history.count({
			where: {
				bdrId: bdrId,
				itemId: item.itemId,
				createdAt: {
					gte: dayjs().startOf('d'),
					lte: dayjs().endOf('d'),
				},
			},
		})
		if (checkLimit >= 3) {
			return json({ code: '01', message: '좋아요, 싫어요는 게시글별 하루 최대 세번만 가능합니다.' })
		}
		let sameItemCds = await prisma.item.findMany({ where: { itemCd: item.itemCd, removed: 0 } })
		if (sameItemCds.length > 1) {
			// priority 비교가 필요한 경우
			console.log(sameItemCds)
			sameItemCds.forEach((e) => {
				if (e.itemId == item.itemId) {
					e.likeCount += BigInt(like == 1 ? 1 : -1)
				}
			})
			console.log(sameItemCds)
			sameItemCds = sameItemCds.sort((a, b) => (a.likeCount < b.likeCount ? 1 : -1))
			console.log(sameItemCds[0])
			await prisma.$transaction([
				// 좋아요 적용
				prisma.item.update({ where: { itemId: BigInt(item.itemId) }, data: { likeCount: { increment: like == 1 ? 1 : -1 } } }),
				// 본인 외 priority 0으로
				prisma.item.updateMany({ where: { itemCd: item.itemCd }, data: { priority: 0 } }),
				// 가장 높은 아이템 priority 1로
				prisma.item.update({ where: { itemId: sameItemCds[0].itemId }, data: { priority: 1 } }),
				prisma.like_history.create({ data: { itemId: item.itemId, bdrId: bdrId } }),
			])
		} else {
			// 단일 아이템이라 priority 비교가 필요 없는 경우
			// 트랜잭션으로 묶어서 수행해야 하는 경우 이렇게 씀
			await prisma.$transaction([
				prisma.item.update({ where: { itemId: item.itemId }, data: { likeCount: { increment: like == 1 ? 1 : -1 } } }),
				prisma.like_history.create({ data: { itemId: item.itemId, bdrId: bdrId } }),
			])
		}
	} else {
		return json({ code: '02', message: '해당 아이템을 찾을 수 없습니다.' })
	}
	return json({ code: '00' })
}
