import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const initApp = async () => {
    const mandatoryEnvVariables = [
        'NATS_CLIENT_ID',
        'NATS_URL',
        'NATS_CLUSTER_ID',
    ];
    for (let envVariable of mandatoryEnvVariables) {
        if (!process.env[envVariable]) {
            throw new Error(`Missing ${envVariable} environment variable`);
        }
    }

    const { NATS_CLIENT_ID, NATS_URL, NATS_CLUSTER_ID } = process.env;
    try {
        await natsWrapper.connect(NATS_CLUSTER_ID!, NATS_CLIENT_ID!, NATS_URL!);
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!!');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.error(err);
    }
};
initApp();
