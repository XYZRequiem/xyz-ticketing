import {
    Publisher,
    Subjects,
    TicketCreatedEvent,
} from '@histoiredevelopment/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
