import { Kafka } from "kafkajs";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
const kafka = new Kafka({
    clientId: "order-service",
    brokers: env.KAFKA_BROKERS
});
const consumer = kafka.consumer({ groupId: "order-service-group" });
export async function startConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topic: "inventory.reserved", fromBeginning: false });
    await consumer.subscribe({ topic: "payment.succeded", fromBeginning: false });
    logger.info("order-service-group consumer connected & subscribed");
    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const raw = message.value?.toString();
            if (!raw)
                return;
            const data = JSON.parse(raw);
            logger.info(`Data recieved from topic ${topic}`);
            try {
                if (topic == "inventory.reserved") {
                    logger.info("to do for inventory reserved");
                }
                else if (topic == "payment.succeded") {
                    logger.info("to do for payment succeded");
                }
            }
            catch (error) {
                //appError
                logger.error("Error handling message", error);
                //push to DLQ for retry
            }
        }
    });
}
//# sourceMappingURL=consumer.js.map