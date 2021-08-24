import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it('Should be able to create a new user', async ()=> {
    const response = await createUserUseCase.execute({
      email: 'teste@teste.com',
      name: 'test',
      password: '123456',
    });

    expect(response).toHaveProperty('id');
  })

  it('Should not be able to create a new user', async ()=> {
    const user = {
      email: 'teste@teste.com',
      name: 'test',
      password: '123456',
    };

    await createUserUseCase.execute(user);

    expect(async () => {
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError);
  })
});
