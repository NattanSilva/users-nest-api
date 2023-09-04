import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create-address.dto';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {
  road?: string;
  district?: string;
  houseNumber?: number;
  cep?: string;
  city?: string;
  state?: string;
  complement?: string;
}
