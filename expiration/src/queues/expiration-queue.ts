import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expirationCompletePublisher";
import { natsWrapper } from "../nats-wrapper";

interface JobPayload {
    orderId: string;
}

const expirationQueue = new Queue<JobPayload>("order:expiration", {
    redis: {
        host: process.env.REDIS_HOST,
    },
});

expirationQueue.process(async (job) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId,
    })

});

export { expirationQueue };
