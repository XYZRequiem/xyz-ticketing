import jwt from 'jsonwebtoken';

export const createUserJWT = (id: string, email: string) => {
    return jwt.sign(
        {
            id: id,
            email: email,
        },
        process.env.JWT_KEY!
    );
};
