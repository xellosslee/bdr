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

// router.get('/', (req, res, next) => {
// 	DB.Item.findOne({ attributes: ['itemCd'], order: [sq.fn('rand')] }).then(async (item) => {
// 		req.params.itemCd = item.itemCd.toString()
// 		req.internal = true
// 		await itemPageIn(req, res)
// 	})
// })

// router.get('/item/:itemCd', itemPageIn)

// async function itemPageIn(req, res) {
// 	try {
// 		let params = { itemCd: req.params.itemCd }
// 		let items = null
// 		let itemIncludeArray = [
// 			{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] },
// 			{
// 				model: DB.Earn,
// 				include: [
// 					{
// 						model: DB.Craft,
// 						include: [
// 							{
// 								model: DB.Item,
// 								as: 'craftItems',
// 								attributes: ['name', 'itemCd', 'fileId'],
// 								include: [{ model: DB.File, attributes: ['imgUrl'], as: 'itemImage' }],
// 								where: { removed: 0 },
// 							},
// 						],
// 					},
// 				],
// 			},
// 			{
// 				model: DB.Usages,
// 				include: [
// 					{
// 						model: DB.Item,
// 						as: 'usageItems',
// 						attributes: ['name', 'itemCd', 'fileId'],
// 						include: [{ model: DB.File, attributes: ['imgUrl'], as: 'itemImage' }],
// 						order: [
// 							['likeCount', 'desc'],
// 							['name', 'asc'],
// 						],
// 						where: { removed: 0 },
// 						limit: 1,
// 					},
// 				],
// 			},
// 		]
// 		// 운영에서는 숫자 조회 불가능하게 방지
// 		// 단, 랜덤 조회 일때에는 itemCd로 조회 시도
// 		if (req.internal || process.env.NODE_ENV != 'prod') {
// 			if (!Number.isNaN(Number(params.itemCd))) {
// 				items = await DB.Item.findAll({
// 					include: itemIncludeArray,
// 					where: { itemCd: Number(params.itemCd), removed: 0 },
// 					order: [['likeCount', 'desc']],
// 				})
// 			}
// 		}
// 		if (!items) {
// 			try {
// 				// console.debug(params.itemCd, decode(params.itemCd), data)
// 				params.itemCd = decode(params.itemCd)
// 				items = await DB.Item.findAll({
// 					include: itemIncludeArray,
// 					where: { itemCd: params.itemCd, removed: 0 },
// 					order: [['likeCount', 'desc']],
// 				})
// 				console.debug(params.itemCd)
// 			} catch (err) {
// 				console.error(err)
// 				throw { code: '01' }
// 			}
// 		}
// 		if (!items) {
// 			throw { code: '02' }
// 		}
// 		for (let x = 0; x < items.length; x++) {
// 			let item = items[x]
// 			for (let i = 0; i < item.Earns.length; i++) {
// 				for (let x = 0; x < item.Earns[i].Crafts.length; x++) {
// 					if (item.Earns[i].Crafts[x].craftItems.length > 0) {
// 						item.Earns[i].Crafts[x].craftItems[0].url = '/' + encode(item.Earns[i].Crafts[x].craftItems[0].itemCd.toString())
// 						item.Earns[i].Crafts[x].craftItems[0].imgUrl = item.Earns[i].Crafts[x].craftItems[0]?.itemImage?.imgUrl
// 					}
// 				}
// 			}
// 			for (let i = 0; i < item.Usages.length; i++) {
// 				if (item.Usages[i].usageItems.length > 0) {
// 					// console.debug(item.Usages[i].usageItems[0])
// 					item.Usages[i].usageItems[0].url = '/' + encode(item.Usages[i].usageItems[0].itemCd.toString())
// 					item.Usages[i].usageItems[0].imgUrl = item.Usages[i].usageItems[0]?.itemImage?.imgUrl
// 				}
// 			}
// 			item.dataValues.itemIdEnc = encode(item.dataValues.itemId.toString())
// 			item.dataValues.itemCdEnc = encode(item.dataValues.itemCd.toString())
// 		}
// 		let cookie
// 		if (req.headers.cookie) {
// 			cookie = toCookieObj(req.headers.cookie)
// 		}
// 		if (cookie?.bdrId == null) {
// 			let maxAge = 1000 * 60 * 60 * 24 * 365
// 			res.header('Set-Cookie', `bdrId=${uuid4()}; Max-age=${maxAge}; HttpOnly;`)
// 		}
// 		let resultItems = items.map((e) => e.dataValues)
// 		// console.log(resultItems)
// 		// console.log(resultItems[0].Earns[0].dataValues)
// 		// console.log(resultItems[0].Earns[0].dataValues.Crafts[0].craftItem[0])
// 		// console.log(resultItems[0].Usages[0].dataValues.usageItems.sort((a, b) => b.likeCount - a.likeCount))
// 		// console.log(resultItems[0].Usages[0].dataValues.usageItems[0])
// 		let html = await ejs.renderFile('src/main.ejs', { items: resultItems, ...(await getFileTimes()) }, { async: 1 })
// 		res.writeHead(200, { 'content-length': Buffer.byteLength(html), 'content-type': 'text/html' })
// 		res.write(html)
// 		res.end()
// 	} catch (err) {
// 		console.error(err)
// 		let html = await ejs.renderFile('src/error.ejs', { errorHtml: defaultErrorHtml, ...err })
// 		res.writeHead(200, { 'content-length': Buffer.byteLength(html), 'content-type': 'text/html' })
// 		res.write(html)
// 		res.end()
// 	}
// }

router.post('/items/get', async (req, res) => {
	let item = await DB.Item.findOne({ attributes: ['itemCd'], order: [sq.fn('rand')] })
	req.params.itemCd = item.itemCd
	req.internal = true
	await itemJsonGet(req, res)
})

router.post('/items/get/:itemCd', itemJsonGet)

async function itemJsonGet(req, res) {
	try {
		let params = { itemCd: req.params.itemCd }
		let items = null
		let itemIncludeArray = [
			{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] },
			{
				model: DB.Earn,
				include: [
					{
						model: DB.Craft,
						include: [
							{
								model: DB.Item,
								as: 'craftItems',
								attributes: ['name', 'itemCd', 'fileId', 'grade'],
								include: [{ model: DB.File, attributes: ['imgUrl'], as: 'itemImage' }],
								where: { removed: 0 },
							},
						],
					},
				],
			},
			{
				model: DB.Usages,
				include: [
					{
						model: DB.Item,
						as: 'usageItems',
						attributes: ['name', 'itemCd', 'fileId', 'grade'],
						include: [{ model: DB.File, attributes: ['imgUrl'], as: 'itemImage' }],
						order: [
							['likeCount', 'desc'],
							['name', 'asc'],
						],
						where: { removed: 0 },
						limit: 1,
					},
				],
			},
		]
		// 운영에서는 숫자 조회 불가능하게 방지
		// 단, 랜덤 조회 일때에는 itemCd로 조회 시도
		if (req.internal || process.env.NODE_ENV != 'prod') {
			if (!Number.isNaN(Number(params.itemCd))) {
				items = await DB.Item.findAll({
					include: itemIncludeArray,
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
					include: itemIncludeArray,
					where: { itemCd: params.itemCd, removed: 0 },
					order: [['likeCount', 'desc']],
				})
				console.debug(params.itemCd)
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
				for (let x = 0; x < item.Earns[i].Crafts.length; x++) {
					if (item.Earns[i].Crafts[x].craftItems.length > 0) {
						// item.Earns[i].Crafts[x].craftItems[0].url = '/' + encode(item.Earns[i].Crafts[x].craftItems[0].itemCd.toString())
						// item.Earns[i].Crafts[x].craftItems[0].imgUrl = item.Earns[i].Crafts[x].craftItems[0]?.itemImage?.imgUrl
						item.Earns[i].Crafts[x].craftItems[0].setDataValue('url', '/' + encode(item.Earns[i].Crafts[x].craftItems[0].itemCd.toString()))
						item.Earns[i].Crafts[x].craftItems[0].setDataValue('imgUrl', item.Earns[i].Crafts[x].craftItems[0]?.itemImage?.imgUrl)
					}
				}
			}
			for (let i = 0; i < item.Usages.length; i++) {
				if (item.Usages[i].usageItems.length > 0) {
					// console.debug(item.Usages[i].usageItems[0])
					// item.Usages[i].usageItems[0].url = '/' + encode(item.Usages[i].usageItems[0].itemCd.toString())
					// item.Usages[i].usageItems[0].imgUrl = item.Usages[i].usageItems[0]?.itemImage?.imgUrl
					item.Usages[i].usageItems[0].setDataValue('url', '/' + encode(item.Usages[i].usageItems[0].itemCd.toString()))
					item.Usages[i].usageItems[0].setDataValue('imgUrl', item.Usages[i].usageItems[0]?.itemImage?.imgUrl)
				}
			}
			item.dataValues.itemIdEnc = encode(item.dataValues.itemId.toString())
			item.dataValues.itemCdEnc = encode(item.dataValues.itemCd.toString())
		}
		let cookie
		if (req.headers.cookie) {
			cookie = toCookieObj(req.headers.cookie)
		}
		let resultItems = items.map((e) => ({ ...e.dataValues, itemId: undefined, fileId: undefined, itemCd: undefined }))
		let bdrId
		if (req.headers['bdr-id'] == null || req.headers['bdr-id'] == 'null') {
			bdrId = uuid4()
		}
		res.send(200, { ...jsonSuccess, data: resultItems, bdrId })
	} catch (err) {
		console.error(err)
		res.send(400, { ...jsonFailed })
	}
}

// 자동완성용 검색
router.post('/item/fast/search', async (req, res) => {
	try {
		if (req.body.search == null || req.body.search == '') {
			throw { message: '검색단어가 없습니다.' }
		}
		let data = []
		let items = await DB.Item.findAll({
			attributes: ['itemCd', 'name', 'grade'],
			include: [{ model: DB.File, as: 'itemImage', attributes: ['imgUrl'] }],
			where: { name: { [Op.like]: '%' + req.body.search + '%' }, removed: 0 },
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
		if (!req.headers['bdr-id']) {
			throw { code: '97', message: '비정상 적인 접근입니다.' }
		}
		// 크롤링용 코드
		// if (req.body.item.itemId != null) {
		// 	await DB.Item.upsert({ ...req.body.item, itemCd: req.body.item.itemId }, { where: { itemId: req.body.item.itemId }, transaction })
		// 	await DB.Earn.destroy({ where: { itemId: req.body.item.itemId }, transaction })
		// 	for (let i = 0; i < req.body.item.earnList.length; i++) {
		// 		let earn = await DB.Earn.create({ itemId: req.body.item.itemId, ...req.body.item.earnList[i] }, { transaction })
		// 		if (Array.isArray(req.body.item.earnList[i].craftList)) {
		// 			await DB.Craft.bulkCreate(
		// 				req.body.item.earnList[i].craftList.map((e) => ({ ...e, earnId: earn.id, itemCd: e.itemId })),
		// 				{ transaction },
		// 			)
		// 		}
		// 	}
		// 	await DB.Usages.destroy({ where: { itemId: req.body.item.itemId }, transaction })
		// 	await DB.Usages.bulkCreate(
		// 		req.body.item.usageList.map((e) => ({ itemId: req.body.item.itemId, ...e })),
		// 		{ transaction },
		// 	)
		// }
		if (req.body.itemCdEnc == null) {
			let newItemCd = await DB.Item.max('itemCd')
			req.body.itemCd = newItemCd + 1
		} else {
			req.body.itemCd = decode(req.body.itemCdEnc)
		}
		let cnt = await DB.Item.count({ where: { itemCd: req.body.itemCd, removed: 0 } })
		if (cnt >= 3) {
			throw { code: '01', message: '동일한 아이템을 3개를 초과하여 만들 수 없습니다.' }
		}
		let item = {}
		// 기존 아이템 수정 - (수정하여 새로운 레코드 생성)
		if (req.body.itemIdEnc) {
			req.body.itemId = decode(req.body.itemIdEnc)
			item = await DB.Item.findOne({ attributes: ['itemCd', 'name', 'fileId', 'desc'], where: { itemId: req.body.itemId } })
			let newItem = await DB.Item.create({ itemCd: item.itemCd, name: req.body.name || item.name, fileId: req.body.fileId || item.fileId, desc: req.body.desc || item.desc }, { transaction })
			for (let i = 0; i < req.body.Earns.length; i++) {
				let earn = await DB.Earn.create({ itemId: newItem.itemId, ...req.body.Earns[i] }, { transaction })
				if (Array.isArray(req.body.Earns[i].Crafts)) {
					await DB.Craft.bulkCreate(
						req.body.Earns[i].Crafts.map((e) => ({ earnId: earn.id, itemCd: e.itemId, count: e.count })),
						{ transaction },
					)
				}
			}
			await DB.Usages.bulkCreate(
				req.body.Usages.map((e) => ({ itemId: newItem.itemId, resultItemCd: e.resultItemCd })),
				{ transaction },
			)
		} else {
			// 신규 아이템 생성
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
		if (!req.headers['bdr-id']) {
			throw { code: '97', message: '비정상 적인 접근입니다.' }
		}
		let item = await DB.Item.findOne({
			attributes: ['itemId'],
			where: { itemId: decode(req.body.itemId) },
		})
		if (item) {
			let checkOver = await DB.LikeHistory.count({
				where: { bdrId: req.headers['bdr-id'], itemId: item.itemId, createdAt: { [Op.between]: [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')] } },
			})
			if (checkOver > 0) {
				throw { code: '01', message: '좋아요, 싫어요는 게시글별 하루 한번만 가능합니다.' }
			}
			await item.increment({ likeCount: req.body.like == '1' ? 1 : -1 })
			await DB.LikeHistory.create({ bdrId: req.headers['bdr-id'], itemId: item.itemId })
		} else {
			throw { code: '02', message: '해당 아이템을 찾을 수 없습니다.' }
		}
		res.send(200, { ...jsonSuccess })
	} catch (err) {
		console.error(err)
		res.send(200, { ...jsonFailed, ...err })
	}
})

module.exports = router
