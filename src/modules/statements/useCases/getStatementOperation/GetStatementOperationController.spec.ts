import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
let token: string;

describe('Get Statement Operation', () => {
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

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@supertest.com',
      password: '123456',
    });

    token = response.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to get a statement', async () => {
    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'deposit'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).get(`/api/v1/statements/${responseStatement.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.type).toEqual('deposit');
  });

  it('Should not be able to get statement from non-exists user', async () => {
    const response = await request(app).get(`/api/v1/statements/id`)
      .set({
        Authorization: `Bearer invalid`,
      });

    expect(response.status).toBe(401);
  });

  it('Should not be able to get a statement with invalid statement id', async () => {
    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 20,
      description: 'deposit'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).get(`/api/v1/statements/fdd57738-d3ed-4d41-b10c-147a2fc44451`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
