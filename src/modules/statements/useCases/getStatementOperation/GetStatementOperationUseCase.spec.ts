import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe('Get Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    )
  });

  it('Should be able to get a statement', async () => {
    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@test.com',
      password: '123456',
    });

    if(!user.id) throw new Error('User not created');

    const createdStatement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 1000,
      description: 'deposit',
      type: OperationType.DEPOSIT
    });

    if(!createdStatement.id) throw new Error('Statement not created');

    const getStatement = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: createdStatement.id,
    });

    expect(getStatement.amount).toEqual(1000);
    expect(getStatement.type).toEqual('deposit');
  });

  it('Should not be able to get statement from non-exists user', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'test',
        statement_id: 'test',
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('Should not be able to get a statement with invalid statement id', async () => {
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

      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: 'statement',
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
