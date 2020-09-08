import {
    Publisher,
    OrderCancelledEvent,
    Subjects,
} from '@histoiredevelopment/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
