import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Balance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it('Should be able to get statement and balance', async () => {
    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@test.com',
      password: '123456',
    });

    if(!user.id) throw new Error('User not created');

    const userBalance = await getBalanceUseCase.execute({ user_id: user.id });

    expect(userBalance).toHaveProperty('balance');
    expect(userBalance).toHaveProperty('statement');
  });

  it('Should not be able to get statement and balance from non-exists user', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'test' });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
