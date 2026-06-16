import { Injectable, UnauthorizedException} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual, randomUUID} from 'crypto';
import { JwtPayload } from './jwt-payload.interface';
import type { StringValue } from 'ms';
import { createSignedCsrfToken } from './csrf-token';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

 

  private hashToken(token: string): string {
    const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    return createHmac('sha256', secret).update(token).digest('hex');
  }

  private safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }

  private buildPayload(user: UserDocument, sid: string = randomUUID()): JwtPayload {
    return { sub: user._id.toString(), email: user.email, role: user.role, sid};
  }

  private createCsrfToken(sid: string): string {
    return createSignedCsrfToken(
      this.configService.getOrThrow<string>('CSRF_SECRET'), sid
    )
  }

  private async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { sub: payload.sub, sid: payload.sid, jti: randomUUID() },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_EXPIRES_IN',
            '7d',
          ) as StringValue,
        },
      ),
    ]);

    return { accessToken, refreshToken, csrfToken: this.createCsrfToken(payload.sid) };
  }


  async refresh(userId: string, presentedToken: string, sid: string): Promise<{ accessToken: string; refreshToken: string; csrfToken: string }> {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshTokenHash = this.hashToken(presentedToken);

    if(!this.safeCompare(refreshTokenHash, user.refreshTokenHash)) {
      await this.usersService.setRefreshTokenHash(userId, null);
      throw new UnauthorizedException('Refresh Token no longer valid');
    }

    const { accessToken, refreshToken, csrfToken } = await this.generateTokens(this.buildPayload(user, sid));

    await this.usersService.setRefreshTokenHash(
      userId,
      this.hashToken(refreshToken)
    );

    return { accessToken, refreshToken, csrfToken };
  }

  async login(loginDto : LoginDto): Promise<{ accessToken: string; refreshToken: string; csrfToken: string}> {

    const user = await this.validateUser(loginDto);

    const { accessToken, refreshToken, csrfToken} = await this.generateTokens(this.buildPayload(user));

    await this.usersService.setRefreshTokenHash(
    user._id.toString(),
    this.hashToken(refreshToken));

    return { accessToken, refreshToken, csrfToken };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;

    try {
      const { sub } = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        ignoreExpiration: true,
      });
      await this.usersService.setRefreshTokenHash(sub, null);
    } catch {
      // missing / forged / malformed -> nothing to revoke; logout still succeeds
    }
  }

  async validateUser(loginDto: LoginDto): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
    }

}
