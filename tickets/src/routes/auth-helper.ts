import jwt from 'jsonwebtoken';

export const authedSignup = () => {
    const payload = {
        id: 'as89d7fakjhv34',
        email: 'ijkl@lkji.com',
    };

    const session = { jwt: jwt.sign(payload, process.env.JWT_KEY!) };
    const sessionJSON = JSON.stringify(session);

    const base64 = Buffer.from(sessionJSON).toString('base64');
    return `express:sess=${base64}`;
};
