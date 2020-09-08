import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket, TicketDoc } from '../../models/ticket';

const mockTitle = 'Brent Faiyaz - Into';
const mockPrice = 114.99;

const mockUserId = 'user_asdfas8dasdf';

export const createMockId = () => {
    return new mongoose.Types.ObjectId().toHexString();
};

export const createMockTicket = async (
    title = mockTitle,
    price = mockPrice
) => {
    const ticket = Ticket.build({ title, price });
    await ticket.save();

    return ticket;
};

export const createMockOrder = async (
    ticket: TicketDoc | undefined,
    expiresAt: Date | undefined,
    userId = mockUserId,
    status = OrderStatus.Created
) => {
    if (!ticket) {
        ticket = await createMockTicket(undefined, undefined);
    }
    if (!expiresAt) {
        expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + 5 * 60);
    }
    const order = Order.build({
        ticket,
        userId,
        status,
        expiresAt,
    });
    await order.save();

    return order;
};