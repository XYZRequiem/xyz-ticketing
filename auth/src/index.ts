import mongoose from 'mongoose';
import { app } from './app';
const PORT = 3000;

const dbString = process.env.DB || 'localhost';
const mongoURL = `mongodb://${dbString}:27017/auth`;

const initApp = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('Missing JWT_KEY environment variable');
    }
    try {
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
