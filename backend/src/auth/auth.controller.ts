import { Controller, Post, Put, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  VerifyCodeDto,
  ResetPasswordDto,
  FirstAccessDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login com CPF e senha' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'CPF ou senha inválidos' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens' })
  @ApiResponse({ status: 200, description: 'Tokens renovados' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidar sessão' })
  @ApiResponse({ status: 200, description: 'Logout realizado' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário logado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  async me(@Request() req) {
    return this.authService.me(req.user.id);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar código de recuperação via SMS/WhatsApp' })
  @ApiResponse({ status: 200, description: 'Código enviado' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código de recuperação' })
  @ApiResponse({ status: 200, description: 'Código válido' })
  @ApiResponse({ status: 400, description: 'Código inválido ou expirado' })
  async verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyCode(dto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir senha com código' })
  @ApiResponse({ status: 200, description: 'Senha redefinida' })
  @ApiResponse({ status: 400, description: 'Código inválido' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('first-access')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Primeiro acesso (CPF → código → nova senha)' })
  @ApiResponse({ status: 200, description: 'Primeiro acesso realizado' })
  @ApiResponse({ status: 400, description: 'Código inválido' })
  async firstAccess(@Body() dto: FirstAccessDto) {
    return this.authService.firstAccess(dto);
  }

  @Post('first-access-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar código de primeiro acesso' })
  @ApiResponse({ status: 200, description: 'Código enviado' })
  async sendFirstAccessCode(@Body('cpf') cpf: string) {
    return this.authService.sendFirstAccessCode(cpf);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alterar senha (com senha atual)' })
  @ApiResponse({ status: 200, description: 'Senha alterada' })
  @ApiResponse({ status: 401, description: 'Senha atual inválida' })
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto);
  }
}
