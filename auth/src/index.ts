import mongoose from 'mongoose';
import { app } from './app';
const PORT = 3000;

const mongoURL = process.env.MONGO_URI || 'mongodb://localhost:27017/auth';

const initApp = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('Missing JWT_KEY environment variable');
    }
    if (!mongoURL.includes('localhost') && !process.env.MONGO_URI) {
        throw new Error('Missing MONGO_URI environment variable');
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
        console.log(`Now listening on port ${PORT}!`);
    });
};
initApp();
