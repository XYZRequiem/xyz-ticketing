import { TicketCreatedEvent } from "@histoiredevelopment/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import {
    createMockId,
    mockTitle,
    mockPrice,
    mockUserId,
} from "../../../test/mock-data";
import { TicketCreatedListener } from "../ticket-created-listener";

describe("Order Service TicketCreatedListener tests", () => {
    const setup = async () => {
        const listener = new TicketCreatedListener(natsWrapper.client);
        const data: TicketCreatedEvent["data"] = {
            version: 0,
            id: createMockId(),
            title: mockTitle,
            price: mockPrice,
            userId: mockUserId,
        };

        // @ts-ignore
        const msg: Message = {
            ack: jest.fn(),
        };

        return { listener, data, msg };
    };

    it("should create and save a tick", async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        const ticket = await Ticket.findById(data.id);

        expect(ticket).toBeDefined();
        expect(ticket!.title).toBe(data.title);
        expect(ticket!.price).toBe(data.price);
    });

    it("should ack() the message", async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled()

    });
});
