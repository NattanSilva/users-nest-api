import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressEntity } from './entities/address.entity';

const currentUser = {
  id: randomUUID(),
  name: 'test',
  email: 'test@mail.com',
  password: undefined,
  profession: 'tester',
  createdAt: new Date(),
  updatedAt: new Date(),
  address: null,
};

const createdAddress = {
  id: randomUUID(),
  road: 'teste1',
  district: 'testeA',
  houseNumber: 1,
  cep: '12345678',
  city: 'JavaScript',
  state: 'TS',
  complement: 'teste de um usuario',
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: currentUser,
};

describe('AddressService', () => {
  let addressService: AddressService;
  let addresRepository: Repository<AddressEntity>;
  let userRepositoty: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: getRepositoryToken(AddressEntity),
          useValue: {
            create: jest.fn().mockReturnValue(createdAddress),
            save: jest.fn().mockResolvedValue(createdAddress),
            find: jest.fn().mockResolvedValue([createdAddress]),
            findOneBy: jest.fn().mockResolvedValue(createdAddress),
            merge: jest.fn().mockReturnValue({
              ...createdAddress,
              road: 'teste1_Updated',
              houseNumber: 2,
            }),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue(currentUser),
          },
        },
      ],
    }).compile();

    addressService = module.get<AddressService>(AddressService);
    addresRepository = module.get<Repository<AddressEntity>>(
      getRepositoryToken(AddressEntity),
    );
    userRepositoty = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(addressService).toBeDefined();
    expect(addresRepository).toBeDefined();
    expect(userRepositoty).toBeDefined();
  });

  describe('create', () => {
    it('should be create a address successfully', async () => {
      // Arrange
      const body: CreateAddressDto = {
        road: 'teste1',
        district: 'testeA',
        houseNumber: 1,
        cep: '12345678',
        city: 'JavaScript',
        state: 'TS',
        complement: 'teste de um usuario',
      };

      // Act
      const result = await addressService.create(body, currentUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(createdAddress);
      expect(userRepositoty.findOne).toHaveBeenCalledTimes(1);
      expect(addresRepository.create).toHaveBeenCalledTimes(1);
      expect(addresRepository.save).toHaveBeenCalledTimes(1);
    });

    it('sould be return a bad request exception', async () => {
      // Arrange
      const body: CreateAddressDto = {
        road: 'teste1',
        district: 'testeA',
        houseNumber: 1,
        cep: '12345678',
        city: 'JavaScript',
        state: 'TS',
        complement: 'teste de um usuario',
      };
      jest
        .spyOn(addressService, 'validateUser')
        .mockRejectedValue(new BadRequestException('Invalid user ID'));

      // Assert
      expect(addressService.create(body, currentUser.id)).rejects.toThrow(
        new BadRequestException('Invalid user ID'),
      );
    });

    it('sould be return a conflict exception', async () => {
      // Arrange
      const body: CreateAddressDto = {
        road: 'teste1',
        district: 'testeA',
        houseNumber: 1,
        cep: '12345678',
        city: 'JavaScript',
        state: 'TS',
        complement: 'teste de um usuario',
      };
      jest
        .spyOn(addressService, 'validateUser')
        .mockRejectedValue(
          new ConflictException('This user already has an address registered'),
        );

      // Assert
      expect(addressService.create(body, currentUser.id)).rejects.toThrow(
        new BadRequestException('This user already has an address registered'),
      );
    });

    it('sould be return an exception', async () => {
      // Arrange
      const body: CreateAddressDto = {
        road: 'teste1',
        district: 'testeA',
        houseNumber: 1,
        cep: '12345678',
        city: 'JavaScript',
        state: 'TS',
        complement: 'teste de um usuario',
      };
      jest.spyOn(addresRepository, 'save').mockRejectedValue(new Error());

      // Assert
      expect(
        addressService.create(body, currentUser.id),
      ).rejects.toThrowError();
    });
  });

  describe('findAll', () => {
    it('should be able to list all addresses', async () => {
      // Act
      const result = await addressService.findAll();

      // Assert
      expect(result).toEqual([createdAddress]);
      expect(addresRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should be return an exception', async () => {
      // Arrange
      jest.spyOn(addresRepository, 'find').mockRejectedValue(new Error());

      // Assert
      expect(addressService.findAll()).rejects.toThrowError();
    });
  });

  describe('findOne', () => {
    it('should be able to find a unique address', async () => {
      // Act
      const result = await addressService.findOne(createdAddress.id);

      // Assert
      expect(result).toEqual([createdAddress]);
      expect(addresRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should be return a not found exception', async () => {
      // Arrange
      jest
        .spyOn(addresRepository, 'find')
        .mockRejectedValueOnce(new NotFoundException('Address not found'));

      // Assert
      expect(addressService.findOne(createdAddress.id)).rejects.toThrow(
        new NotFoundException('Address not found'),
      );
    });

    it('should be return a exception', async () => {
      // Arrange
      jest.spyOn(addresRepository, 'find').mockRejectedValueOnce(new Error());

      // Assert
      expect(addressService.findOne(createdAddress.id)).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should be able to update an address', async () => {
      // Arrange
      const body: UpdateAddressDto = {
        road: 'teste1_Updated',
        houseNumber: 2,
      };
      jest
        .spyOn(addresRepository, 'save')
        .mockResolvedValueOnce({ ...createdAddress, ...body });

      // Act
      const result = await addressService.update(createdAddress.id, body);

      // Assert
      expect(result).toEqual({ ...createdAddress, ...body });
      expect(addresRepository.merge).toHaveBeenCalledTimes(1);
      expect(addresRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should be return a not found exception', async () => {
      // Arrange
      const body: UpdateAddressDto = {
        road: 'teste1_Updated',
        houseNumber: 2,
      };
      jest
        .spyOn(addresRepository, 'findOneBy')
        .mockRejectedValueOnce(new NotFoundException('Address not found'));

      // Assert
      expect(addressService.update(createdAddress.id, body)).rejects.toThrow(
        new NotFoundException('Address not found'),
      );
    });

    it('should be return a exception', async () => {
      // Arrange
      const body: UpdateAddressDto = {
        road: 'teste1_Updated',
        houseNumber: 2,
      };
      jest.spyOn(addresRepository, 'save').mockRejectedValueOnce(new Error());

      // Assert
      expect(
        addressService.update(createdAddress.id, body),
      ).rejects.toThrowError();
    });
  });

  describe('remove', () => {
    it('should be able to remove a address', async () => {
      // Act
      const result = await addressService.remove(createdAddress.id);

      // Assert
      expect(result).toBeUndefined();
      expect(addresRepository.delete).toHaveBeenCalledTimes(1);
      expect(addresRepository.delete).toHaveBeenCalledWith({
        id: createdAddress.id,
      });
    });

    it('should be return a not found exception', async () => {
      // Arrange
      jest
        .spyOn(addresRepository, 'findOneBy')
        .mockRejectedValueOnce(new NotFoundException('Address not found'));

      // Assert
      expect(addressService.remove(createdAddress.id)).rejects.toThrow(
        new NotFoundException('Address not found'),
      );
    });

    it('should be return a exception', async () => {
      // Arrange
      jest.spyOn(addresRepository, 'delete').mockRejectedValueOnce(new Error());

      // Assert
      expect(addressService.remove(createdAddress.id)).rejects.toThrowError();
    });
  });
});
