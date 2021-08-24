import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';
import { CreateUserError } from './CreateUserError';

let connection: Connection;

describe('Create User Supertest', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create a new User', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'supertest',
      email: 'test@supertest.com',
      password: '123456',
    });

    expect(response.status).toBe(201);
  });

  it('Should not be able to create a new User if exists', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'supertest',
      email: 'test@supertest.com',
      password: '123456',
    });

    expect(async () => {
      await request(app).post('/api/v1/users').send({
        name: 'supertest',
        email: 'test@supertest.com',
        password: '123456',
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
