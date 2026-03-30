import { Controller, Post, Body, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'The password must be at least 6 characters long'),
});

@Controller('auth')
export class AuthController implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    await this.authService.seedAdmin();
  }

  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) body: any) {
    return this.authService.login(body.email, body.password);
  }
}
