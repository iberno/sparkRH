import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  LoginDto,
  ForgotPasswordDto,
  VerifyCodeDto,
  ResetPasswordDto,
  FirstAccessDto,
  ChangePasswordDto,
} from './dto/auth.dto';

interface JwtPayload {
  sub: string;
  cpf: string;
  role: string;
}

@Injectable()
export class AuthService {
  // Rate limiting: CPF -> { attempts, blockedUntil }
  private loginAttempts = new Map<string, { attempts: number; blockedUntil?: Date }>();
  private codeAttempts = new Map<string, { attempts: number; lastSent?: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const cpf = dto.cpf.replace(/\D/g, '');

    // Check rate limiting
    const attempts = this.loginAttempts.get(cpf);
    if (attempts?.blockedUntil && attempts.blockedUntil > new Date()) {
      throw new UnauthorizedException('Conta bloqueada. Tente novamente em 30 minutos.');
    }

    const user = await this.prisma.users.findUnique({
      where: { cpf },
      include: { employee: true },
    });

    if (!user) {
      this.incrementLoginAttempts(cpf);
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Conta desativada');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);

    if (!isPasswordValid) {
      this.incrementLoginAttempts(cpf);
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    // Reset attempts on successful login
    this.loginAttempts.delete(cpf);

    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      const user = await this.prisma.users.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(userId: string) {
    // In a real app, you'd invalidate the token in Redis/blocklist
    // For now, we just return success
    return { message: 'Logout realizado com sucesso' };
  }

  async me(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        employee: {
          select: {
            id: true,
            full_name: true,
            social_name: true,
            registration_number: true,
            phone: true,
            email: true,
            photo_url: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      cpf: user.cpf,
      email: user.email,
      role: user.role,
      is_first_access: user.is_first_access,
      last_login: user.last_login,
      employee: user.employee,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const cpf = dto.cpf.replace(/\D/g, '');

    // Check rate limiting for code sending
    const codeAttempts = this.codeAttempts.get(cpf);
    if (codeAttempts?.lastSent) {
      const timeDiff = Date.now() - codeAttempts.lastSent.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 1 && codeAttempts.attempts >= 3) {
        throw new BadRequestException('Máximo de 3 códigos por hora. Aguarde.');
      }
    }

    const user = await this.prisma.users.findUnique({
      where: { cpf },
      include: {
        employee: {
          select: { phone: true, full_name: true },
        },
      },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'Se o CPF estiver cadastrado, você receberá um código.' };
    }

    if (!user.employee?.phone && !dto.phone) {
      throw new BadRequestException('Telefone não cadastrado. Informe um número.');
    }

    const phone = dto.phone || user.employee?.phone;
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    // Delete old codes for this CPF
    await this.prisma.verification_codes.deleteMany({
      where: { cpf, type: 'PASSWORD_RESET' },
    });

    // Create new code
    await this.prisma.verification_codes.create({
      data: {
        user_id: user.id,
        cpf,
        code_hash: codeHash,
        type: 'PASSWORD_RESET',
        channel: 'SMS',
        phone: phone!,
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Update rate limiting
    this.updateCodeAttempts(cpf);

    // TODO: Send SMS/WhatsApp with code
    console.log(`[DEV] Código de recuperação para ${cpf}: ${code}`);

    return { message: 'Se o CPF estiver cadastrado, você receberá um código.' };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const cpf = dto.cpf.replace(/\D/g, '');

    const verificationCode = await this.prisma.verification_codes.findFirst({
      where: {
        cpf,
        type: 'PASSWORD_RESET',
        used: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!verificationCode) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    if (verificationCode.attempts >= verificationCode.max_attempts) {
      throw new BadRequestException('Número máximo de tentativas excedido');
    }

    const isValid = await bcrypt.compare(dto.code, verificationCode.code_hash);

    if (!isValid) {
      await this.prisma.verification_codes.update({
        where: { id: verificationCode.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Código inválido');
    }

    return { message: 'Código válido', valid: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const cpf = dto.cpf.replace(/\D/g, '');

    const verificationCode = await this.prisma.verification_codes.findFirst({
      where: {
        cpf,
        type: 'PASSWORD_RESET',
        used: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!verificationCode) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    const isValid = await bcrypt.compare(dto.code, verificationCode.code_hash);

    if (!isValid) {
      throw new BadRequestException('Código inválido');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.users.update({
      where: { cpf },
      data: { password_hash: passwordHash },
    });

    await this.prisma.verification_codes.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  async firstAccess(dto: FirstAccessDto) {
    const cpf = dto.cpf.replace(/\D/g, '');

    const user = await this.prisma.users.findUnique({
      where: { cpf },
    });

    if (!user) {
      throw new UnauthorizedException('CPF não encontrado');
    }

    if (!user.is_first_access) {
      throw new BadRequestException('Primeiro acesso já foi realizado');
    }

    // Check if there's a valid code
    const verificationCode = await this.prisma.verification_codes.findFirst({
      where: {
        cpf,
        type: 'FIRST_ACCESS',
        used: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!verificationCode) {
      throw new BadRequestException('Código inválido ou expirado. Solicite um novo código.');
    }

    const isValid = await bcrypt.compare(dto.code, verificationCode.code_hash);

    if (!isValid) {
      throw new BadRequestException('Código inválido');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: passwordHash,
        is_first_access: false,
      },
    });

    await this.prisma.verification_codes.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Generate tokens for automatic login
    const updatedUser = await this.prisma.users.findUnique({
      where: { id: user.id },
      include: { employee: true },
    });

    return this.generateTokens(updatedUser!);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual inválida');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.users.update({
      where: { id: userId },
      data: { password_hash: passwordHash },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  async sendFirstAccessCode(cpf: string) {
    const cleanCpf = cpf.replace(/\D/g, '');

    const user = await this.prisma.users.findUnique({
      where: { cpf: cleanCpf },
      include: {
        employee: {
          select: { phone: true, full_name: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('CPF não encontrado');
    }

    if (!user.is_first_access) {
      throw new BadRequestException('Primeiro acesso já foi realizado');
    }

    if (!user.employee?.phone) {
      throw new BadRequestException('Telefone não cadastrado. Contate o DP/RH.');
    }

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.verification_codes.create({
      data: {
        user_id: user.id,
        cpf: cleanCpf,
        code_hash: codeHash,
        type: 'FIRST_ACCESS',
        channel: 'SMS',
        phone: user.employee.phone,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // TODO: Send SMS/WhatsApp with code
    console.log(`[DEV] Código de primeiro acesso para ${cleanCpf}: ${code}`);

    return { message: 'Código enviado para o telefone cadastrado' };
  }

  private generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      cpf: user.cpf,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        cpf: user.cpf,
        role: user.role,
        name: user.employee?.full_name,
      },
    };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private incrementLoginAttempts(cpf: string) {
    const attempts = this.loginAttempts.get(cpf) || { attempts: 0 };
    attempts.attempts++;

    if (attempts.attempts >= 5) {
      attempts.blockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }

    this.loginAttempts.set(cpf, attempts);
  }

  private updateCodeAttempts(cpf: string) {
    const attempts = this.codeAttempts.get(cpf) || { attempts: 0, lastSent: undefined };

    const timeDiff = attempts.lastSent ? Date.now() - attempts.lastSent.getTime() : Infinity;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff >= 1) {
      attempts.attempts = 1;
    } else {
      attempts.attempts++;
    }

    attempts.lastSent = new Date();
    this.codeAttempts.set(cpf, attempts);
  }
}
