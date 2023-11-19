const { Router } = require('restify-router')
const { DB, sq, Op } = require('./mysql')
const ejs = require('ejs')
const { encode, decode } = require('./crypt')
const router = new Router()

router.get('/', (req, res, next) => {
	DB.Item.findOne({ attributes: ['itemId'], order: [sq.fn('rand')]}).then(item => {
        let encoded = encode(JSON.stringify({itemId: item.itemId}))
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
			await DB.Item.update(req.body.item, { where: {itemId: req.body.item.itemId}, transaction })
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
        let params = {itemId: req.params.itemId}
        let item = await DB.Item.findOne({
            include: [ {model: DB.File, as: 'itemImage', attributes: ['imgUrl'] } ],
            where: { itemId: params.itemId, removed: 0 }
        })
        console.log(encode(JSON.stringify(params)))
        if (!item) {
            try {
                let data = JSON.parse(decode(params.itemId))
                params.itemId = data.itemId
                params.search = data.search
                item = await DB.Item.findOne({
                    include: [ {model: DB.File, as: 'itemImage', attributes: ['imgUrl'] } ],
                    where: { itemId: params.itemId, removed: 0 }
                })
            } catch (err) { console.error(err) }
        }
        let earn = await DB.Earn.findAll({ where: { itemId: params.itemId } })
        if (earn.type == 'craft') {
            let items = DB.Item.findAll({ attributes: ['itemId', 'name'], where: {itemId: earn.craftList.map(e => e.itemId)}})

            for (let i = 0 ; i = items.length; i++) {
                let idx = earn.craftList.findIndex(e => e.itemId == items[i].itemId)
                earn.craftList[idx].url = '/item/' + encode(items[i].itemId)
                earn.craftList[idx].name = items[i].name
            }
        }
        let usages = await DB.Usages.findAll({
            include: [
                { model: DB.Item, as: 'resultItem', attributes: ['itemId', 'name'], where: {removed: 0} },
            ],
            where: { itemId: params.itemId },
        })
        let usagesList = []
        for(let i = 0 ; i < usages.length; i++) {
            let itemId = usages[i].resultItem.itemId
            let encoded = encode(JSON.stringify({itemId}))
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
module.exports = router