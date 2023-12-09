import { json } from '@sveltejs/kit'
import prisma from '$lib/prisma.js'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function PUT({ request, cookies }) {
	let form = await request.formData()
	const image = form.get('image')
	const name = form.get('name')
	const now = new Date()
	const timestamp = now.getTime()
	if (!image) {
		throw { code: '01', message: '첨부파일이 없습니다.' }
	}
	if (image.type != 'image/png') {
		throw { code: '02', message: 'png 파일만 업로드 가능합니다.' }
	}
	if (image.size >= 10240) {
		throw { code: '02', message: '10kb 미만의 파일만 업로드 가능합니다.' }
	}
	if (!name) {
		throw { code: '02', message: '이미지 명칭은 필수입니다.' }
	}
	// 파일을 저장할 경로를 지정합니다.
	const uploadPath = path.join(process.cwd(), 'static', 'items', `${timestamp}.${name}.png`)
	// 파일을 서버 폴더에 저장합니다.
	const imageBufferData = Buffer.from(await image.arrayBuffer())
	await writeFile(uploadPath, imageBufferData)

	let data = await prisma.file.create({ name: name, imgUrl: `/items/${timestamp}.${name}.png` })
	if (!data) {
		throw { code: '03', message: '시스템 오류 발생.' }
	}
	return json({ code: '00', data })
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
	let data = await prisma.file.findMany({
		select: { fileId: !0, imgUrl: !0, name: !0 },
		where: { name: { contains: search } },
		orderBy: { name: 'asc' },
		// 원래 name 의 length 기준으로 짧은 순으로 정렬하고 싶은데 아직 prisma에서 하는법 모름
		take: 10,
	})
	return json({ code: '00', data })
}
