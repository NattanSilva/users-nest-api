import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as httpMocks from 'node-mocks-http';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

const createdAddress = {
  id: randomUUID(),
  road: 'teste1',
  district: 'testeA',
  houseNumber: 1,
  cep: '12345678',
  city: 'JavaScript',
  state: 'TS',
  complement: 'teste de um usuário',
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: {
    id: 'e74bae33-652c-4e62-a6ce-3e76660a35f0',
    name: 'teste',
    email: 'teste@mail.com',
    profession: 'tester',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe('AddressController', () => {
  let addressController: AddressController;
  let addressService: AddressService;

  const mockRequest = httpMocks.createRequest();
  mockRequest.user = {
    id: createdAddress.owner.id,
    email: createdAddress.owner.email,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        AddressService,
        {
          provide: AddressService,
          useValue: {
            create: jest.fn().mockResolvedValue(createdAddress),
            findAll: jest.fn().mockResolvedValue([createdAddress]),
            findOne: jest.fn().mockResolvedValue(createdAddress),
            update: jest.fn().mockResolvedValue({
              ...createdAddress,
              road: 'teste1_Updated',
              houseNumber: 2,
            }),
            remove: jest.fn().mockResolvedValue(undefined),
            validateUser: jest.fn().mockReturnValue(createdAddress.owner),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    addressController = module.get<AddressController>(AddressController);
    addressService = module.get<AddressService>(AddressService);
  });

  it('should be defined', () => {
    expect(addressController).toBeDefined();
    expect(addressService).toBeDefined();
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
        complement: 'teste de um usuário',
      };

      // Act
      const result = await addressController.create(body, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(createdAddress);
      expect(result.owner.email).toBe(createdAddress.owner.email);
      expect(result.owner.id).toBe(createdAddress.owner.id);
      expect(result.owner).not.toHaveProperty('password');
      expect(addressService.create).toHaveBeenCalledTimes(1);
      expect(addressService.create).toHaveBeenCalledWith(
        body,
        'e74bae33-652c-4e62-a6ce-3e76660a35f0',
      );
    });

    it('should be return a not found user exception', () => {
      // Arrange
      const body: CreateAddressDto = {
        road: 'teste1',
        district: 'testeA',
        houseNumber: 1,
        cep: '12345678',
        city: 'JavaScript',
        state: 'TS',
        complement: 'teste de um usuário',
      };
      jest
        .spyOn(addressService, 'create')
        .mockRejectedValueOnce(new BadRequestException('Invalid user ID'));

      // Assert
      expect(addressController.create(body, mockRequest)).rejects.toThrow(
        new BadRequestException('Invalid user ID'),
      );
    });

    it('should be return a conflict exception', () => {
      // Arrange
      const body: CreateAddressDto = {
        road: 'teste1',
        district: 'testeA',
        houseNumber: 1,
        cep: '12345678',
        city: 'JavaScript',
        state: 'TS',
        complement: 'teste de um usuário',
      };
      jest
        .spyOn(addressService, 'create')
        .mockRejectedValueOnce(
          new ConflictException('This user already has an address registered'),
        );

      // Assert
      expect(addressController.create(body, mockRequest)).rejects.toThrow(
        new ConflictException('This user already has an address registered'),
      );
    });
  });

  describe('findAll', () => {
    it('should be able to list all addresses', async () => {
      // Act
      const reult = await addressController.findAll();

      // Assert
      expect(reult).toEqual([createdAddress]);
      expect(addressService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should be return an exception', () => {
      // Arrange
      jest.spyOn(addressService, 'findAll').mockRejectedValueOnce(new Error());

      // Assert
      expect(addressController.findAll()).rejects.toThrow(new Error());
    });
  });

  describe('findOne', () => {
    it('should be able to find a unique address', async () => {
      // Act
      const result = await addressController.findOne(createdAddress.id);

      // Assert
      expect(result).toEqual(createdAddress);
      expect(addressService.findOne).toHaveBeenCalledTimes(1);
      expect(addressService.findOne).toHaveBeenCalledWith(createdAddress.id);
    });

    it('should be return a not found exception', () => {
      // Arrange
      jest
        .spyOn(addressService, 'findOne')
        .mockRejectedValueOnce(new NotFoundException());

      // Assert
      expect(addressController.findOne(randomUUID())).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should be return a exception', () => {
      // Arrange
      jest.spyOn(addressService, 'findOne').mockRejectedValueOnce(new Error());

      // Assert
      expect(addressController.findOne(randomUUID())).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should be update a address successfully', async () => {
      // Arrange
      const body: UpdateAddressDto = {
        road: 'teste1_Updated',
        houseNumber: 2,
      };

      // Act
      const result = await addressController.update(createdAddress.id, body);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual({ ...createdAddress, ...body });
      expect(addressService.update).toHaveBeenCalledTimes(1);
      expect(addressService.update).toHaveBeenCalledWith(
        createdAddress.id,
        body,
      );
    });

    it('should be return a not found exception', () => {
      // Arrange
      const body: UpdateAddressDto = {
        road: 'teste1_Updated',
        houseNumber: 2,
      };
      jest
        .spyOn(addressService, 'update')
        .mockRejectedValueOnce(new NotFoundException());

      // Assert
      expect(addressController.update(randomUUID(), body)).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should be return a exception', () => {
      // Arrange
      const body: UpdateAddressDto = {
        road: 'teste1_Updated',
        houseNumber: 2,
      };
      jest.spyOn(addressService, 'update').mockRejectedValueOnce(new Error());

      // Assert
      expect(
        addressController.update(createdAddress.id, body),
      ).rejects.toThrowError();
    });
  });

  describe('remove', () => {
    it('should be able to remove a address', async () => {
      // Act
      const result = await addressController.remove(createdAddress.id);

      // Assert
      expect(result).toEqual(undefined);
      expect(addressService.remove).toHaveBeenCalledTimes(1);
      expect(addressService.remove).toHaveBeenCalledWith(createdAddress.id);
    });

    it('should be return a not found exception', () => {
      // Arrange
      jest
        .spyOn(addressService, 'remove')
        .mockRejectedValueOnce(new NotFoundException('Address not found'));

      // Assert
      expect(addressController.remove(randomUUID())).rejects.toThrow(
        new NotFoundException('Address not found'),
      );
    });

    it('should be return an exception', () => {
      // Arrange
      jest.spyOn(addressService, 'remove').mockRejectedValueOnce(new Error());

      // Assert
      expect(
        addressController.remove(createdAddress.id),
      ).rejects.toThrowError();
    });
  });
});
