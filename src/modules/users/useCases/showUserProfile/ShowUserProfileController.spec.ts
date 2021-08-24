import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Profile Supertest', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const id = uuid();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'Supertest', 'test@supertest.com', '${password}', 'now()', 'now()')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to SHOW user Profile', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@supertest.com',
      password: '123456',
    });

    const responseUserProfile = await request(app).get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${response.body.token}`,
      });

    expect(responseUserProfile.body).toHaveProperty('id');
    expect(responseUserProfile.body.email).toEqual('test@supertest.com');
    expect(responseUserProfile.body.name).toEqual('Supertest');
  });

  it('Should not be able to show user profile from non-exists user', async () => {
    const responseUserProfile = await request(app).get('/api/v1/profile')
      .set({
        Authorization: `Bearer token`,
      });

    expect(responseUserProfile.status).toBe(401);
  });
});
