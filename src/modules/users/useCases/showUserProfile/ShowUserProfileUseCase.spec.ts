import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('Should be able to show a user profile', async () => {
    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@test.com',
      password: '123456',
    });

    if(!user.id) throw new Error('User not created');

    const userProfile = await showUserProfileUseCase.execute(user.id);

    expect(userProfile.id).toEqual(user.id);
  });

  it('Should not be able to show user profile from non-exists user', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('4552');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
