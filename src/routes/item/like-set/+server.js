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
	let item = await prisma.item.findUnique({ select: { itemId: true }, where: { itemId: decode(itemId) } })
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
		if (checkLimit > 3) {
			return json({ code: '01', message: '좋아요, 싫어요는 게시글별 하루 최대 세번만 가능합니다.' })
		}
		// 트랜잭션으로 묶어서 수행해야 하는 경우 이렇게 씀
		await prisma.$transaction([prisma.item.update({ where: { itemId: item.itemId }, data: { likeCount: { increment: 1 } } }), prisma.like_history.create({ data: { itemId: item.itemId, bdrId: bdrId } })])
	} else {
		return json({ code: '02', message: '해당 아이템을 찾을 수 없습니다.' })
	}
	return json({ code: '00' })
}
