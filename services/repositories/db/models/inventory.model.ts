import zod from "zod"
export const inventorySchema = zod.object({
    userId: zod.string().nonoptional(),
    items: zod.array(
        zod.object({
            userId: zod.string().nonoptional(),
            orderId: zod.string().nonoptional(),
            productId: zod.string().nonoptional(),
            quantity: zod.int().nonoptional(),
            unitPrice: zod.float64().nonoptional()
        })
    )
})
    