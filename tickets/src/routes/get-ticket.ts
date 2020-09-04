import express, { Request, Response } from 'express';
import { NotFoundError } from '@histoiredevelopment/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:ticketId', async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    res.status(200).send(ticket);
});

export { router as getTicketRouter };
