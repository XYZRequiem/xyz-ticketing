import { natsWrapper } from "../../../nats-wrapper";
import { mockCreateTicketPayload, createMockId } from "../../../test/mock-data";
import { OrderCreatedListener } from "../order-created-listener";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@histoiredevelopment/common";
import { Message } from "node-nats-streaming";

describe("Ticket Service OrderCreatedListener tests", () => {
    const setup = async () => {
        const listener = new OrderCreatedListener(natsWrapper.client);

        const ticket = Ticket.build(mockCreateTicketPayload());
        await ticket.save();

        const data: OrderCreatedEvent["data"] = {
            id: createMockId(),
            version: 0,
            status: OrderStatus.Created,
            userId: createMockId(),
            expiresAt: "asdfasdf",
            ticket: {
                id: ticket.id,
                price: ticket.price,
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

    it("should set the event orderId on the ticket", async () => {
        const { listener, ticket, data, msg } = await setup();

        await listener.onMessage(data, msg);

        const updatedTicket = await Ticket.findById(ticket.id);

        expect(updatedTicket!.orderId).toEqual(data.id);
    });

    it("should publish TicketUpdatedEvent", async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        expect(natsWrapper.client.publish).toHaveBeenCalled();

        const ticketUpdatedData = JSON.parse(
            (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
        );
        expect(data.id).toEqual(ticketUpdatedData.orderId);
    });

    it("should ack the message", async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
    });
});
