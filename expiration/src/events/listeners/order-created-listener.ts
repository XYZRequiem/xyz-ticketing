import { Listener, OrderCreatedEvent, Subjects } from '@histoiredevelopment/common'
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';
import { queueGroupName } from './queueGroupName';

const seconds = 1000
const minutes = 60 * seconds
const hours = 60 * minutes

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log(`Waiting ${delay/minutes}m ${delay%minutes/seconds}s to process the job`);

        await expirationQueue.add({
            orderId: data.id
        }, {
            delay
        });

        msg.ack();
    }

}