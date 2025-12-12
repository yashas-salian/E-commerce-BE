import { Router } from "express";
import orderController from "../controller/orders.controller.js"
import { asyncHandler } from "../utils/asyncHandler.js";
const router: Router = Router()

router.post('/create', asyncHandler(orderController.createOrders))
router.get('/:id', asyncHandler(orderController.fetchOrders))
router.post('/:id/cancel-order', asyncHandler(orderController.cancelOrder))
router.post('/:id/cancel-item', asyncHandler(orderController.cancelItem))

export default router