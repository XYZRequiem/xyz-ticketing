import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import {
    requireAuth,
    NotFoundError,
    UnauthorizedError,
    OrderStatus,
} from '@histoiredevelopment/common';

const router = express.Router();

router.patch(
    '/api/orders/:orderId/cancel',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new UnauthorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        // publish order cancelled event

        res.send(order);
    }
);

export { router as updateOrdersRouter };
