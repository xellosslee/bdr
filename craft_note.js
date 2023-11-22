const { plugins } = require('restify')
const { Router } = require('restify-router')
const { DB, sq, Op } = require('./mysql')
const ejs = require('ejs')
const fs = require('node:fs/promises')
const { encode, decode } = require('./crypt')
const router = new Router()

const defaultErrorHtml = `<p>일시적으로 장애가 발생할 수 있습니다.</p>
                        <p>잠시 후 다시 시도해 주세요.</p>`
const defJsonError = { status: 500, code: '99', message: '오류가 발생하였습니다.' }
const jsonSuccess = { code: '00', message: '정상입니다.' }
const jsonFailed = { code: '99', message: '비정상입니다.' }

router.use(plugins.bodyParser())
router.use(plugins.queryParser())

async function getFileTimes() {
	return {
		main_js: Math.floor((await fs.stat(__dirname + '/src/js/main.js')).mtimeMs),
		main_css: Math.floor((await fs.stat(__dirname + '/src/css/main.css')).mtimeMs),
	}
}

router.get('/', (req, res, next) => {
	DB.Item.findOne({ attributes: ['itemCd'], order: [sq.fn('rand')] }).then(async (item) => {
		let url = '/item/' + encode(JSON.stringify({ itemCd: item.itemCd }))
		// res.redirect(url, next)
		req.params.itemCd = item.itemCd.toString()
		req.internal = true
		await itemPageIn(req, res)
	})
})

router.get('/item/:itemCd', itemPageIn)

async function itemPageIn(req, res) {
	try {
		let params = { itemCd: req.params.itemCd, search: req.query.search }
		let item = null
		// // 검색단어가 있을 경우
		// if (params.search) {
		// 	let items = await DB.Item.findAll({
		// 		include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
		// 		where: { name: { [Op.like]: '%' + params.search + '%' }, removed: 0 },
		// 	})
		// 	// 검색 결과 맵핑
		// 	item = items[0]
		// }
		// 운영에서는 숫자 조회 불가능하게 방지
		// 단, 랜덤 조회 일때에는 itemCd로 조회 시도
		if (req.internal || (!item && process.env.NODE_ENV != 'prod')) {
			if (!Number.isNaN(Number(params.itemCd))) {
				item = await DB.Item.findOne({
					include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }, { model: DB.Earn }, { model: DB.Usages }],
					where: { itemCd: Number(params.itemCd), removed: 0 },
					order: [['likeCount', 'desc']],
				})
			}
		}
		if (!item) {
			try {
				let data = JSON.parse(decode(params.itemCd))
				// console.debug(params.itemCd, decode(params.itemCd), data)
				params.itemCd = data.itemCd
				params.search = data.search
				item = await DB.Item.findOne({
					include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }, { model: DB.Earn }, { model: DB.Usages }],
					where: { itemCd: params.itemCd, removed: 0 },
					order: [['likeCount', 'desc']],
					logging: false,
				})
			} catch (err) {
				if (!item) {
					throw {}
				}
			}
		}
		for (let i = 0; i < item.Earns.length; i++) {
			let craftListTemp = item.Earns[i].craftList
			if (item.Earns[i].type == 'craft') {
				let items = await DB.Item.findAll({
					attributes: ['itemId', 'itemCd', 'name'],
					include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
					where: { itemId: craftListTemp.map((e) => e.itemId) },
					logging: false,
				})
				for (let j = 0; j < items.length; j++) {
					let idx = craftListTemp.findIndex((e) => e.itemId == items[j].itemId)
					if (idx == -1) {
						console.error('cannot found craft item !!!')
						break
					}
					craftListTemp[idx].name = items[j].name
					craftListTemp[idx].url = '/item/' + encode(JSON.stringify({ itemCd: items[j].itemCd }))
					craftListTemp[idx].imgUrl = items[j].itemImage.imgUrl
				}
			}
		}
		// let usagesList = []
		for (let i = 0; i < item.Usages.length; i++) {
			let e = item.Usages[i]
			let url = '/item/' + encode(JSON.stringify({ itemCd: e.resultItem.itemCd }))
			// console.log(itemId, encoded, url)
			e.resultItemCd = e.resultItem.itemCd
			e.resultItemName = e.resultItem.name
			e.url = url
			e.imgUrl = e.resultItem.itemImage.imgUrl
		}
		// console.log(item.dataValues)
		let html = await ejs.renderFile('src/main.ejs', { item, ...(await getFileTimes()) })
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

// 자동완성용 검색
router.post('/item/fast/search', plugins.bodyParser(), async (req, res) => {
	try {
		req.body = JSON.parse(req.body)
		if (req.body.search == '') {
			throw {}
		}
		let data = []
		let items = await DB.Item.findAll({
			attributes: ['itemId', 'name'],
			include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
			where: { name: { [Op.like]: '%' + req.body.search + '%' }, removed: 0 },
			limit: 10,
		})
		for (let i = 0; i < items.length; i++) {
			// console.debug(items[i])
			data.push({
				itemUrl: '/item/' + encode(JSON.stringify({ itemId: items[i].itemId })),
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
		console.log(req.body)
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

module.exports = router
