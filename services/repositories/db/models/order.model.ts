import zod from "zod"
export const createOrderSchema = zod.object({
    userId: zod.string(),
    items: zod.array(
        zod.object({
            // userId: zod.string(),
            // orderId: zod.string(),
            productId: zod.string(),
            quantity: zod.number().int(),
            unitPrice: zod.number()
        })
    ).min(1, "Order must have at least one item")
})
    