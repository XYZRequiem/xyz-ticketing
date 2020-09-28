import { natsWrapper } from "../../../nats-wrapper";
import { mockCreateTicketPayload, createMockId } from "../../../test/mock-data";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent, OrderStatus } from "@histoiredevelopment/common";
import { Message } from "node-nats-streaming";

describe("Ticket Service OrderCancelledListener tests", () => {
    const setup = async () => {
        const listener = new OrderCancelledListener(natsWrapper.client);

        const ticket = Ticket.build(mockCreateTicketPayload());
        ticket.set({orderId: createMockId()})
        await ticket.save();

        const data: OrderCancelledEvent["data"] = {
            id: createMockId(),
            version: 0,
            ticket: {
                id: ticket.id,
            },
        };

        // @ts-ignore
        const msg: Message = {
            ack: jest.fn(),
        };

        return {
            listener,
            ticket,
            data,
            msg,
        };
    };

    it("should unset orderId on the ticket", async () => {
        const { listener, ticket, data, msg } = await setup();

        await listener.onMessage(data, msg);

        const updatedTicket = await Ticket.findById(ticket.id);

        expect(updatedTicket!.orderId).toEqual(undefined);
    });

    it('should publish TicketUpdatedEvent', async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
        
        const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
        expect(ticketUpdatedData.orderId).toEqual(undefined)
    })

    it("should ack the message", async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
    });
});
