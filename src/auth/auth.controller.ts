import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(data: LoginUserDto): Promise<{ access_token: string }> {
    return await this.authService.login(data);
  }
}
