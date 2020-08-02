import request from 'supertest';
import { app } from '../../app';

import { getMockSignupPayload } from './mock-data';
import { authedSignup } from './auth-helper';

describe('signin route tests', () => {
    describe('validation tests', () => {
        it('should return a 400 when invalid email supplied', async () => {
            const mockPayload = getMockSignupPayload();
            mockPayload.email = 'testing';
            return request(app)
                .post('/api/users/signin')
                .send(mockPayload)
                .expect(400);
        });

        it('should return a 400 when invalid password supplied', async () => {
            const mockPayload = getMockSignupPayload();
            mockPayload.password = '';
            return request(app)
                .post('/api/users/signin')
                .send(mockPayload)
                .expect(400);
        });

        it('should return a 400 when request body empty', async () => {
            const mockPayload = {};
            return request(app)
                .post('/api/users/signin')
                .send(mockPayload)
                .expect(400);
        });
    });

    describe('signin logic tests', () => {
        it('should fail when user with email doesnt exist is supplied', async () => {
            return request(app)
                .post('/api/users/signin')
                .send(getMockSignupPayload())
                .expect(400);
        });

        it('should fail when an incorrect password is supplied', async () => {
            const mockPayload = getMockSignupPayload();
            await authedSignup();

            mockPayload.password = 'teenage mutant ninja turtles';
            return request(app)
                .post('/api/users/signin')
                .send(mockPayload)
                .expect(400);
        });

        it('should return cookie when valid credentials supplied', async () => {
            const mockPayload = getMockSignupPayload();
            await authedSignup();

            const response = await request(app)
                .post('/api/users/signin')
                .send(mockPayload)
                .expect(200);

            expect(response.get('Set-Cookie')).toBeDefined();
        });
    });
});
