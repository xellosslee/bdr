import { renderItem } from '$lib/server/renderItem.js'
import { DB_HOST } from '$env/static/private'
import { PUBLIC_TEST_ENV } from '$env/static/public'

export async function load({ params, cookies }) {
	let bdrId = cookies.get('bdrId')
	if (!bdrId) {
		bdrId = crypto.randomUUID()
		cookies.set('bdrId', bdrId, { path: '/' })
	}
	// 패키징 모듈 vite 가 하는 일 요약 =>
	// svelte js css 등의 확장자 파일을 하나의 html js css 파일로
	// DB_HOST는 VITE_ 로 시작하는 ENV 값이 아니어서 undefined
	console.log(import.meta.env.DB_HOST)
	// VITE_ENV_TEST VITE_로 시작하면 import.meta.env. 로 사용 가능 (front.svelte에서도 쓸 수 있음)
	// 이 변수는 .env.local 에 적힌 값으로 대체 되었음
	console.log(import.meta.env.VITE_TEST_ENV)
	// DB_HOST private 서버 사이드 ENV는 위에서 import로 가져와야 함.
	// 이 변수는 .env.local 에 적힌 값은 대체 안됨
	console.log(DB_HOST)
	// PUBLIC_TEST_ENV public 방식은 sveltekit 에서 지원하는 public key 방식
	console.log(PUBLIC_TEST_ENV)

	return renderItem(null, 1)
}
