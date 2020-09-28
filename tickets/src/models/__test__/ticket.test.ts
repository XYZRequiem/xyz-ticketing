import { Ticket } from "../ticket";
import { mockCreateTicketPayload, createMockId } from "../../test/mock-data";

describe("testing ticket service ticket model", () => {
    let ticketData;
    const createTicket = async () =>
        Ticket.build({
            ...mockCreateTicketPayload(),
            userId: createMockId(),
        });

    it("implements optimistic concurrency control when updating ticket", async (done) => {
        const ticket = await createTicket();
        await ticket.save();

        const firstInstance = await Ticket.findById(ticket.id);
        const secondInstance = await Ticket.findById(ticket.id);

        firstInstance!.set({ price: 10 });
        secondInstance!.set({ price: 15 });

        await firstInstance!.save();
        try {
            await secondInstance!.save();
        } catch (err) {
            // success: expected error thrown
            return done();
        }

        throw new Error("Expected concurrency error was not thrown");
    });

    it("increments ticket version number on multiple saves", async () => {
        const ticket = await createTicket();
        await ticket.save();
        expect(ticket.version).toEqual(0);

        await ticket.save();
        expect(ticket.version).toEqual(1);

        await ticket.save();
        expect(ticket.version).toEqual(2);
    });
});
