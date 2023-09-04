import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async create(createUserDto: CreateUserDto) {
    if (await this.findByEmail(createUserDto.email)) {
      throw new ConflictException('User already exists');
    }

    const createdUser = this.usersRepository.create({
      ...createUserDto,
      password: await hash(createUserDto.password, 10),
    });

    await this.usersRepository.save(createdUser);

    return plainToInstance(UserEntity, createdUser);
  }

  async findAll() {
    return plainToInstance(
      UserEntity,
      await this.usersRepository.find({ relations: { address: true } }),
    );
  }

  async findOne(id: string) {
    const currentUser = await this.usersRepository.findOne({
      where: { id },
      relations: {
        address: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(UserEntity, currentUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const currentUser = await this.usersRepository.findOneBy({ id });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    this.usersRepository.merge(currentUser, updateUserDto);

    return plainToInstance(
      UserEntity,
      await this.usersRepository.save(currentUser),
    );
  }

  async remove(id: string) {
    const currentUser = await this.usersRepository.findOneBy({ id });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.delete({ id });
  }
}
