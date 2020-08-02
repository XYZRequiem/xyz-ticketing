import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { createUserJWT } from '../helpers/cookie-setter';

import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';
const router = express.Router();

router.post(
    '/api/users/signin',
    [
        body('email').isEmail().withMessage('Must provide valid email'),
        body('password')
            .trim()
            .isLength({ min: 6 })
            .withMessage('Password must be greater than 6 characters'),
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
        const userJWT = createUserJWT(existingUser.id, existingUser.email);

        req.session = { jwt: userJWT };

        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };
