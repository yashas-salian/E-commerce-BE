import { type Request, type Response } from "express";
import orderquery from "../../../repositories/db/queries/orders.query.js"
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
        const Response = await orderquery.createOrder(data)
        const payloadToKafka = {
            orderId: Response?.order.id,
            items: Response?.items
        }
        publishOrderCreated(payloadToKafka)
        res.status(200).json({})
    }

    fetchOrders = async(req: Request, res: Response) => {

    }

    cancelOrder = async(req: Request, res: Response) => {

    }
}

const orderController = Controller.getInstance();
export default orderController; 