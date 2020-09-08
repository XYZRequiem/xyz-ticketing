import {
    Publisher,
    OrderCreatedEvent,
    Subjects,
} from '@histoiredevelopment/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
