import request from 'supertest';
import { app } from '../../app';
import { createMockId, createMockTicket, createMockOrder } from './mock-data';
import { authedSignup } from './auth-helper';
import { OrderStatus, Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

describe('Order update.ts', () => {
    describe('Cancel order', () => {
        const createGetCancelUrl = (orderId: string) =>
            `/api/orders/${orderId}/cancel`;
        it('should return error when order is not found', async () => {
            const cancelURL = createGetCancelUrl(createMockId());
            await request(app)
                .patch(cancelURL)
                .set('Cookie', authedSignup())
                .send()
                .expect(404);
        });
        it('should return error when order does not belong to requesting user', async () => {
            const order = await createMockOrder(undefined, undefined);
            const cancelURL = createGetCancelUrl(order.id);
            await request(app)
                .patch(cancelURL)
                .set('Cookie', authedSignup())
                .send()
                .expect(401);
        });
        it('should cancel order order exists', async () => {
            const order = await createMockOrder(undefined, undefined);
            const cancelURL = createGetCancelUrl(order.id);
            const response = await request(app)
                .patch(cancelURL)
                .set('Cookie', authedSignup(order.userId))
                .send()
                .expect(200);

            expect(response.body.status).toEqual(OrderStatus.Cancelled);

            const updatedOrder = await Order.findById(order.id);
            expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
        });

        it('should emit order cancelled event', async () => {
            const order = await createMockOrder(undefined, undefined);
            const cancelURL = createGetCancelUrl(order.id);
            const response = await request(app)
                .patch(cancelURL)
                .set('Cookie', authedSignup(order.userId))
                .send()
                .expect(200);

            expect(natsWrapper.client.publish).toHaveBeenCalled();
        });
    });
});
