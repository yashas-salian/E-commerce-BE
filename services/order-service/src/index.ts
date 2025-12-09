import { createApp } from "./server.js";
import { connectProducer } from "./kafka/producer.js";
import { startConsumer } from "./kafka/consumer.js";
import { start } from "repl";


async function main() {
    await connectProducer()
    await startConsumer()
    const app = createApp()
    const PORT = process.env.PORT || 3000

    app.listen(PORT,()=>{
        console.log(`Listening on port ${PORT}`)
    })
}

main()