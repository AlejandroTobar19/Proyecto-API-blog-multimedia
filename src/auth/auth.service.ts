import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    console.log('[DEBUG] Usuario no encontrado o contraseña inválida:', email);
    return null;
  }

  async login(user: any) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role, // ✅ necesario para RolesGuard
  };

  console.log('[AuthService] Payload generado:', payload);

  return {
    access_token: this.jwtService.sign(payload),
  };
}

}
