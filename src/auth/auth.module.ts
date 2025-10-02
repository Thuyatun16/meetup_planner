import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.auth.guard';
import { RolesGuard } from './guards/role.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, PassportModule, JwtModule,ConfigModule],
  controllers: [AuthController],
  providers: [AuthService,LocalAuthGuard,LocalStrategy,JwtStrategy,JwtRefreshStrategy,JwtRefreshAuthGuard,RolesGuard]
})
export class AuthModule {}
