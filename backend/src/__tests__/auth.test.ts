import { getTestDataSource, initTestDb, clearAllTables } from './helpers/testDb';

jest.mock('../data-source', () => ({
  AppDataSource: getTestDataSource()
}));

import { createTestApp } from './helpers/testApp';
import request from 'supertest';
import { User } from '../entities/User';
import argon2 from 'argon2';
import { Express } from 'express';

let app: Express;

beforeAll(async () => {
  await initTestDb();
  app = createTestApp();
  await clearAllTables();
});

describe('POST /auth/signup', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Signup successful');
    expect(res.body.user.username).toBe('testuser');
  });

  it('rejects duplicate username', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        username: 'testuser',
        email: 'another@example.com',
        password: 'password123'
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Username already exists');
  });

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        username: 'anotheruser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Email already registered');
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        username: 'shortpwuser',
        email: 'shortpw@example.com',
        password: '123'
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Password must be longer');
  });

  it('rejects missing email', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        username: 'noemail',
        password: 'password123'
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Email or username missing');
  });
});

describe('POST /auth/login/password', () => {
  beforeAll(async () => {
    const ds = getTestDataSource();
    const userRepo = ds.getRepository(User);
    const hashedPassword = await argon2.hash('loginpass123', {
      timeCost: 3,
      memoryCost: 1024 * 64
    });
    await userRepo.save({
      username: 'loginuser',
      email: 'login@example.com',
      password_hash: hashedPassword
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/auth/login/password')
      .send({
        username: 'loginuser',
        password: 'loginpass123'
      });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.user.username).toBe('loginuser');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/auth/login/password')
      .send({
        username: 'loginuser',
        password: 'wrongpassword'
      });
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Incorrect');
  });

  it('rejects non-existent user', async () => {
    const res = await request(app)
      .post('/auth/login/password')
      .send({
        username: 'nobody',
        password: 'password123'
      });
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Incorrect');
  });
});

describe('GET /auth/sessionStatus', () => {
  it('returns unauthorized when not logged in', async () => {
    const res = await request(app).get('/auth/sessionStatus');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Unauthorized');
  });

  it('returns authorized after login', async () => {
    const agent = request.agent(app);

    await agent.post('/auth/signup').send({
      username: 'sessionuser',
      email: 'session@example.com',
      password: 'password123'
    });

    const res = await agent.get('/auth/sessionStatus');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Authorized');
    expect(res.body.session).toBeDefined();
  });
});

describe('POST /auth/logout', () => {
  it('logs out successfully', async () => {
    const agent = request.agent(app);

    await agent.post('/auth/signup').send({
      username: 'logoutuser',
      email: 'logout@example.com',
      password: 'password123'
    });

    const sessionRes = await agent.get('/auth/sessionStatus');
    expect(sessionRes.body.status).toBe('Authorized');

    const res = await agent.post('/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout successful');

    const afterRes = await agent.get('/auth/sessionStatus');
    expect(afterRes.body.status).toBe('Unauthorized');
  });
});
