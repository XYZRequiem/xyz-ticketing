import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";

const PORT = 3000;

const mongoURL = process.env.MONGO_URI || `mongodb://localhost:27017/orders`;

const initApp = async () => {
    if (!mongoURL.includes("localhost") && !process.env.MONGO_URI) {
        throw new Error("Missing MONGO_URI environment variable");
    }
    const mandatoryEnvVariables = [
        "JWT_KEY",
        "NATS_CLIENT_ID",
        "NATS_URL",
        "NATS_CLUSTER_ID",
    ];
    for (let envVariable of mandatoryEnvVariables) {
        if (!process.env[envVariable]) {
            throw new Error(`Missing ${envVariable} environment variable`);
        }
    }

    const { NATS_CLIENT_ID, NATS_URL, NATS_CLUSTER_ID } = process.env;
    try {
        await natsWrapper.connect(NATS_CLUSTER_ID!, NATS_CLIENT_ID!, NATS_URL!);
        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed!");
            process.exit();
        });
        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();

        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });

        console.log("Connected to mongoDB");
    } catch (err) {
        console.error(err);
    }

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}!`);
    });
};
initApp();
