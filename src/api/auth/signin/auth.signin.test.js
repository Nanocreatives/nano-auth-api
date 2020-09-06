/* eslint-env jest */
const request = require('supertest');
const httpStatus = require('http-status');

const User = require('../../user/user.model');
const RefreshToken = require('./auth.signin.refresh-token.model');
const app = require('../../../config/express');
const db = require('../../../test/database');

beforeAll(async () => db.connect());
afterEach(async () => db.clearDatabase());
afterAll(async () => db.closeDatabase());

describe('Auth Signin API', () => {
    let registeredUser;
    let unregisteredUser;

    beforeEach(async () => {
        registeredUser = {
            lastname: 'Ikounga',
            firstname: 'Marvell',
            phone: '+242066505467',
            birthdate: '2020-06-21T01:49:15.034Z',
            country: 'FRA',
            email: 'marvell@gmail.com',
            password: 'password',
            role: 'admin',
            verified: true,
            createdAt: '2020-06-21T02:07:36.416Z'
        };

        unregisteredUser = {
            lastname: 'Louemere',
            firstname: 'Joliane',
            phone: '+242066505467',
            birthdate: '2020-06-21T01:49:15.034Z',
            country: 'USA',
            email: 'joliane@gmail.com',
            password: 'password',
            verified: true,
            createdAt: '2020-06-21T02:07:36.416Z'
        };

        await User.deleteMany({});
        await User.create(registeredUser);
        await RefreshToken.deleteMany({});
    });

    describe('POST /v1/auth/login', () => {
        it('should return an accessToken and a refreshToken when email and password matches', () => {
            return request(app)
                .post('/v1/auth/login')
                .send({
                    email: registeredUser.email,
                    password: registeredUser.password
                })
                .expect(httpStatus.OK)
                .then((res) => {
                    delete registeredUser.password;
                    expect(res.header['set-cookie']).toHaveLength(4);
                    expect(res.header['set-cookie'][0]).toContain('x-correlation-id=');
                    expect(res.header['set-cookie'][1]).toContain('access_token_hp=');
                    expect(res.header['set-cookie'][1]).toContain('; Secure; SameSite=Strict');
                    expect(res.header['set-cookie'][2]).toContain('access_token_s=');
                    expect(res.header['set-cookie'][2]).toContain(
                        '; HttpOnly; Secure; SameSite=Strict'
                    );
                    expect(res.header['set-cookie'][3]).toContain('refresh_token=');
                    expect(res.header['set-cookie'][3]).toContain(
                        '; HttpOnly; Secure; SameSite=Strict'
                    );
                    expect(res.body.id).toBeDefined();
                    expect(res.body.firstname).toBe(registeredUser.firstname);
                    expect(res.body.country).toBe(registeredUser.country);
                    expect(res.body.verified).toBe(registeredUser.verified);
                });
        });

        it('should report error when email and password are not provided', () => {
            return request(app)
                .post('/v1/auth/login')
                .send({})
                .expect(httpStatus.BAD_REQUEST)
                .then((res) => {
                    expect(res.body.status).toBe('error');
                    expect(res.body.code).toBe('KO');
                    expect(res.body.message).toBe('Validation Error');
                });
        });

        it('should report error when the email provided is not valid', () => {
            return request(app)
                .post('/v1/auth/login')
                .send({
                    email: 'marvell.ikounga',
                    password: 'password'
                })
                .expect(httpStatus.BAD_REQUEST)
                .then((res) => {
                    expect(res.body.status).toBe('error');
                    expect(res.body.code).toBe('KO');
                    expect(res.body.message).toBe('Validation Error');
                });
        });

        it('should report error when password length is less than 8 character', () => {
            return request(app)
                .post('/v1/auth/login')
                .send({
                    email: registeredUser.email,
                    password: 'xxx'
                })
                .expect(httpStatus.BAD_REQUEST)
                .then((res) => {
                    expect(res.body.status).toBe('error');
                    expect(res.body.code).toBe('KO');
                    expect(res.body.message).toBe('Validation Error');
                });
        });

        it("should report error when email and password don't match", () => {
            return request(app)
                .post('/v1/auth/login')
                .send({
                    email: registeredUser.email,
                    password: 'xxxxxxxx'
                })
                .expect(httpStatus.UNAUTHORIZED)
                .then((res) => {
                    expect(res.body.status).toBe('error');
                    expect(res.body.code).toBe('INVALID_CREDENTIAL');
                    expect(res.body.message).toBe('Invalid credentials');
                });
        });

        it("should report error when email doesn't exist", () => {
            return request(app)
                .post('/v1/auth/login')
                .send({
                    email: unregisteredUser.email,
                    password: 'xxxxxxxx'
                })
                .expect(httpStatus.UNAUTHORIZED)
                .then((res) => {
                    expect(res.body.status).toBe('error');
                    expect(res.body.code).toBe('INVALID_CREDENTIAL');
                    expect(res.body.message).toBe('Invalid credentials');
                });
        });

        it('should delete all cookies when logged out', () => {
            return request(app)
                .post('/v1/auth/logout')
                .send()
                .expect(httpStatus.OK)
                .then((res) => {
                    delete registeredUser.password;
                    expect(res.header['set-cookie']).toHaveLength(4);
                    expect(res.header['set-cookie'][0]).toContain('x-correlation-id=');
                    expect(res.header['set-cookie'][1]).toBe(
                        'access_token_hp=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
                    );
                    expect(res.header['set-cookie'][2]).toBe(
                        'access_token_s=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
                    );
                    expect(res.header['set-cookie'][3]).toBe(
                        'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
                    );
                    expect(res.body.status).toBe('success');
                });
        });
    });
});
