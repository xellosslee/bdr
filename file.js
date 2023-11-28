const { plugins } = require('restify')
const { Router } = require('restify-router')
const { DB, sq, Op } = require('./mysql')
const fs = require('node:fs/promises')
const router = new Router()

const jsonSuccess = { code: '00', message: '정상입니다.' }
const jsonFailed = { code: '99', message: '비정상입니다.' }

router.use(plugins.bodyParser())
router.use(plugins.queryParser())

// 이미지 파일 목록
router.post('/file/list', async (req, res) => {
	try {
		let limit = 10
		let offset = 0
		if (req.body?.page && Number.isInteger(req.body.page)) {
			offset = (req.body.page - 1) * limit
		}
		let data = await DB.File.findAndCountAll({
			where: req.body.name ? { name: { [Op.like]: '%' + req.body.name + '%' } } : {},
			offset,
			limit,
			order: [['fileId', 'DESC']],
		})
		res.send(200, { ...jsonSuccess, data })
	} catch (err) {
		console.error(err)
		res.send(200, { ...jsonFailed, ...err })
	}
})

// 이미지 등록
router.post('/file/put', async (req, res) => {
	let transaction = await sq.transaction()
	try {
		if (!req?.files?.image) {
			throw { code: '01', message: '첨부파일이 없습니다.' }
		}
		if (req.files.image.type != 'image/png') {
			throw { code: '02', message: 'png 파일만 업로드 가능합니다.' }
		}
		if (req.files.image.size >= 10240) {
			throw { code: '02', message: '10kb 미만의 파일만 업로드 가능합니다.' }
		}
		if (!req.body.name) {
			throw { code: '02', message: '이미지 명칭은 필수입니다.' }
		}
		let data = await DB.File.create({ name: req.body.name, imgUrl: '/images/items/' + req.body.name + '.png' }, { transaction })
		if (!data) {
			throw { code: '03', message: '시스템 오류 발생.' }
		}
		await uploadFile(req.files.image, req.body.name + '.png')
		await transaction.commit()
		res.send(200, { ...jsonSuccess, data })
	} catch (err) {
		await transaction.rollback()
		console.error(err)
		res.send(200, { ...jsonFailed, ...err })
	}
})

// 전달 받은 파일 동일한 파일명 check후 rename 진행
async function uploadFile(file, fileName, path = '/uploads/items') {
	try {
		await fs.readFile(`${__dirname}${path}/${fileName}`)
		throw { code: '81', message: '동일한 파일이 있습니다.' }
	} catch (err) {
		if (err.code == '81') {
			throw err
		}
		await fs.rename(file.path, `${__dirname}${path}/${fileName}`)
	}
}

module.exports = router
