import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    requireAuth, validateRequest, BadRequestError, NotFoundError, UnauthorizedError, OrderStatus
} from '@histoiredevelopment/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments',
    requireAuth,
    [
        body('token').not().isEmpty(),
        body('orderId').not().isEmpty(),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new UnauthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Charge cannot be created for cancelled order');
        }

        const charge = await stripe.charges.create({
            amount: order.price * 100,
            currency: 'USD',
            source: token
        });

        const payment = Payment.build({
            orderId,
            chargeId: charge.id
        });
        await payment.save();

        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            chargeId: payment.chargeId,
        });

        return res.status(201).send({ id: payment.id });
    });

export { router as createChargeRouter };
