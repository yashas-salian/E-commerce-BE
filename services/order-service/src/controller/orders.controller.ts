import { type Request, type Response } from "express";
import { orderQuery } from "@yashas40/db"
import { publishOrderCancelled, publishOrderCreated } from "../kafka/producer.js";

class Controller{
    private static instance : Controller | null;

    static getInstance(){
        if(!this.instance){
            this.instance = new Controller()
        }
        return this.instance;
    }

    createOrders = async(req: Request, res: Response) => {
        const data = req.body
        const response = await orderQuery.createOrder(data)

        if(!response){
            res.status(400).json({
                success: false, 
                message: "Invalid order payload"
            })
        }
        const payloadToKafka = {
            orderId: response?.order.id,
            items: response?.items
        }
        await publishOrderCreated(payloadToKafka)
        res.status(200).json({
            success: true,
            message: "Order created successfully"
        })
    }

    fetchOrders = async(req: Request, res: Response) => {
        const userId = req.params.id
        const jsonData = {
            userId: userId
        } 
        const response = await orderQuery.fetchOrder(jsonData)

        if(!response){
            res.status(400).json({
                success: false, 
                message: "Invalid order payload"
            })
        }
        res.status(200).json({
            data: response,
            success: true,
            message: "Order fetched successfully"
        })
    }

    // cancelOrder = async(req: Request, res: Response) => {
    //     const orderId = req.params.id
    //     const jsonData = {
    //         orderId: orderId
    //     }
    //     const response = await orderQuery.cancelOrder(jsonData)

    //     if(!response){
    //         res.status(400).json({
    //             success: false, 
    //             message: "Invalid orderId payload"
    //         })
    //     }
    //     res.status(200).json({
    //         data: response,
    //         success: true,
    //         message: "Order cancelled successfully"
    //     })
    // }

    cancelItem = async(req: Request, res: Response) => {
        const itemId = req.params.id
        const jsonData = {
            itemId: itemId
        }
        const response = await orderQuery.cancelItem(jsonData)

        if(!response){
            res.status(400).json({
                success: false, 
                message: "Invalid itemId payload"
            })
        }
        const payloadToKafka = {
            response
        }
        await publishOrderCancelled(payloadToKafka)

        res.status(200).json({
            data: response,
            success: true,
            message: "Item cancelled successfully"
        })
    }
}

const orderController = Controller.getInstance();
export default orderController; 