import { Kafka, type Producer } from "kafkajs"
import { env } from "../config/env.js"
import { logger } from "../utils/logger.js"

const kafka = new Kafka({
    clientId: "order-service",
    brokers: env.KAFKA_BROKERS
})

const producer: Producer = kafka.producer()

export async function connectProducer(){
    await producer.connect()
    logger.info("Order-service producer connected successfully")
}

export async function publishOrderCreated(Orders: any){
    await producer.send({
        topic: "order.created",
        messages: [{value: JSON.stringify(Orders)}]
    })
    logger.info("orders.created topic published successfully")
}