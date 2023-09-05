import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserOwnerRoleGuard } from '../auth/user-owner-role.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
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
  },
  {
    id: randomUUID(),
    name: 'test2',
    email: 'test2@mail.com',
    profession: 'tester',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: randomUUID(),
    name: 'test3',
    email: 'test3@mail.com',
    profession: 'tester',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue(newUserData),
            findAll: jest.fn().mockResolvedValue(usersEntityList),
            findOne: jest.fn().mockResolvedValue(newUserData),
            update: jest
              .fn()
              .mockResolvedValue({ ...newUserData, name: 'teste updated' }),
            remove: jest.fn().mockReturnValue(undefined),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
        {
          provide: UserOwnerRoleGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('shoul be able to create a user', async () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'teste 1',
        email: 'test@mail.com',
        password: '123456789',
        profession: 'tester',
      };

      // Act
      const result = await userController.create(body);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(newUserData);
      expect(userService.create).toHaveBeenCalledTimes(1);
      expect(userService.create).toHaveBeenCalledWith(body);
    });

    it('shoul be return a exception', () => {
      // Arrange
      const body: CreateUserDto = {
        name: 'teste 1',
        email: 'test@mail.com',
        password: '123456789',
        profession: 'tester',
      };
      jest.spyOn(userService, 'create').mockRejectedValueOnce(new Error());

      // Assert
      expect(userController.create(body)).rejects.toThrowError();
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

      // Asert
      expect(userController.create(body)).rejects.toThrow(
        new ConflictException('User already exists'),
      );
    });

    it('should not be able to create a user with invalid fields', () => {
      // Arrange
      const body: CreateUserDto = {
        name: '',
        email: '',
        password: '',
      };
      jest
        .spyOn(userService, 'create')
        .mockRejectedValueOnce(new BadRequestException());

      // Assert
      expect(userController.create(body)).rejects.toThrow(
        new BadRequestException(),
      );
    });
  });

  describe('findAll', () => {
    it('should be able to find all users', async () => {
      // Act
      const result = await userController.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(usersEntityList);
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should be return a exception', () => {
      // Arrange
      jest.spyOn(userService, 'findAll').mockRejectedValueOnce(new Error());

      // Assert
      expect(userController.findAll()).rejects.toThrowError();
    });
  });

  describe('findOne', () => {
    it('should be able to find a unique user', async () => {
      // Act
      const result = await userController.findOne(newUserData.id);

      // Assert
      expect(result).toEqual(newUserData);
      expect(userService.findOne).toHaveBeenCalledTimes(1);
      expect(userService.findOne).toHaveBeenCalledWith(newUserData.id);
    });

    it('should be return a not found exception', () => {
      // Arrange
      jest
        .spyOn(userService, 'findOne')
        .mockRejectedValueOnce(new NotFoundException());

      // Assert
      expect(userController.findOne(randomUUID())).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should be return a exception', () => {
      // Arrange
      jest.spyOn(userService, 'findOne').mockRejectedValueOnce(new Error());

      // Assert
      expect(userController.findOne(randomUUID())).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should be able to update a user', async () => {
      // Arrange
      const body: UpdateUserDto = {
        name: 'teste updated',
      };

      // Act
      const result = await userController.update(newUserData.id, body);

      // Assert
      expect(result).toEqual({ ...newUserData, name: 'teste updated' });
      expect(userService.update).toHaveBeenCalledTimes(1);
      expect(userService.update).toHaveBeenCalledWith(newUserData.id, body);
    });

    it('should be return a not found exception', () => {
      // Arrange
      const body: UpdateUserDto = {
        name: 'teste updated',
      };
      jest
        .spyOn(userService, 'update')
        .mockRejectedValueOnce(new NotFoundException());

      // Assert
      expect(userController.update(randomUUID(), body)).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should be return a exception', () => {
      // Arrange
      const body: UpdateUserDto = {
        name: 'teste updated',
      };
      jest.spyOn(userService, 'update').mockRejectedValueOnce(new Error());

      // Assert
      expect(
        userController.update(newUserData.id, body),
      ).rejects.toThrowError();
    });
  });

  describe('remove', () => {
    it('should be able to remove a user', async () => {
      // Act
      const result = await userController.remove(newUserData.id);

      // Assert
      expect(result).toBeUndefined();
      expect(userService.remove).toHaveBeenCalledTimes(1);
      expect(userService.remove).toHaveBeenCalledWith(newUserData.id);
    });

    it('should be return a not found exception', () => {
      // Arrange
      jest
        .spyOn(userService, 'remove')
        .mockRejectedValueOnce(new NotFoundException());

      // Assert
      expect(userController.remove(randomUUID())).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should be return an exception', () => {
      // Arrange
      jest.spyOn(userService, 'remove').mockRejectedValueOnce(new Error());

      // Assert
      expect(userController.remove(newUserData.id)).rejects.toThrowError();
    });
  });
});
