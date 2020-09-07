import request from 'supertest';
import { app } from '../../app';
import { createMockId, createMockTicket, createMockOrder } from './mock-data';
import { authedSignup } from './auth-helper';

describe('Order create.ts', () => {
    const createURL = '/api/orders';

    it('should return error if the ticket does not exist', async () => {
        const ticketId = createMockId();

        await request(app)
            .post(createURL)
            .set('Cookie', authedSignup())
            .send({ ticketId })
            .expect(404);
    });

    it('should return an error if the ticket is already reserved', async () => {
        const order = await createMockOrder(undefined, undefined);

        await request(app)
            .post(createURL)
            .set('Cookie', authedSignup())
            .send({ ticketId: order.ticket.id })
            .expect(400);
    });

    it('should reserve a ticket', async () => {
        const ticket = await createMockTicket(undefined);

        await request(app)
            .post(createURL)
            .set('Cookie', authedSignup())
            .send({ ticketId: ticket.id })
            .expect(201);
    });

    it.todo('should emit an order created event');
});
