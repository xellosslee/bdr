import 'dotenv/config'
import { DB, sq, Op } from './mysql.mjs'
import consoleStamp from 'console-stamp'
import { createServer, plugins } from 'restify'
import corsMiddleware from 'restify-cors-middleware2'

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

server.post('/item/put', async function (req, res) {
	console.dir(req.body)
	await DB.Item.create(req.body.finalItem)
	await DB.Earn.bulkCreate(req.body.finalItem.earnList.map((e) => ({ ...e, itemId: req.body.finalItem.itemId })))
	await DB.Usages.bulkCreate(req.body.finalItem.usageList.map((e) => ({ ...e, useItemId: req.body.finalItem.itemId })))

	res.send(200, 'ok')
})

server.listen(PORT, '0.0.0.0', async () => {
	console.log('%s listening at %s', server.name, server.url)
})
process.on('SIGINT', async () => {
	isDisableKeepAlive = true
	server.close(() => {
		console.log('server closed')
		process.exit(0)
	})
})
