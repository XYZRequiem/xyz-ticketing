import { OrderCreatedEvent, OrderStatus } from '@histoiredevelopment/common'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from "../order-created-listener"
import { createMockId } from "../../../test/mock-data";
import { Order } from '../../../models/order';

describe('Payments Service OrderCreatedListener tests', () => {
    const setup = async () => {
        const listener = new OrderCreatedListener(natsWrapper.client);

        const data: OrderCreatedEvent['data'] = {
            id: createMockId(),
            version: 0,
            expiresAt: 'asdfjkk',
            userId: 'asdfasg',
            status: OrderStatus.Created,
            ticket: {
                id: createMockId(),
                price: 10
            },
        };

        // @ts-ignore
        const msg: Message = {
            ack: jest.fn(),
        }

        return { listener, data, msg }
    };

    it('should replicate order info from event data', async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        const order = await Order.findById(data.id);

        expect(order!.id).toEqual(data.id);
        expect(order!.price).toEqual(data.ticket.price);
    });

    it('should ack the message', async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
    });
})