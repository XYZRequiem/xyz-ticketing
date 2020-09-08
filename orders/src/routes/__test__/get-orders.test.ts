import request from 'supertest';
import { app } from '../../app';
import { createMockId, createMockTicket, createMockOrder } from './mock-data';
import { authedSignup } from './auth-helper';
import { OrderDoc } from '../../models/order';

describe('Order get-orders.ts', () => {
    const getOrdersURL = '/api/orders';

    it('should return orders for a specific user', async () => {
        const ticket1 = await createMockTicket();
        const ticket2 = await createMockTicket();
        const ticket3 = await createMockTicket();

        const order1 = await createMockOrder(ticket1, undefined);

        const userId = createMockId();
        const order2 = await createMockOrder(ticket2, undefined, userId);
        const order3 = await createMockOrder(ticket3, undefined, userId);

        const response = await request(app)
            .get(getOrdersURL)
            .set('Cookie', authedSignup(userId))
            .send()
            .expect(200);

        expect(response.body.length).toBe(2);
        const orderIds = response.body.map((order: OrderDoc) => order.id);
        expect(orderIds).toEqual(
            expect.arrayContaining([order2.id, order3.id])
        );
    });
});
