import { Subjects, Publisher, PaymentCreatedEvent } from '@histoiredevelopment/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
