import mongoose from 'mongoose';
import { app } from './app';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';
const PORT = 3000;

const mongoURL = process.env.MONGO_URI || `mongodb://localhost:27017/tickets`;

const initApp = async () => {
    if (!mongoURL.includes('localhost') && !process.env.MONGO_URI) {
        throw new Error('Missing MONGO_URI environment variable');
    }
    const mandatoryEnvVariables = [
        'JWT_KEY',
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
            console.log('NATS connection closed!');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen()
        new OrderCancelledListener(natsWrapper.client).listen()

        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });

        console.log('Connected to mongoDB');
    } catch (err) {
        console.error(err);
    }

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}!`);
    });
};
initApp();
