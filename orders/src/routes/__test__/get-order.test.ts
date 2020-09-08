import request from 'supertest';
import { app } from '../../app';
import { createMockId, createMockTicket, createMockOrder } from './mock-data';
import { authedSignup } from './auth-helper';
import { OrderDoc } from '../../models/order';

describe('Order get-order.ts', () => {
    const createGetOrderURL = (orderId: string) => `/api/orders/${orderId}`;

    it('should return error if the order does not exist', async () => {
        const getURL = createGetOrderURL(createMockId());
        await request(app)
            .get(getURL)
            .set('Cookie', authedSignup())
            .send()
            .expect(404);
    });

    it('should return error if the order does not belong to the requesting user', async () => {
        const order = await createMockOrder(undefined, undefined);
        const getURL = createGetOrderURL(order.id);
        await request(app)
            .get(getURL)
            .set('Cookie', authedSignup())
            .send()
            .expect(401);
    });
    it('should return order', async () => {
        const order = await createMockOrder(undefined, undefined);
        const getURL = createGetOrderURL(order.id);
        const response = await request(app)
            .get(getURL)
            .set('Cookie', authedSignup(order.userId))
            .send()
            .expect(200);

        expect(response.body.id).toBe(order.id);
    });
});
