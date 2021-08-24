import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Sessions', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it('Should be able to authenticate a user', async () => {
    const user = {
      email: 'teste@teste.com',
      name: 'test',
      password: '123456',
    };

    await createUserUseCase.execute(user);

    const response = await authenticateUserUseCase.execute({
      email: 'teste@teste.com',
      password: '123456',
    });

    expect(response).toHaveProperty('token');
  });

  it('Should not be able to authenticate a user does not exists', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'teste@teste.com',
        password: '123456',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('Should not be able to authenticate a user with invalid passwords', async () => {
    const user = {
      email: 'teste@teste.com',
      name: 'test',
      password: '123456',
    };

    await createUserUseCase.execute(user);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'teste@teste.com',
        password: '123456789',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
})
