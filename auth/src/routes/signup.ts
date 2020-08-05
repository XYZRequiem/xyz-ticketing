import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { createUserJWT } from '../helpers/cookie-setter';

import { BadRequestError, validateRequest } from '@histoiredevelopment/common';
import { User } from '../models/user';
const router = express.Router();

router.post(
    '/api/users/signup',
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
        if (existingUser) {
            throw new BadRequestError('Email in use');
        }

        const user = User.build({ email, password });
        await user.save();

        // generate jwt
        const userJWT = createUserJWT(user.id, user.email);

        req.session = { jwt: userJWT };

        res.status(201).send(user);
    }
);

export { router as signupRouter };
