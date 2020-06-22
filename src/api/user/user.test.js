/* eslint-env jest */
const db = require('../../test/database');
const UserModel = require('./user.model');

beforeAll(async () => db.connect());
afterEach(async () => db.clearDatabase());
afterAll(async () => db.closeDatabase());

const userData = {
  lastname: 'Ikounga',
  firstname: 'Marvell',
  phone: '+242066505467',
  birthdate: '2020-06-21T01:49:15.034Z',
  country: 'FRA',
  email: 'marvell.ikoungai@gmail.com',
  password: 'password',
  role: 'admin',
  verified: true,
  createdAt: '2020-06-21T02:07:36.416Z'
};

describe('User Model Test', () => {
  it('create & save user successfully', async () => {
    const validUser = new UserModel(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.firstname).toBe('Marvell');
    expect(savedUser.country).toBe('FRA');
    expect(savedUser.verified).toBe(true);
  });
});
