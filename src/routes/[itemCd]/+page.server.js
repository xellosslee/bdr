import { renderItem } from '$lib/server/renderItem.js'

export async function load({ params, cookies }) {
	let bdrId = cookies.get('bdrId')
	if (!bdrId) {
		bdrId = crypto.randomUUID()
		cookies.set('bdrId', bdrId, { path: '/' })
	}
	return renderItem(params.itemCd)
}
