import request from 'supertest';
import { app } from '../../app';

import { mockEmail } from './mock-data';
import { authedSignup } from './auth-helper';

describe('current user route tests', () => {
    it('should respond with details about the current user', async () => {
        const cookie = await authedSignup();

        const response = await request(app)
            .get('/api/users/currentuser')
            .set('Cookie', cookie)
            .send()
            .expect(200);

        expect(response.body.currentUser.email).toEqual(mockEmail);
    });

    it('should respond with null when current user is not logged in', async () => {
        const response = await request(app)
            .get('/api/users/currentuser')
            .send()
            .expect(200);

        expect(response.body.currentUser).toEqual(null);
    });
});
