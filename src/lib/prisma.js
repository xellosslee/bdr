import { PrismaClient } from '$lib/prisma2'

const prisma = new PrismaClient({ log: [{ level: 'query', emit: 'event' }, 'info', 'warn', 'error'] })
prisma.$on('query', (e) => {
	console.log('Query: ' + e.query)
	console.log('Params: ' + e.params)
	console.log('Duration: ' + e.duration + 'ms')
})

export default prisma
