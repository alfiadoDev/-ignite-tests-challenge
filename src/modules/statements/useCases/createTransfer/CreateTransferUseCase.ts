import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTrnasferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

enum OperationType {
  TRANSFER = 'transfer',
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async execute({
    user_id,
    receiver_id,
    amount,
    description
   }: ICreateTransferDTO) {
    const sender = await this.usersRepository.findById(user_id);
    const receiver = await this.usersRepository.findById(receiver_id!);

    if(!sender) throw new CreateTransferError.SenderNotFound();

    if(!receiver) throw new CreateTransferError.ReceiverNotFound();

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id,
    });

    if(balance < amount) throw new CreateTransferError.InsufficientFunds();

    const transferOperation = await this.statementsRepository.create({
      user_id,
      receiver_id,
      type: OperationType.TRANSFER,
      amount,
      description,
    });

    return transferOperation;
  }

}

export default CreateTransferUseCase;
