import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('GET BALANCE Supertest', () => {
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

  it('Should be able to get statement and balance', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@supertest.com',
      password: '123456',
    });

    const responseBalance = await request(app).get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${response.body.token}`,
      });

    expect(responseBalance.body).toHaveProperty('balance');
    expect(responseBalance.body).toHaveProperty('statement');
  });

  it('Should not be able to get statement and balance from non-exists user', async () => {
    const responseBalance = await request(app).get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer token`,
      });

    expect(responseBalance.status).toBe(401);
  });
});
