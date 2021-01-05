import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@histoiredevelopment/common'
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queueGroupName'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findByIdAndPreviousVersion(data);
        if (!order) {
            throw new Error('Order not found')
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    }
}