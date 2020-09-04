import jwt from 'jsonwebtoken';
import { createMockId } from './mock-data';

export const authedSignup = () => {
    const payload = {
        id: createMockId(),
        email: `${createMockId()}@lkji.com`,
    };

    const session = { jwt: jwt.sign(payload, process.env.JWT_KEY!) };
    const sessionJSON = JSON.stringify(session);

    const base64 = Buffer.from(sessionJSON).toString('base64');
    return `express:sess=${base64}`;
};
