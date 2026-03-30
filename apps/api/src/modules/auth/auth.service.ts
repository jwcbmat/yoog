import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async seedAdmin() {
    const count = await this.userRepo.count();
    if (count === 0) {
      const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@yoog.com';
      const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'password123';

      const admin = this.userRepo.create({
        name: 'Administrador Clínico',
        email: adminEmail,
        password: adminPassword,
      });
      await this.userRepo.save(admin);
    }
  }
}
