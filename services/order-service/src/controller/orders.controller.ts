import { type Request, type Response } from "express";
import { orderQuery } from "@yashas40/db"
import { publishOrderCreated } from "../kafka/producer.js";

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
        const data = req.body
        // const response = await 
    }

    cancelOrder = async(req: Request, res: Response) => {

    }
}

const orderController = Controller.getInstance();
export default orderController; 