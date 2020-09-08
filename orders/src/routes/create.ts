import express, { Request, Response } from 'express';
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    OrderStatus,
    BadRequestError,
} from '@histoiredevelopment/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const secondsInMinute = 60;
const EXPIRATION_WINDOW = 10 * secondsInMinute;

const router = express.Router();

router.post(
    '/api/orders',
    requireAuth,
    [body('ticketId').not().isEmpty().withMessage('TicketId must be supplied')],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }

        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW);

        // create and save the order
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket: ticket,
        });
        await order.save();

        // publish order created event

        res.status(201).send(order);
    }
);

export { router as createOrderRouter };