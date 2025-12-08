import zod from "zod"
export const productSchema = zod.object({
    userId: zod.string(),
    items: zod.array(
        zod.object({
            userId: zod.string(),
            orderId: zod.string(),
            productId: zod.string(),
            quantity: zod.number().int(),
            unitPrice: zod.number()
        })
    )
})