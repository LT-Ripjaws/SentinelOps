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
import { SkipCsrf } from './decorators/skip-csrf.decorator';
import { CsrfGuard } from './guards/csrf.guard';
import { Throttle } from '@nestjs/throttler';
import { ApiSecurity, ApiTags, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}


  private setAuthCookies(res: Response, accessToken: string, refreshToken: string, csrfToken: string) {
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

  
    res.cookie('csrfToken', csrfToken, {
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

  @ApiOperation({ summary: 'Log in and set auth cookies' })
  @ApiOkResponse({ 
    description: 'Login Successful. Sets accessToken, refreshToken and csrfToken cookies'
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Email or Password'
  })
  @SkipCsrf()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const {accessToken, refreshToken, csrfToken} = await this.authService.login(loginDto);

    this.setAuthCookies(res, accessToken, refreshToken, csrfToken);

    return { message: 'Login successful' };
  }
  



  @UseGuards(JwtRefreshGuard, CsrfGuard)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @ApiOperation({ summary: 'Refresh auth cookies'})
  @ApiOkResponse({
    description: 'Token refreshed. Sets new accessToken, refreshToken and csrfToken cookies'
  })
  @ApiUnauthorizedResponse({
  description: 'Missing or invalid refresh token'
  })
  @ApiForbiddenResponse({
    description: 'Missing, mismatched, or invalid CSRF token'
  })
  @ApiSecurity('refreshToken')
  @ApiSecurity('csrfToken')
  @Post('refresh')
  async refresh(@Req() req: Request & { user: {sub: string; sid: string; refreshToken: string}},
    @Res({passthrough: true}) res: Response)
    {
      const {accessToken, refreshToken, csrfToken} = await this.authService.refresh(req.user.sub, req.user.refreshToken, req.user.sid)

      this.setAuthCookies(res, accessToken, refreshToken, csrfToken);

      return {message: 'Token Refreshed'}
    }



  @ApiOperation({ summary: 'Log out and clear auth cookies' })
  @ApiOkResponse({
    description: 'Auth cookies cleared'
  })
  @SkipCsrf()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.refreshToken);
    this.clearAuthCookies(res);
    return { message: 'Logged out' };
  }


  // made this test route to verify JWT authentication
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current authenticated user payload' })
  @ApiSecurity('accessToken')
  @ApiOkResponse({
    description: 'Returns the JWT payload for the current user'
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token'
  })
  @Get('me')
  me(@Req() req: Request & { user: JwtPayload }){
    return req.user;
  }

  // made this to verify role-based access control
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Manager)
  @ApiOperation({ summary: 'Verify manager-only access' })
  @ApiSecurity('accessToken')
  @ApiOkResponse({
    description: 'Manager access granted',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user is not a manager',
  })
  @Get('manager-check')
  managerRoute(){
    return { ok: true, message: 'Manager access granted' };
  }

}
