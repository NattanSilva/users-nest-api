import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @MaxLength(150)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;

  @MaxLength(150)
  @IsString()
  @IsOptional()
  profession?: string;
}
