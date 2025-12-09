import { prisma } from "../client.js"
import{ createOrderSchema } from "../models/order.model.js"


class Controller{
    private static instance: Controller | null = null;

    static getInstance(){
        if(!this.instance) this.instance = new Controller()
        return this.instance
    }

    createOrder = async (data: Object) => {
        try {
            const orderData = createOrderSchema.safeParse(data) 
            if(!orderData.success) {
                console.error(orderData.error.format())
                throw new Error("Invalid order payload")
            }
            const {userId, items} = orderData.data
            const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
            return await prisma.$transaction(async (tx) =>{

                const createdOrder = await tx.order.create({
                    data: {
                        userId,
                        totalAmount: totalAmount    
                    }
                })

                await tx.orderItem.createMany({
                    data: items.map((item) => ({
                        orderId: createdOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice
                    }))
                })

                const createdItems = await tx.orderItem.findMany({
                   where: {
                       orderId: createdOrder.id
                   }
            })
            return {
                order: createdOrder,
                items: createdItems
            }
        })
        } catch (error) {
            throw new Error(error instanceof Error ? error.message:"Error occurred while creating order")
        }
    }
}

export const orderQuery = Controller.getInstance()