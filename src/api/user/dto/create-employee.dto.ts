import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class CreateEmployeeDto extends OmitType(CreateUserDto, [
  'shopsMeta',
  'password',
]) {}
