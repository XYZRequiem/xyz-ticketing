import request from 'supertest';
import { app } from '../../app';

import { getMockSignupPayload } from './mock-data';
import { authedSignup } from './auth-helper';
describe('signout route tests', () => {
    it('should clear the cookie after signing out', async () => {
        await authedSignup();

        const response = await request(app)
            .post('/api/users/signout')
            .send({})
            .expect(200);

        expect(response.get('Set-Cookie')[0]).toBe(
            'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
        );
    });
});
