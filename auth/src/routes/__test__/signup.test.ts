import request from 'supertest';
import { app } from '../../app';

import { getMockSignupPayload } from './mock-data';
import { authedSignup } from './auth-helper';

describe('signup route tests', () => {
    describe('validation tests', () => {
        it('should return a 201 on successful signup', async () => {
            return request(app)
                .post('/api/users/signup')
                .send(getMockSignupPayload())
                .expect(201);
        });

        it('should return a 400 when invalid email supplied', async () => {
            const mockPayload = getMockSignupPayload();
            mockPayload.email = 'testing';
            return request(app)
                .post('/api/users/signup')
                .send(mockPayload)
                .expect(400);
        });

        it('should return a 400 when invalid password supplied', async () => {
            const mockPayload = getMockSignupPayload();
            mockPayload.password = 'te';
            return request(app)
                .post('/api/users/signup')
                .send(mockPayload)
                .expect(400);
        });

        it('should return a 400 when request body empty', async () => {
            const mockPayload = {};
            return request(app)
                .post('/api/users/signup')
                .send(mockPayload)
                .expect(400);
        });
    });

    describe('signup logic tests', () => {
        it('should return 400 when user with email already exists', async () => {
            await request(app)
                .post('/api/users/signup')
                .send(getMockSignupPayload())
                .expect(201);

            await request(app)
                .post('/api/users/signup')
                .send(getMockSignupPayload())
                .expect(400);
        });
    });

    describe('jwt tests', () => {
        it('should set a cookie after successful signup', async () => {
            const cookie = await authedSignup();
            expect(cookie).toBeDefined();
        });
    });
});
