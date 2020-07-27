import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';
const router = express.Router();

router.get(
    '/api/users/signin',
    [
        body('email').isEmail().withMessage('Must provide valid email'),
        body('password')
            .trim()
            .isLength({ min: 6, max: 20 })
            .withMessage('Password must be between 6 and 20 characters'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordMatches = await Password.compare(
            existingUser.password,
            password
        );
        if (!passwordMatches) {
            throw new BadRequestError('Invalid credentials');
        }

        // generate jwt
        const userJWT = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
            },
            process.env.JWT_KEY!
        );

        req.session = { jwt: userJWT };

        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };
