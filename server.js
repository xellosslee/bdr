require('dotenv').config()
const consoleStamp = require('console-stamp')
const { createServer, plugins } = require('restify')
const corsMiddleware = require('restify-cors-middleware2')
const { DB, sq, Op } = require('./mysql')

consoleStamp(console, 'yyyy-mm-dd HH:MM:ss.l')

var PORT = process.argv[2] || 7700
// var https_options = {
// 	key: fs.readFileSync('/etc/ssl/self-signed/server.key'),
// 	certificate: fs.readFileSync('/etc/ssl/self-signed/server.crt'),
// }
// var https_server = restify.createServer(https_options)
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
waitForDBSync()
function waitForDBSync() {
	if (!DB.initialized) {
		setTimeout(waitForDBSync, 500)
	} else {
		server.listen(PORT, '0.0.0.0', () => {
			if (typeof process.send == 'function') {
				process.send('ready')
			}
			console.log('%s listening at %s', server.name, server.url)
		})
		// 운영 에서만 cron job 실행
		if (process.env.NODE_ENV == 'prod') {
			require('./cron')
		}
	}
}
// server.listen(PORT, '0.0.0.0', async () => {
// 	if (typeof process.send == 'function') {
// 		process.send('ready')
// 	}
// 	console.log('%s listening at %s', server.name, server.url)
// })
process.on('SIGINT', async () => {
	isDisableKeepAlive = true
	server.close(() => {
		console.log('server closed')
		process.exit(0)
	})
})
server.get('/ping', (req, res, next) => {
	res.send(200)
})
require('./craft_note').applyRoutes(server)
require('./file').applyRoutes(server)

// FOR THE maxAge, IT IS COUNTED BY PER SECOND, THERE IS NO CASHING WHEN IT IS -1
server.get('/ald/*', plugins.serveStatic({ directory: __dirname + '/src', maxAge: 6000 }))
server.get('/css/*', plugins.serveStatic({ directory: __dirname + '/src', maxAge: 6000 }))
server.get('/lib/*', plugins.serveStatic({ directory: __dirname + '/src', maxAge: 6000 }))
server.get('/js/*', plugins.serveStatic({ directory: __dirname + '/src', maxAge: 6000 }))
server.get('/img/*', plugins.serveStatic({ directory: __dirname + '/src', maxAge: 6000 }))
server.get('/fonts/*', plugins.serveStatic({ directory: __dirname + '/src', maxAge: 6000 }))
server.get('/images/*', plugins.serveStatic({ directory: __dirname + '/uploads/items', appendRequestPath: false, maxAge: 6000 }))
server.get('/favicon.ico', plugins.serveStatic({ directory: __dirname + '/src', appendRequestPath: false, maxAge: 6000 }))
server.get('/robots.txt', plugins.serveStatic({ directory: __dirname + '/src', appendRequestPath: false, maxAge: 6000 }))
server.get('/view/*', plugins.serveStatic({ directory: __dirname + '/', maxAge: 6000 }))
