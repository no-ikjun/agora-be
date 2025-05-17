import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  user_id: string;

  @IsString()
  user_password: string;

  @IsString()
  user_name: string;
}
