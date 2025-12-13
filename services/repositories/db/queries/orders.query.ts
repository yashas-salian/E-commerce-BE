import { prisma } from "../client.js"
import{ createOrderSchema, cancelItemSchema, cancelOrderSchema, fetchOrderSchema } from "../models/order.model.js"


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
        }, {
            maxWait: 10000,
            timeout: 20000
        })
        } catch (error) {
            throw new Error(error instanceof Error ? error.message:"Error occurred while creating order")
        }
    }

    fetchOrder = async (data: Object) => {
        try {
            const userDetails = fetchOrderSchema.safeParse(data)
            const orders = await prisma.order.findMany({
                where: {
                    userId: userDetails.data?.userId
                },
                include: {
                    items: true
                }
            })
            if(!orders) throw new Error("Orders with userId not found")
            return orders

        } catch (error) {
            throw new Error(error instanceof Error ? error.message:"Error occurred while fetching order")
        }
    }

    //we don't do this in a real world aaplication, we only cancel indv items
    // cancelOrder = async(data: Object) => {
    //     try {
    //         const orderDetails = cancelOrderSchema.safeParse(data)
    //         const isDeleted = await prisma.order.delete({
    //             where: {
    //                 id: orderDetails.data?.orderId
    //             },
    //             include: {
    //                 items: true
    //             }
    //         })
    //         if(!isDeleted) throw new Error("Order cancellation failed")
    //         return isDeleted    
    //     } catch (error) {
    //         throw new Error(error instanceof Error ? error.message:"Error occurred while cancelling order")
    //     }
    // }

    cancelItem = async(data: Object) => {
        try {
            const itemDetails = cancelItemSchema.safeParse(data)
            const isDeleted = await prisma.orderItem.delete({
                where: {
                    id: itemDetails.data?.itemId
                }
            })
            if(!isDeleted) throw new Error("Order cancellation failed")
            return isDeleted    
        } catch (error) {
            throw new Error(error instanceof Error ? error.message:"Error occurred while cancelling item")
        }
    }
}

export const orderQuery = Controller.getInstance()