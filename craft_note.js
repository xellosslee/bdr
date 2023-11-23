const { plugins } = require('restify')
const { Router } = require('restify-router')
const { DB, sq, Op } = require('./mysql')
const ejs = require('ejs')
const fs = require('node:fs/promises')
const { encode, decode } = require('./crypt')
const router = new Router()
const uuid4 = require('uuid4')
const dayjs = require('dayjs')

const defaultErrorHtml = `<p>일시적으로 장애가 발생할 수 있습니다.</p>
                        <p>잠시 후 다시 시도해 주세요.</p>`
const defJsonError = { status: 200, code: '99', message: '오류가 발생하였습니다.' }
const jsonSuccess = { code: '00', message: '정상입니다.' }
const jsonFailed = { code: '99', message: '비정상입니다.' }

router.use(plugins.bodyParser())
router.use(plugins.queryParser())

function toCookieObj(cookieInput) {
	if (typeof cookieInput != 'string') {
		console.error('toCookieObj parameter must string')
		return null
	}
	let arr = cookieInput.split(';')
	let result = {}
	if (Array.isArray(arr)) {
		arr.forEach((e) => {
			result[e.split('=')[0]] = e.split('=')[1]
		})
		return result
	} else {
		return null
	}
}

async function getFileTimes() {
	return {
		main_js: Math.floor((await fs.stat(__dirname + '/src/js/main.js')).mtimeMs),
		main_css: Math.floor((await fs.stat(__dirname + '/src/css/main.css')).mtimeMs),
	}
}

router.get('/', (req, res, next) => {
	DB.Item.findOne({ attributes: ['itemCd'], order: [sq.fn('rand')] }).then(async (item) => {
		let url = '/item/' + encode(item.itemCd)
		// res.redirect(url, next)
		req.params.itemCd = item.itemCd.toString()
		req.internal = true
		await itemPageIn(req, res)
	})
})

router.get('/item/:itemCd', itemPageIn)

async function itemPageIn(req, res) {
	try {
		let params = { itemCd: req.params.itemCd }
		let items = null
		// 운영에서는 숫자 조회 불가능하게 방지
		// 단, 랜덤 조회 일때에는 itemCd로 조회 시도
		if (req.internal || process.env.NODE_ENV != 'prod') {
			if (!Number.isNaN(Number(params.itemCd))) {
				items = await DB.Item.findAll({
					include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }, { model: DB.Earn }, { model: DB.Usages }],
					where: { itemCd: Number(params.itemCd), removed: 0 },
					order: [['likeCount', 'desc']],
				})
			}
		}
		if (!items) {
			try {
				// console.debug(params.itemCd, decode(params.itemCd), data)
				params.itemCd = decode(params.itemCd)
				items = await DB.Item.findAll({
					include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }, { model: DB.Earn }, { model: DB.Usages }],
					where: { itemCd: params.itemCd, removed: 0 },
					order: [['likeCount', 'desc']],
				})
			} catch (err) {
				console.error(err)
				throw { code: '01' }
			}
		}
		if (!items) {
			throw { code: '02' }
		}
		for (let x = 0; x < items.length; x++) {
			let item = items[x]
			for (let i = 0; i < item.Earns.length; i++) {
				let craftListTemp = item.Earns[i].craftList
				if (item.Earns[i].type == 'craft') {
					let items = await DB.Item.findAll({
						attributes: ['itemId', 'itemCd', 'name', 'likeCount'],
						include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
						where: { itemCd: craftListTemp.map((e) => e.itemCd), removed: 0 },
					})
					for (let j = 0; j < craftListTemp.length; j++) {
						let filterItems = items.filter((e) => e.itemCd == craftListTemp[j].itemCd)
						if (filterItems.length == 0) {
							console.error('cannot found craft item !!!')
							break
						}
						// 동일 itemCd 중 가장 likeCount가 높은 항목을 earns에서 링크 표시
						filterItems = filterItems.sort((a, b) => b.likeCount - a.likeCount)
						// console.log(filterItems)
						craftListTemp[j].name = filterItems[0].name
						craftListTemp[j].url = '/item/' + encode(filterItems[0].itemCd.toString())
						craftListTemp[j].imgUrl = filterItems[0].itemImage?.imgUrl
					}
				}
			}
			// let usagesList = []
			for (let i = 0; i < item.Usages.length; i++) {
				let e = item.Usages[i]
				// console.log(itemId, encoded, url)
				e.resultItemCd = e.resultItem.itemCd
				e.resultItemName = e.resultItem.name
				e.url = '/item/' + encode(e.resultItem.itemCd.toString())
				e.imgUrl = e.resultItem.itemImage.imgUrl
			}
			item.dataValues.itemIdEnc = encode(item.dataValues.itemId.toString())
			item.dataValues.itemCdEnc = encode(item.dataValues.itemCd.toString())
		}
		let cookie
		if (req.headers.cookie) {
			cookie = toCookieObj(req.headers.cookie)
		}
		if (cookie?.bdrId == null) {
			let maxAge = 1000 * 60 * 60 * 24 * 365
			res.header('Set-Cookie', `bdrId=${uuid4()}; Max-age=${maxAge}; HttpOnly;`)
		}
		// console.log(items.map((e) => e.dataValues))
		let html = await ejs.renderFile('src/main.ejs', { items: items.map((e) => e.dataValues), ...(await getFileTimes()) })
		res.writeHead(200, { 'content-length': Buffer.byteLength(html), 'content-type': 'text/html' })
		res.write(html)
		res.end()
	} catch (err) {
		console.error(err)
		let html = await ejs.renderFile('src/error.ejs', { errorHtml: defaultErrorHtml, ...err })
		res.writeHead(200, { 'content-length': Buffer.byteLength(html), 'content-type': 'text/html' })
		res.write(html)
		res.end()
	}
}

// router.post('/item/append', itemListFromItemCd)

// async function itemListFromItemCd(req, res) {
// 	try {
// 		let itemId = decode(req.body.itemId)
// 		let itemCd = req.body.itemCd
// 		let items = null
// 		// 운영에서는 숫자 조회 불가능하게 방지
// 		// 단, 랜덤 조회 일때에는 itemCd로 조회 시도
// 		if (req.internal || process.env.NODE_ENV != 'prod') {
// 			if (!Number.isNaN(Number(itemCd))) {
// 				items = await DB.Item.findAll({
// 					include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }, { model: DB.Earn }, { model: DB.Usages }],
// 					where: { itemCd: Number(itemCd), itemId: { [Op.ne]: itemId }, removed: 0 },
// 				})
// 			}
// 		}
// 		if (!items) {
// 			try {
// 				let data = decode(itemCd)
// 				itemCd = data
// 				items = await DB.Item.findAll({
// 					include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }, { model: DB.Earn }, { model: DB.Usages }],
// 					where: { itemCd: Number(itemCd), itemId: { [Op.ne]: itemId }, removed: 0 },
// 				})
// 			} catch (err) {
// 				throw { code: '01' }
// 			}
// 		}
// 		if (!items) {
// 			throw { code: '02' }
// 		}
// 		items.forEach(async (item) => {
// 			for (let i = 0; i < item.Earns.length; i++) {
// 				let craftListTemp = item.Earns[i].craftList
// 				if (item.Earns[i].type == 'craft') {
// 					let items = await DB.Item.findAll({
// 						attributes: ['itemId', 'itemCd', 'name'],
// 						include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
// 						where: { itemId: craftListTemp.map((e) => e.itemId) },
// 					})
// 					for (let j = 0; j < items.length; j++) {
// 						let idx = craftListTemp.findIndex((e) => e.itemId == items[j].itemId)
// 						if (idx == -1) {
// 							console.error('cannot found craft item !!!')
// 							break
// 						}
// 						craftListTemp[idx].name = items[j].name
// 						craftListTemp[idx].url = '/item/' + encode(items[j].itemCd.toString())
// 						craftListTemp[idx].imgUrl = items[j].itemImage.imgUrl
// 					}
// 				}
// 			}
// 			// let usagesList = []
// 			for (let i = 0; i < item.Usages.length; i++) {
// 				let e = item.Usages[i]
// 				let url = '/item/' + encode(e.resultItem.itemCd.toString())
// 				// console.log(itemId, encoded, url)
// 				e.resultItemCd = e.resultItem.itemCd
// 				e.resultItemName = e.resultItem.name
// 				e.url = url
// 				e.imgUrl = e.resultItem.itemImage.imgUrl
// 			}
// 		})
// 		// console.log(item.dataValues)
// 		res.send(200, { ...jsonSuccess, data: items })
// 	} catch (err) {
// 		console.error(err)
// 		res.send(200, { ...jsonFailed, ...err })
// 	}
// }

// 자동완성용 검색
router.post('/item/fast/search', async (req, res) => {
	try {
		if (req.body.search == null || req.body.search == '') {
			throw { message: '검색단어가 없습니다.' }
		}
		let data = []
		let items = await DB.Item.findAll({
			attributes: ['itemCd', 'name'],
			include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
			where: { name: { [Op.like]: '%' + req.body.search + '%' }, removed: 0 },
			limit: 10,
		})
		for (let i = 0; i < items.length; i++) {
			let url = '/item/' + encode(items[i].itemCd.toString())
			let exists = data.find((e) => e.itemUrl == url)
			// 동일 아이템이 이미 검색 되었다면 두번째 이상은 제거
			if (exists) {
				continue
			}
			data.push({
				itemUrl: url,
				name: items[i].name,
				imgUrl: items[i].itemImage.imgUrl,
			})
		}
		res.send(200, { ...jsonSuccess, data })
	} catch (err) {
		console.error(err)
		res.send(403, jsonFailed)
	}
})

// 데이터 저장
router.post('/item/put', async function (req, res) {
	let transaction = await sq.transaction()
	try {
		let cnt = await DB.Item.count({ where: { itemCd: req.body.item.itemCd, removed: 0 } })
		if (cnt >= 3) {
			throw { code: '01', message: '3개 이상 동일한 아이템을 생성할 순 없습니다.' }
		}
		if (req.body.item.itemId != null) {
			await DB.Item.upsert(req.body.item, { where: { itemId: req.body.item.itemId }, transaction })
			await DB.Earn.destroy({ where: { itemId: req.body.item.itemId }, transaction })
			await DB.Earn.bulkCreate(
				req.body.item.earnList.map((e) => ({ ...e, itemId: req.body.item.itemId })),
				{ transaction },
			)
			await DB.Usages.destroy({ where: { itemId: req.body.item.itemId }, transaction })
			await DB.Usages.bulkCreate(
				req.body.item.usageList.map((e) => ({ ...e, itemId: req.body.item.itemId })),
				{ transaction },
			)
		} else {
			let item = await DB.Item.create(req.body.item, { transaction })
			if (item.itemId) {
				req.body.item.itemId = item.itemId
			}
			await DB.Earn.bulkCreate(
				req.body.item.earnList.map((e) => ({ ...e, itemId: req.body.item.itemId })),
				{ transaction },
			)
			await DB.Usages.bulkCreate(
				req.body.item.usageList.map((e) => ({ ...e, itemId: req.body.item.itemId })),
				{ transaction },
			)
		}
		await transaction.commit()
		res.send(200, { ...jsonSuccess })
	} catch (err) {
		console.error(err.original || err)
		await transaction.rollback()
		if (typeof err == 'object') {
			res.send({ ...defJsonError, ...err })
		} else {
			res.send(defJsonError)
		}
	}
})

// 좋아요, 싫어요 저장
router.post('/item/like-set', async (req, res) => {
	try {
		let cookie = toCookieObj(req.headers.cookie)
		if (!cookie.bdrId) {
			throw { code: '97', message: '비정상 적인 접근입니다.' }
		}
		let item = await DB.Item.findOne({
			attributes: ['itemId'],
			where: { itemId: decode(req.body.itemId) },
		})
		if (item) {
			let checkOver = await DB.LikeHistory.count({
				where: { bdrId: cookie.bdrId, itemId: item.itemId, createdAt: { [Op.between]: [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')] } },
			})
			if (checkOver > 0) {
				throw { code: '01', message: '좋아요, 싫어요는 게시글별 하루 한번만 가능합니다.' }
			}
			await item.increment({ likeCount: req.body.like == '1' ? 1 : -1 })
			await DB.LikeHistory.create({ bdrId: cookie.bdrId, itemId: item.itemId })
		} else {
			throw { code: '02', message: '해당 아이템을 찾을 수 없습니다.' }
		}
		res.send(200, { ...jsonSuccess })
	} catch (err) {
		console.error(err)
		res.send(200, { ...jsonFailed, ...err })
	}
})

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

module.exports = router
