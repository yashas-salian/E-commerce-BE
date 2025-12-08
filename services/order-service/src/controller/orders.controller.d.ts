import { type Request, type Response } from "express";
declare class Controller {
    private static instance;
    static getInstance(): Controller;
    createOrders: (req: Request, res: Response) => Promise<void>;
    fetchOrders: (req: Request, res: Response) => Promise<void>;
    cancelOrder: (req: Request, res: Response) => Promise<void>;
}
declare const orderController: Controller;
export default orderController;
//# sourceMappingURL=orders.controller.d.ts.map