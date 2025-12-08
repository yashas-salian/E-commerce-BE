import {} from "express";
import orderquery from "../../../repositories/db/queries/orders.query.js";
import { publishOrderCreated } from "../kafka/producer.js";
class Controller {
    static instance;
    static getInstance() {
        if (!this.instance) {
            this.instance = new Controller();
        }
        return this.instance;
    }
    createOrders = async (req, res) => {
        const data = req.body;
        const Response = await orderquery.createOrder(data);
        const payloadToKafka = {
            orderId: Response?.order.id,
            items: Response?.items
        };
        publishOrderCreated(payloadToKafka);
        res.status(200).json({});
    };
    fetchOrders = async (req, res) => {
    };
    cancelOrder = async (req, res) => {
    };
}
const orderController = Controller.getInstance();
export default orderController;
//# sourceMappingURL=orders.controller.js.map