const { plugins } = require('restify')
const { Router } = require('restify-router')
const { DB, sq, Op } = require('./mysql')
const ejs = require('ejs')
const { encode, decode } = require('./crypt')
const router = new Router()

const defaultErrorHtml = `<p>일시적으로 장애가 발생할 수 있습니다.</p>
                        <p>잠시 후 다시 시도해 주세요.</p>`
const defJsonError = { status: 500, code: '99', message: '오류가 발생하였습니다.' }
const jsonSuccess = { code: '00', message: '정상입니다.' }
const jsonFailed = { code: '99', message: '비정상입니다.' }

router.use(plugins.bodyParser())
router.use(plugins.queryParser())

router.get('/', (req, res, next) => {
	DB.Item.findOne({ attributes: ['itemId'], order: [sq.fn('rand')] }).then((item) => {
		let encoded = encode(JSON.stringify({ itemId: item.itemId }))
		let url = '/item/' + encoded
		// res.redirect(url, next)
		req.params.itemId = item.itemId
		itemPageIn(req, res)
	})
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

router.get('/item/:itemId', itemPageIn)

async function itemPageIn(req, res) {
	try {
		let params = { itemId: req.params.itemId, search: req.query.search }
		let item = null
		// 검색단어가 있을 경우
		if (params.search) {
			let items = await DB.Item.findAll({
				include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
				where: { name: { [Op.like]: '%' + params.search + '%' }, removed: 0 },
			})
			// 검색 결과 맵핑
			item = items[0]
		}
		//
		if (!item) {
			if (!Number.isNaN(Number(params.itemId))) {
				item = await DB.Item.findOne({
					include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
					where: { itemId: Number(params.itemId), removed: 0 },
				})
			}
		}
		if (!item) {
			try {
				let data = JSON.parse(decode(params.itemId))
				console.debug(data)
				params.itemId = data.itemId
				params.search = data.search
				item = await DB.Item.findOne({
					include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
					where: { itemId: params.itemId, removed: 0 },
					logging: false,
				})
			} catch (err) {
				if (!item) {
					throw {}
				}
			}
		}
		let earn = await DB.Earn.findAll({ where: { itemId: item.itemId }, logging: false })
		// console.log(earn)
		for (let i = 0; i < earn.length; i++) {
			let craftListTemp = earn[i].craftList
			if (earn[i].type == 'craft') {
				let items = await DB.Item.findAll({
					attributes: ['itemId', 'name'],
					where: { itemId: craftListTemp.map((e) => e.itemId) },
					logging: false,
				})
				// console.dir(items[i])

				for (let j = 0; j < items.length; j++) {
					let idx = craftListTemp.findIndex((e) => e.itemId == items[j].itemId)
					if (idx == -1) {
						console.error('cannot found craft item !!!')
						break
					}
					craftListTemp[idx].name = items[j].name
					craftListTemp[idx].url = '/item/' + encode(JSON.stringify({ itemId: items[j].itemId }))
				}
			}
		}
		let usages = await DB.Usages.findAll({
			include: [{ model: DB.Item, as: 'resultItem', attributes: ['itemId', 'name'], where: { removed: 0 } }],
			where: { itemId: item.itemId },
			logging: false,
		})
		let usagesList = []
		for (let i = 0; i < usages.length; i++) {
			let encoded = encode(JSON.stringify({ itemId: usages[i].resultItem.itemId }))
			let url = '/item/' + encoded
			// console.log(itemId, encoded, url)
			// usages[i].setDataValue('url', url)
			usagesList.push({
				resultItemId: usages[i].resultItem.itemId,
				resultItemName: usages[i].resultItem.name,
				url: url,
			})
		}

		let html = await ejs.renderFile('src/main.ejs', { item, earn, usages: usagesList })
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
			console.log(items[i])
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

module.exports = router
