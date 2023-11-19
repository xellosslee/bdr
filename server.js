require('dotenv').config()
const consoleStamp = require('console-stamp')
const { createServer, plugins } = require('restify')
const corsMiddleware = require('restify-cors-middleware2')

consoleStamp(console, 'yyyy-mm-dd HH:MM:ss.l')

var PORT = process.argv[2] || 7700
var server = createServer()
let isDisableKeepAlive = false
// set timeout 17 sec
server.server.setTimeout(1000 * 17)
server.use(plugins.bodyParser())
server.use(plugins.queryParser())
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

require('./craft_note').applyRoutes(server)

// FOR THE maxAge, IT IS COUNTED BY PER SECOND, THERE IS NO CASHING WHEN IT IS -1
server.get('/css/*', plugins.serveStatic({ directory: __dirname + '/src', maxAge: 6000 }))
server.get('/js/*', plugins.serveStatic({ directory: __dirname + '/src', maxAge: 6000 }))