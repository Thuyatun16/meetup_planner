import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MeetModule } from './meet/meet.module';
import { FriendModule } from './friend/friend.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';



@Module({
  imports: [
   
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),

      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    MeetModule,
    FriendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
