import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressEntity } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private addressRepository: Repository<AddressEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async validateUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { address: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid user ID');
    }

    if (user.address) {
      throw new ConflictException(
        'This user already has an address registered',
      );
    }

    return user;
  }

  async create(createAddressDto: CreateAddressDto, userId: string) {
    const user = await this.validateUser(userId);
    const createdAddress = this.addressRepository.create({
      ...createAddressDto,
      owner: user,
    });

    await this.addressRepository.save(createdAddress);

    return plainToInstance(AddressEntity, createdAddress);
  }

  async findAll() {
    const addressList = await this.addressRepository.find({
      relations: { owner: true },
    });

    return plainToInstance(AddressEntity, addressList);
  }

  async findOne(id: string) {
    const currentAddress = await this.addressRepository.find({
      where: {
        id,
      },
      relations: {
        owner: true,
      },
    });

    if (!currentAddress) {
      throw new NotFoundException('Address not found');
    }

    return plainToInstance(AddressEntity, currentAddress);
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    const currentAddress = await this.addressRepository.findOneBy({ id });

    if (!currentAddress) {
      throw new NotFoundException('Address not found');
    }

    const updatedAddress = this.addressRepository.merge(
      currentAddress,
      updateAddressDto,
    );

    await this.addressRepository.save(updatedAddress);

    return updatedAddress;
  }

  async remove(id: string) {
    const currentAddress = await this.addressRepository.findOneBy({ id });

    if (!currentAddress) {
      throw new NotFoundException('Address not found');
    }

    await this.addressRepository.delete({ id });
  }
}
