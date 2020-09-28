import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import {
    requireAuth,
    NotFoundError,
    UnauthorizedError,
    OrderStatus,
} from '@histoiredevelopment/common';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.patch(
    '/api/orders/:orderId/cancel',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate(
            'ticket'
        );
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new UnauthorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        res.send(order);
    }
);

export { router as updateOrdersRouter };
