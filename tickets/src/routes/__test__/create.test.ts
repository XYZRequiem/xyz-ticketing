import request from 'supertest';
import { app } from '../../app';
import { authedSignup } from '../auth-helper';
import { Ticket } from '../../models/ticket';

import { mockTitle, mockPrice, mockCreateTicketPayload } from './mock-data';

describe('create.ts', () => {
    it('should have a route handler listening to /api/tickets for post requests', async () => {
        const response = await request(app).post('/api/tickets').send({});

        expect(response.status).not.toBe(404);
    });

    describe('create ticket tests', () => {
        it('should return 401 when the user is not signed in', async () => {
            await request(app).post('/api/tickets').send({}).expect(401);
        });
        it('should return a non 401 status when user is signed in', async () => {
            const response = await request(app)
                .post('/api/tickets')
                .set('Cookie', authedSignup())
                .send({});
            expect(response.status).not.toBe(401);
        });
        it('should throw error if an invalid title is supplied', async () => {
            const mockPayload = mockCreateTicketPayload();

            mockPayload.title = '';
            await request(app)
                .post('/api/tickets')
                .set('Cookie', authedSignup())
                .send(mockPayload)
                .expect(400);

            delete mockPayload.title;
            await request(app)
                .post('/api/tickets')
                .set('Cookie', authedSignup())
                .send(mockPayload)
                .expect(400);
        });
        it('should throw error if an invalid price is supplied', async () => {
            const mockPayload = mockCreateTicketPayload();
            delete mockPayload.price;

            await request(app)
                .post('/api/tickets')
                .set('Cookie', authedSignup())
                .send(mockPayload)
                .expect(400);
        });
        it('should create a ticket when valid inputs supplied', async () => {
            let tickets = await Ticket.find({});
            expect(tickets.length).toBe(0);

            await request(app)
                .post('/api/tickets')
                .set('Cookie', authedSignup())
                .send(mockCreateTicketPayload())
                .expect(201);

            tickets = await Ticket.find({});
            expect(tickets.length).toBe(1);
            expect(tickets[0].price).toEqual(mockPrice);
            expect(tickets[0].title).toEqual(mockTitle);
        });
    });
});
