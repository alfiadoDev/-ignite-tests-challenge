import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe('Deposit', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('Should be able to deposit', async () => {
    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@test.com',
      password: '123456',
    });

    if(!user.id) throw new Error('User not created');

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 1000,
      description: 'deposit',
      type: OperationType.DEPOSIT
    });

    expect(statement).toHaveProperty('id');
  });

  it('Should not be able to create a statement with non-exists user', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'test',
        amount: 1000,
        description: 'deposit',
        type: OperationType.DEPOSIT
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('Should be able o add a new withdraw for an user with sufficient funds', async () => {
    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@test.com',
      password: '123456',
    });

    if(!user.id) throw new Error('User not created');

    await createStatementUseCase.execute({
      user_id: user.id,
      amount: 1000,
      description: 'deposit',
      type: OperationType.DEPOSIT
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 900,
      description: 'withdraw',
      type: OperationType.WITHDRAW
    });

    expect(statement).toHaveProperty('id');
  });

  it('Should not be able o add a new withdraw for an user with insufficient funds', async () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'test',
        email: 'test@test.com',
        password: '123456',
      });

      if(!user.id) throw new Error('User not created');

      await createStatementUseCase.execute({
        user_id: user.id,
        amount: 1000,
        description: 'deposit',
        type: OperationType.DEPOSIT
      });

      await createStatementUseCase.execute({
        user_id: user.id,
        amount: 2000,
        description: 'withdraw',
        type: OperationType.WITHDRAW
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
