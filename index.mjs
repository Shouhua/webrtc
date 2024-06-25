import Koa from 'koa'
import Router from 'koa-router'
import path from 'node:path'
import fs from 'node:fs'
import { Server } from 'socket.io'

const __dirname = import.meta.dirname
const PORT = process.env.PORT
const isDev = process.env.IS_DEV === 'true'
const useSSL = process.env.USE_SSL === 'true'

function log(...args) {
	if (isDev) {
		console.log(...args)
	}
}

const app = new Koa()

const router = new Router()
router.get('/', (ctx, _) => {
	const filePath = path.join(__dirname, 'index.html')
	let html = fs.readFileSync(filePath, 'utf8')
	html = html.replace('{{ ICE_SERVERS }}', JSON.parse(JSON.stringify(process.env.ICE_SERVERS)))
	ctx.type = 'text/html'
	ctx.body = html
	return 
})

app.use(router.routes())
// app.use(serve(path.resolve(__dirname, 'dist')))

let httpServer
if (useSSL) {
	const https = await import('node:https')
	httpServer = https.createServer({
		cert: fs.readFileSync(process.env.CERT),
		key: fs.readFileSync(process.env.KEY)
	}, app.callback())
} else {
	const http = await import('node:http')
	httpServer = http.createServer(app.callback())
}

const io = new Server(httpServer)

let activeSockets = []

io.on('connection', (socket) => {
	const existSocket = activeSockets.find(s => s === socket.id)
	if (!existSocket) {
		activeSockets.push(socket.id)
		io.emit('update user list', {
			users: activeSockets
		})
	}

	log(`user [${socket.id}] connected`)

	socket.on('disconnect', () => {
		log(`user [${socket.id}] disconnected`);
		activeSockets = activeSockets.filter(s => s !== socket.id)
		io.emit('update user list', {
			users: activeSockets
		})
	});

	socket.on('send offer', (data) => {
		log(`send offer: ${data.id}, ${socket.id}`)
		io.to(data.id).emit('receive offer', { id: socket.id, offer: data.offer })
	})

	socket.on("send answer", data => {
		log(`send answer: ${data.id}, ${socket.id}`)
		io.to(data.id).emit("receive answer", { id: socket.id, answer: data.answer });
	});

	socket.on("send candidate", data => {
		log(`send candidate: ${data.id}, ${socket.id}`)
		io.to(data.id).emit("receive candidate", { id: socket.id, candidate: data.candidate });
	});

	socket.on('chat message', (msg) => {
		log('message: ' + msg);
		socket.broadcast.emit('chat message', msg);
	});

})

httpServer.listen(PORT, () => {
	console.log(`Server is listening on ${PORT}...`)
})


