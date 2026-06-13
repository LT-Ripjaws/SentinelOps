import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './jwt-payload.interface';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { SkipCsrf } from './decorators/skip-csrf.decorator';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}


  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

    res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days 
  });

  
    res.cookie('csrfToken', randomBytes(32).toString('hex'), {
    httpOnly: false,                 // intentional: frontend JS must read this
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  
  }

  private clearAuthCookies(res: Response) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/auth',
    });

    res.clearCookie('csrfToken', { secure: isProduction, sameSite: 'lax', path: '/' });
  }

  @SkipCsrf()
  @Post('login')
  async login(@Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const {accessToken, refreshToken} = await this.authService.login(loginDto);

    this.setAuthCookies(res, accessToken, refreshToken);

    return { message: 'Login successful' };
  }
  
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request & { user: {sub: string; refreshToken: string}},
    @Res({passthrough: true}) res: Response)
    {
      const {accessToken, refreshToken} = await this.authService.refresh(req.user.sub, req.user.refreshToken)

      this.setAuthCookies(res, accessToken, refreshToken);

      return {message: 'Token Refreshed'}
    }

  @SkipCsrf()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.refreshToken);
    this.clearAuthCookies(res);
    return { message: 'Logged out' };
  }


  // made this test route to verify JWT authentication
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: JwtPayload }){
    return req.user;
  }

  // made this to verify role-based access control
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Manager)
  @Get('manager-check')
  managerRoute(){
    return { ok: true, message: 'Manager access granted' };
  }

}
