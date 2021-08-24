import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
let token: string;

describe('CREATE STATEMENT', () => {
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

  it('Should be able to deposit', async () => {
    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'deposit'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(responseStatement.status).toBe(201);
    expect(responseStatement.body.type).toEqual('deposit');
    expect(responseStatement.body.amount).toBe(100);
  });

  it('Should not be able to create a statement with non-exists user', async () => {
    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'deposit'
    }).set({
      Authorization: `Bearer token`,
    });

    expect(responseStatement.status).toBe(401);
  });

  it('Should be able o add a new withdraw for an user with sufficient funds', async ()=> {
    const responseStatement = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 20,
      description: 'withdraw'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(responseStatement.status).toBe(201);
    expect(responseStatement.body.type).toEqual('withdraw');
  });

  it('Should not be able o add a new withdraw for an user with insufficient funds', async ()=> {
    const responseStatement = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 200,
      description: 'withdraw'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(responseStatement.status).toBe(400);
  });
});
