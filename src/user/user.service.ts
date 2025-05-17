import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/global/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signUp(data: CreateUserDto): Promise<{ access_token: string }> {
    const user = await this.findUserById(data.user_id);
    if (user) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(data.user_password, 10);
    data.user_password = hashedPassword;
    const newUser = this.userRepository.create(data);
    await this.userRepository.save(newUser);

    const payload = { user_id: newUser.user_id, user_name: newUser.user_name };
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      ),
    });
    return { access_token };
  }

  async findUserById(userId: string): Promise<User> {
    return await this.userRepository.findOne({ where: { user_id: userId } });
  }

  async findUserByUserUuid(userUuid: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { user_uuid: userUuid },
    });
  }
}
