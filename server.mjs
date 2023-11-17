import 'dotenv/config'
import { DB, sq, Op } from './mysql.mjs'
import consoleStamp from 'console-stamp'
import { createServer, plugins } from 'restify'
import corsMiddleware from 'restify-cors-middleware2'
import ejs from 'ejs'

const defaultErrorHtml = `<p>일시적으로 장애가 발생할 수 있습니다.</p>
                        <p>잠시 후 다시 시도해 주세요.</p>`

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

server.post('/item/put', async function (req, res) {
	console.dir(req.body)
	await DB.Item.create(req.body.finalItem)
	await DB.Earn.bulkCreate(req.body.finalItem.earnList.map((e) => ({ ...e, itemId: req.body.finalItem.itemId })))
	await DB.Usages.bulkCreate(req.body.finalItem.usageList.map((e) => ({ ...e, useItemId: req.body.finalItem.itemId })))

	res.send(200, 'ok')
})

server.get('/item/:itemId', async (req, res) => {
	try {
		let item = await DB.Item.findOne({ where: { itemId: req.params.itemId } })
		let earn = await DB.Earn.findAll({ where: { itemId: req.params.itemId } })
		let usages = await DB.Usages.findAll({ where: { itemId: req.params.itemId } })
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
