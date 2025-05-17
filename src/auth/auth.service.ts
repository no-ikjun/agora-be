import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(data: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.userService.findUserById(data.user_id);
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    const passwordMatches = await bcrypt.compare(
      data.user_password,
      user.user_password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const payload = {
      user_id: user.user_id,
      user_name: user.user_name,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      ),
    });

    return { access_token };
  }
}
