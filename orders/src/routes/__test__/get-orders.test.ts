import request from 'supertest';
import { app } from '../../app';
import { createMockId, createMockTicket, createMockOrder } from './mock-data';
import { authedSignup } from './auth-helper';

describe('Order get-orders.ts', () => {
    const getOrdersURL = '/api/orders';

    it('should return orders for a specific user', async () => {
        const ticket1 = await createMockTicket();
        const ticket2 = await createMockTicket();
        const ticket3 = await createMockTicket();
    });
});
