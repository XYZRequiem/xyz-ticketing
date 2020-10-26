import { ExpirationCompleteEvent, Publisher } from "@histoiredevelopment/common";
import { Subjects, Publisher, ExpirationCompletePublisher} from '@histoiredevelopment/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
    
}