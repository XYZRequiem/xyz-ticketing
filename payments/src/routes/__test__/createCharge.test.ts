import { OrderStatus } from '@histoiredevelopment/common';
import request from 'supertest';
import { app } from '../../app';
import { authedSignup } from '../../test/auth-helper';
import { createMockId } from '../../test/mock-data';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

describe('Payment Service createCharge tests', () => {
    const createURL = '/api/payments';
    const createOrder = (status: OrderStatus) => {
        return Order.build({
            id: createMockId(),
            userId: createMockId(),
            version: 0,
            status: status,
            price: 20,
        });
    };

    it('should return 404 if the order being purchased does not exist', async () => {
        await request(app)
            .post(createURL)
            .set('Cookie', authedSignup())
            .send({
                token: createMockId(),
                orderId: createMockId()
            })
            .expect(404);
    });

    it('should return 401 if the order being purchased does not belong to user', async () => {
        const order = createOrder(OrderStatus.Created);
        await order.save();

        await request(app)
            .post('/api/payments')
            .set('Cookie', authedSignup())
            .send({
                token: createMockId(),
                orderId: order.id,
            })
            .expect(401);
    });

    it('should return 400 if the order being purchased is cancelled', async () => {
        const order = createOrder(OrderStatus.Cancelled);

        await order.save();
        await request(app)
            .post('/api/payments')
            .set('Cookie', authedSignup(order.userId))
            .send({
                token: createMockId(),
                orderId: order.id,
            })
            .expect(400);
    });

    it('should return 201 with valid inputs', async () => {
        const order = createOrder(OrderStatus.Created);

        await order.save();
        await request(app)
            .post('/api/payments')
            .set('Cookie', authedSignup(order.userId))
            .send({
                token: 'tok_visa',
                orderId: order.id,
            })
            .expect(201);

        const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
        expect(chargeOptions.source).toEqual('tok_visa');
        expect(chargeOptions.amount).toEqual(order.price * 100);
        expect(chargeOptions.currency).toEqual('USD');
    });

    it('should create a payment object when payment is successful', async () => {
        const order = createOrder(OrderStatus.Created);
        await order.save();

        await request(app)
            .post('/api/payments')
            .set('Cookie', authedSignup(order.userId))
            .send({
                token: 'tok_visa',
                orderId: order.id,
            })
            .expect(201);

        const payment = await Payment.findOne({
            orderId: order.id,
            chargeId: "asdf-111234",
        });
        expect(payment).not.toBeNull();
    });
});
