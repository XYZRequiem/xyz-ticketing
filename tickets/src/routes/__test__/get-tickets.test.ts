import request from 'supertest';
import { app } from '../../app';
import { authedSignup } from './auth-helper';

import { mockCreateTicketPayload } from './mock-data';

describe('Ticket get-tickets.ts', () => {
    const createTicket = () => {
        return request(app)
            .post('/api/tickets')
            .set('Cookie', authedSignup())
            .send(mockCreateTicketPayload())
            .expect(201);
    };

    it('should fetch a list of tickets', async () => {
        await createTicket();
        await createTicket();
        await createTicket();

        const response = await request(app)
            .get('/api/tickets')
            .send()
            .expect(200);

        expect(response.body.length).toBe(3);
    });
});
