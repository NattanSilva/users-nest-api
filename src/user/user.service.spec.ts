import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

const newUserData = {
  id: randomUUID(),
  name: 'test',
  email: 'test@mail.com',
  profession: 'tester',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const usersEntityList = [
  {
    id: randomUUID(),
    name: 'test1',
    email: 'test1@mail.com',
    profession: 'tester',
    createdAt: new Date(),
    updatedAt: new Date(),
    address: null,
  },
  {
    id: randomUUID(),
    name: 'test2',
    email: 'test2@mail.com',
    profession: 'tester',
    createdAt: new Date(),
    updatedAt: new Date(),
    address: null,
  },
  {
    id: randomUUID(),
    name: 'test3',
    email: 'test3@mail.com',
    profession: 'tester',
    createdAt: new Date(),
    updatedAt: new Date(),
    address: null,
  },
];

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            create: jest.fn().mockReturnValue(newUserData),
            save: jest.fn().mockResolvedValue(newUserData),
            findOneBy: jest.fn().mockResolvedValue(newUserData),
            findOne: jest
              .fn()
              .mockResolvedValue({ ...newUserData, address: null }),
            find: jest.fn().mockResolvedValue(usersEntityList),
            merge: jest
              .fn()
              .mockReturnValue({ ...newUserData, name: 'teste updated' }),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    it('should be able to create a user', async () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'teste 1',
        email: 'test@mail.com',
        password: '123456789',
        profession: 'tester',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(undefined);

      // Act
      const result = await userService.create(body);

      // Assert
      expect(result).toEqual({ ...newUserData, password: undefined });
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should not be able to create a user with same email', () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'teste 1',
        email: 'test@mail.com',
        password: '123456789',
        profession: 'tester',
      };

      jest
        .spyOn(userService, 'create')
        .mockRejectedValueOnce(new ConflictException('User already exists'));

      // Assert
      expect(userService.create(body)).rejects.toThrow(
        new ConflictException('User already exists'),
      );
    });

    it('Should be return an exception', () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'teste 1',
        email: 'test@mail.com',
        password: '123456789',
        profession: 'tester',
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(undefined);
      jest.spyOn(userService, 'create').mockRejectedValueOnce(new Error());

      // Assert
      expect(userService.create(body)).rejects.toThrowError();
    });
  });

  describe('findAll', () => {
    it('should be list all users', async () => {
      // Act
      const result = await userService.findAll();

      // Assert
      expect(result).toEqual(usersEntityList);
      expect(userRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should be return an exception', () => {
      // Arrange
      jest.spyOn(userRepository, 'find').mockRejectedValueOnce(new Error());

      // Assert
      expect(userService.findAll()).rejects.toThrowError();
    });
  });

  describe('findOne', () => {
    it('should be able to find a user', async () => {
      // Act
      const result = await userService.findOne(newUserData.id);

      // Assert
      expect(result).toEqual({ ...newUserData, address: null });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: newUserData.id },
        relations: { address: true },
      });
    });

    it('should be return a not found exception', () => {
      // Arrange
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValueOnce(new NotFoundException());

      // Assert
      expect(userService.findOne(randomUUID())).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should be return an exception', () => {
      // Arrange
      jest.spyOn(userRepository, 'findOne').mockRejectedValueOnce(new Error());

      // Assert
      expect(userService.findOne(newUserData.id)).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should be able to update a user', async () => {
      // Arrange
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        ...newUserData,
        name: 'teste updated',
        password: undefined,
      });
      // Act
      const result = await userService.update(newUserData.id, {
        name: 'teste updated',
      });

      // Assert
      expect(result).toEqual({ ...newUserData, name: 'teste updated' });
      expect(userRepository.merge).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should be return a not found exception', () => {
      // Arrange
      const body: UpdateUserDto = {
        name: 'teste updated',
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(undefined);

      // Assert
      expect(userService.update(randomUUID(), body)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should be return an exception', () => {
      // Arrange
      jest.spyOn(userRepository, 'save').mockRejectedValueOnce(new Error());

      // Assert
      expect(
        userService.update(newUserData.id, { name: 'teste updated' }),
      ).rejects.toThrowError();
    });
  });

  describe('remove', () => {
    it('should be able to remove a user', async () => {
      // Act
      const result = await userService.remove(newUserData.id);

      // Assert
      expect(result).toBeUndefined();
      expect(userRepository.delete).toHaveBeenCalledTimes(1);
      expect(userRepository.delete).toHaveBeenCalledWith({
        id: newUserData.id,
      });
    });

    it('should be return a not found exception', () => {
      // Arrange
      jest
        .spyOn(userRepository, 'delete')
        .mockRejectedValueOnce(new NotFoundException('User not found'));

      // Assert
      expect(userService.remove(randomUUID())).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should be return an exception', () => {
      // Arrange
      jest.spyOn(userRepository, 'delete').mockRejectedValueOnce(new Error());

      // Assert
      expect(userService.remove(newUserData.id)).rejects.toThrowError();
    });
  });
});
