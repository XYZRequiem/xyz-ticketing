import request from 'supertest';
import { app } from '../../app';
import { authedSignup } from '../../test/auth-helper';

import {
    mockCreateTicketPayload,
    createMockId,
    mockUpdatePayload,
    mockUpdateTitle,
    mockUpdatePrice,
} from '../../test/mock-data';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

describe('Ticket update-ticket.ts', () => {
    const createTicket = async () => {
        const cookie = authedSignup();
        return {
            ticketRes: await request(app)
                .post('/api/tickets')
                .set('Cookie', cookie)
                .send(mockCreateTicketPayload())
                .expect(201),
            cookie,
        };
    };

    it('should return 404 if provided ticket id does not exist', async () => {
        await request(app)
            .put(`/api/tickets/${createMockId()}`)
            .set('Cookie', authedSignup())
            .send(mockUpdatePayload())
            .expect(404);
    });
    it('should return 401 if user is not signed in', async () => {
        await request(app)
            .put(`/api/tickets/${createMockId()}`)
            .send(mockUpdatePayload())
            .expect(401);
    });
    it('should return 401 if user does not own ticket', async () => {
        const { ticketRes, cookie } = await createTicket();

        await request(app)
            .put(`/api/tickets/${ticketRes.body.id}`)
            .set('Cookie', authedSignup())
            .send(mockUpdatePayload())
            .expect(401);
    });
    it('should return 400 if user provides invalid title or price', async () => {
        const { ticketRes, cookie } = await createTicket();

        const mockPayload = mockUpdatePayload();
        mockPayload.title = '';

        await request(app)
            .put(`/api/tickets/${ticketRes.body.id}`)
            .set('Cookie', cookie)
            .send(mockPayload)
            .expect(400);

        mockPayload.title = 'Justin Timberlake - Justified';
        mockPayload.price = -111;
        await request(app)
            .put(`/api/tickets/${ticketRes.body.id}`)
            .set('Cookie', cookie)
            .send(mockPayload)
            .expect(400);
    });
    it('should return 200 and update ticket when valid inputs supplied', async () => {
        const { ticketRes, cookie } = await createTicket();

        const response = await request(app)
            .put(`/api/tickets/${ticketRes.body.id}`)
            .set('Cookie', cookie)
            .send(mockUpdatePayload())
            .expect(200);

        expect(response.body.title).toEqual(mockUpdateTitle);
        expect(response.body.price).toEqual(mockUpdatePrice);
    });

    it('should publish event when ticket is created', async () => {
        const { ticketRes, cookie } = await createTicket();

        const response = await request(app)
            .put(`/api/tickets/${ticketRes.body.id}`)
            .set('Cookie', cookie)
            .send(mockUpdatePayload())
            .expect(200);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });

    it('should throw error when user attempts to update a reserved ticket', async () => {
        const { ticketRes, cookie } = await createTicket();
        
        const ticket = await Ticket.findById(ticketRes.body.id)
        ticket?.set({orderId: createMockId()})
        await ticket?.save()
        
        const mockPayload = {title:'Justin Timberlake - Justified', price: 1111}
        await request(app)
            .put(`/api/tickets/${ticketRes.body.id}`)
            .set('Cookie', cookie)
            .send(mockPayload)
            .expect(400);
    })
});
