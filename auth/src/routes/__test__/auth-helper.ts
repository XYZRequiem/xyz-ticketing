import request from 'supertest';
import { app } from '../../app';

import { getMockSignupPayload } from './mock-data';

export const authedSignup = async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send(getMockSignupPayload())
        .expect(201);

    return response.get('Set-Cookie');
};
