import { json } from '@sveltejs/kit'
import { DB, sq, Op } from '$lib/server/mysql.js'
import { encode, decode } from '$lib/util/crypt.js'
import dayjs from 'dayjs'

export async function POST({ request, cookies }) {
	const { itemId, like } = await request.json()
	let bdrId = cookies.get('bdrId')
	if (!bdrId) {
		throw { code: '97', message: '비정상 적인 접근입니다.' }
	}
	let item = await DB.Item.findOne({
		attributes: ['itemId'],
		where: { itemId: decode(itemId) },
	})
	if (item) {
		let checkOver = await DB.LikeHistory.count({
			where: { bdrId: bdrId, itemId: item.itemId, createdAt: { [Op.between]: [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')] } },
		})
		if (checkOver > 0) {
			return json({ code: '01', message: '좋아요, 싫어요는 게시글별 하루 한번만 가능합니다.' })
		}
		await item.increment({ likeCount: like == '1' ? 1 : -1 })
		await DB.LikeHistory.create({ bdrId: bdrId, itemId: item.itemId })
	} else {
		return json({ code: '02', message: '해당 아이템을 찾을 수 없습니다.' })
	}
	return json({ code: '00' })
}