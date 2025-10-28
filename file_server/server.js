const path = require('path')
const autoload = require('@fastify/autoload')
const fastify = require('fastify')({
  logger: true
})

fastify.register(require('@fastify/cors'), { origin: '*' })
fastify.register(require('@fastify/swagger'))

fastify.register(autoload, {
  dir: path.join(__dirname, 'routes')
})

// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

// Run the server!
fastify.listen({ port: 3001 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`🚀 Server listening at ${address}`)
})
