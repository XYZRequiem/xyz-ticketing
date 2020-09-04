import {
    Publisher,
    Subjects,
    TicketUpdatedEvent,
} from '@histoiredevelopment/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedPublisher> {
    readonly subject = Subjects.TicketUpdated;
    data = {};
}
