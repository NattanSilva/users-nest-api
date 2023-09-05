import { CreateUserDto } from 'src/user/dto/create-user.dto';

export const createFirstUserData: CreateUserDto = {
  name: 'Marcos',
  email: 'marcos@mail.com',
  password: '123456789',
  profession: 'Pentester',
};

export const createSecondUserData: CreateUserDto = {
  name: 'Maria Silva',
  email: 'mariaS@mail.com',
  password: '123456789',
  profession: 'Developer',
};
