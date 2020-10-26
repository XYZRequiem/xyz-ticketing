import { Order, OrderDoc, OrderStatus } from "../../../models/order";
import { Ticket, TicketDoc } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { ExpirationCompleteEvent, Listener } from "@histoiredevelopment/common";
import {
    createMockId,
    mockTitle,
    mockPrice,
    mockUserId,
} from "../../../test/mock-data";
import { Message } from "node-nats-streaming";

describe("Order Service ExpirationCompleteListener tests", () => {
    const setup = async () => {
        const listener = new ExpirationCompleteListener(natsWrapper.client);

        const ticket = Ticket.build({
            id: createMockId(),
            title: mockTitle,
            price: mockPrice,
            version: 0,
        });
        await ticket.save();

        const order = Order.build({
            status: OrderStatus.Created,
            userId: createMockId(),
            expiresAt: new Date(),
            ticket,
        });
        await order.save();

        const data: ExpirationCompleteEvent["data"] = {
            orderId: order.id,
        };

        // @ts-ignore
        const msg: Message = {
            ack: jest.fn(),
        };

        return {
            listener,
            ticket,
            order,
            data,
            msg,
        };
    };

    let testData: {
        listener: ExpirationCompleteListener;
        ticket: TicketDoc;
        order: OrderDoc;
        data: ExpirationCompleteEvent["data"];
        msg: Message;
    };

    beforeEach(async () => {
        testData = await setup();
    });

    it("should update the order status to CANCELLED", async () => {
        await testData.listener.onMessage(testData.data, testData.msg);

        const updatedOrder = await Order.findById(testData.order.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
    });
    it("should not update the order status of COMPLETE orders", async () => {
        testData.order.set({ status: OrderStatus.Complete });
        await testData.order.save();

        await testData.listener.onMessage(testData.data, testData.msg);

        const updatedOrder = await Order.findById(testData.order.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
    });
    it("should emit an OrderCancelled event", async () => {
        await testData.listener.onMessage(testData.data, testData.msg);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
        const eventData = JSON.parse(
            (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
        );

        expect(eventData.id).toEqual(testData.order.id);
    });
    it("should ack the message", async () => {
        await testData.listener.onMessage(testData.data, testData.msg);

        expect(testData.msg.ack).toHaveBeenCalled();
    });
});
