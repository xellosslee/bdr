import { json } from '@sveltejs/kit'
import { DB, sq, Op } from '$lib/server/mysql.js'
import { encode, decode } from '$lib/util/crypt.js'

export async function POST({ request, cookies }) {
	const { search } = await request.json()
	if (search == null || search == '') {
		return json({ code: '00', message: '검색단어가 없습니다.' }, { status: 200 })
	}
	let data = []
	let items = await DB.Item.findAll({
		attributes: ['itemCd', 'name', 'grade'],
		include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
		where: { name: { [Op.like]: '%' + search + '%' }, removed: 0 },
		limit: 10,
	})
	for (let i = 0; i < items.length; i++) {
		let url = '/' + encode(items[i].itemCd.toString())
		let exists = data.find((e) => e.itemUrl == url)
		// 동일 아이템이 이미 검색 되었다면 두번째 이상은 제거
		if (exists) {
			continue
		}
		data.push({
			itemUrl: url,
			name: items[i].name,
			grade: items[i].grade,
			imgUrl: items[i].itemImage.imgUrl,
			itemCd: items[i].itemCd,
		})
	}
	return json({ code: '00', data }, { status: 200 })
}
