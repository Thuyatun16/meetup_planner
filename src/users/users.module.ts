import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

@Module({
  imports: [MongooseModule.forFeature([
    {
      name: User.name,
      schema: UserSchema,
    }
  ])],
  controllers: [UsersController],
  providers: [UsersService, RealtimeGateway],
  exports: [UsersService]
})
export class UsersModule {}
