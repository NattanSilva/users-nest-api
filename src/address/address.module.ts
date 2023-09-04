import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AddressEntity } from './entities/address.entity';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
  imports: [
    TypeOrmModule.forFeature([AddressEntity]),
    TypeOrmModule.forFeature([UserEntity]),
  ],
})
export class AddressModule {}
