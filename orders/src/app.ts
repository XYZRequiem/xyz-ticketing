import express from 'express';
require('express-async-errors');
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
    errorHandler,
    NotFoundError,
    currentUser,
} from '@histoiredevelopment/common';

import { createOrderRouter } from './routes/create';
import { getOrderRouter } from './routes/get-order';
import { getOrdersRouter } from './routes/get-orders';
import { updateOrdersRouter } from './routes/update';
// import { updateOrderRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.use(currentUser);
app.use(createOrderRouter);
app.use(getOrderRouter);
app.use(getOrdersRouter);
app.use(updateOrdersRouter);
// app.use(updateOrderRouter);

app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
