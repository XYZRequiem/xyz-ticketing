import { OrderCancelledEvent, OrderStatus } from '@histoiredevelopment/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from "../order-cancelled-listener";
import { createMockId } from "../../../test/mock-data";
import { Order } from '../../../models/order';


describe('Payments Service OrderCancelledListener tests', () => {
    const setup = async () => {
        const listener = new OrderCancelledListener(natsWrapper.client);

        const order = Order.build({
            id: createMockId(),
            status: OrderStatus.Created,
            price: 10,
            userId: createMockId(),
            version: 0,
        });
        await order.save();

        const data: OrderCancelledEvent['data'] = {
            id: order.id,
            version: 1,
            ticket: {
                id: createMockId(),
            },
        };

        // @ts-ignore
        const msg: Message = {
            ack: jest.fn(),
        };

        return { listener, order, data, msg };
    };

    it('should update the order status', async () => {
        const { listener, order, data, msg } = await setup();

        await listener.onMessage(data, msg);

        const updatedOrder = await Order.findById(data.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
    });

    it('should ack the message', async () => {
        const { listener, order, data, msg } = await setup();

        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
    });

    it('should not update status if the order is completed', async () => {
        const { listener, order, data, msg } = await setup();

        order.set({ status: OrderStatus.Complete });
        await order.save();

        // editing the order status above will increment the version
        data.version += 1;

        await listener.onMessage(data, msg);

        const updatedOrder = await Order.findById(data.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
    });
});