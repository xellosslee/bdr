require('dotenv').config()
const { DB, sq, Op } = require('./mysql')
const consoleStamp = require('console-stamp')
const { createServer, plugins } = require('restify')
const corsMiddleware = require('restify-cors-middleware2')
const ejs = require('ejs')

const defaultErrorHtml = `<p>일시적으로 장애가 발생할 수 있습니다.</p>
                        <p>잠시 후 다시 시도해 주세요.</p>`
const defJsonError = { status: 500, code: '99', message: '오류가 발생하였습니다.' }
const jsonSuccess = { code: '00', message: '정상입니다.' }

consoleStamp(console, 'yyyy-mm-dd HH:MM:ss.l')

var PORT = process.argv[2] || 7700
var server = createServer()
let isDisableKeepAlive = false
// set timeout 17 sec
server.server.setTimeout(1000 * 17)
server.use(plugins.bodyParser())
server.use((req, res, next) => {
	if (isDisableKeepAlive) {
		res.set('Connection', 'close')
	}
	next()
})
const cors = corsMiddleware({
	origins: ['*', 'https://bdo.weingchicken.com'],
	allowHeaders: ['*'],
	exposeHeaders: ['*'],
})
server.pre(cors.preflight)
server.use(cors.actual)
server.listen(PORT, '0.0.0.0', async () => {
	if (typeof process.send == 'function') {
		process.send('ready')
	}
	console.log('%s listening at %s', server.name, server.url)
})
process.on('SIGINT', async () => {
	isDisableKeepAlive = true
	server.close(() => {
		console.log('server closed')
		process.exit(0)
	})
})

// 데이터 저장
server.post('/item/put', async function (req, res) {
	let transaction = await DB.transaction()
	try {
		console.dir(req.body)
		if (req.body.item.itemId != null) {
			await DB.Item.update(req.body.item, { where: req.body.item.itemId, transaction })
			await DB.Earn.destroy({ where: { itemId: req.body.item.itemId, transaction } })
			await DB.Earn.bulkCreate(
				req.body.item.earnList.map((e) => ({ ...e, itemId: req.body.item.itemId })),
				{ transaction },
			)
			await DB.Usages.destroy({ where: { itemId: req.body.item.itemId }, transaction })
			await DB.Usages.bulkCreate(
				req.body.item.usageList.map((e) => ({ ...e, useItemId: req.body.item.itemId })),
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
				req.body.item.usageList.map((e) => ({ ...e, useItemId: req.body.item.itemId })),
				{ transaction },
			)
		}
		res.send(200, { ...jsonSuccess })
	} catch (err) {
		console.error(err.original || err)
		if (typeof err == 'object') {
			res.send({ ...defJsonError, ...err })
		} else {
			res.send(defJsonError)
		}
	}
})

server.get('/item/:itemId', async (req, res) => {
	try {
		let item = await DB.Item.findOne({ where: { itemId: req.params.itemId, removed: 0 } })
		let earn = await DB.Earn.findAll({ where: { itemId: req.params.itemId } })
		let usages = await DB.Usages.findAll({
			include: [
				{ model: DB.Item, as: 'Item', attributes: ['name'], where: {removed: 0} },
				{ model: DB.Item, as: 'useItem', attributes: ['name'], where: {removed: 0} },
			],
			where: { useItemId: req.params.itemId },
		})

		let html = await ejs.renderFile('src/main.ejs', { item, earn, usages })
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
})
