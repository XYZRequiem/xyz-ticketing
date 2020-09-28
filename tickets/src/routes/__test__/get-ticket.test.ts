import request from 'supertest';
import { app } from '../../app';
import { authedSignup } from '../../test/auth-helper';

import {
    mockTitle,
    mockPrice,
    mockCreateTicketPayload,
    createMockId,
} from '../../test/mock-data';

describe('Ticket get-ticket.ts', () => {
    it('should return 404 if the ticket does not exist', async () => {
        await request(app)
            .get(`/api/tickets/${createMockId()}`)
            .send()
            .expect(404);
    });
    it('should return ticket if ticket exists', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', authedSignup())
            .send(mockCreateTicketPayload())
            .expect(201);
        const ticketResponse = await request(app)
            .get(`/api/tickets/${response.body.id}`)
            .send()
            .expect(200);

        expect(ticketResponse.body.title).toEqual(mockTitle);
        expect(ticketResponse.body.price).toEqual(mockPrice);
    });
});
