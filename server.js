require('dotenv').config()
const threadmill = require("./src/threadmill.js")

const PORT = 3001;

const fastify = require("fastify")({
  logger: false,
});
fastify.register(require("fastify-formbody"));
fastify.get("/", () => "It works");

fastify.get("/start_thread/:channel_id", threadmill.startThreadHandler);

fastify.listen(PORT, "0.0.0.0", (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
});
