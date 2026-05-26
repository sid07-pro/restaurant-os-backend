import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../auth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.authRepository.findById(payload.sub);
    
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is inactive or not found.');
    }

    // Passwords should not be returned, repository should already omit it or we can delete it here
    const { passwordHash, ...result } = user;
    return result;
  }
}
