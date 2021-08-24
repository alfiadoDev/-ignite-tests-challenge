import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let connection: Connection;

describe('Authenticate User Supertest', () => {
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

  it('Should be able to authenticate a user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@supertest.com',
      password: '123456',
    });

    expect(response.body).toHaveProperty('token');
  });

  it('Should not be able to authenticate a user with invalid passwords', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@supertest.com',
      password: '123456789',
    });

    expect(response.status).toBe(401);
  });

  it('Should not be able to authenticate a user does not exists', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'inavalid@supertest.com',
      password: '123456',
    });

    expect(response.status).toBe(401);
  });
});
