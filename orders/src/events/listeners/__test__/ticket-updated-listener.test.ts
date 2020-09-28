import { TicketUpdatedEvent } from "@histoiredevelopment/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { createMockId, createMockTicket } from "../../../test/mock-data";
import { TicketUpdatedListener } from "../ticket-updated-listener";

describe("Order Service TicketUpdatedListener tests", () => {
    const updatedTitle = "Labarinth - Still Don't Know My Name";
    const updatedPrice = 25.99;

    const setup = async () => {
        const listener = new TicketUpdatedListener(natsWrapper.client);

        const ticket = await createMockTicket();

        const data: TicketUpdatedEvent["data"] = {
            id: ticket.id,
            version: ticket.version + 1,
            title: updatedTitle,
            price: updatedPrice,
            userId: createMockId(),
        };

        // @ts-ignore
        const msg: Message = {
            ack: jest.fn(),
        };

        return { listener, data, msg, ticket };
    };

    it("should find, update, and save a ticket", async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        const updatedTicket = await Ticket.findById(data.id);

        expect(updatedTicket!.title).toEqual(data.title);
        expect(updatedTicket!.price).toEqual(data.price);
        expect(updatedTicket!.version).toEqual(data.version);
    });

    it("should ack the message", async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
    });

    it("should not ack if the version number is greater than expected", async () => {
        const { listener, data, msg, ticket } = await setup();
        data.version = 10;

        try {
            await listener.onMessage(data, msg);
        } catch (err) {
            // Do nothing
        }

        expect(msg.ack).not.toHaveBeenCalled();
    });
});
