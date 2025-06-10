import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendSchema } from './schema/friend-schema';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friend.name, schema: FriendSchema },
      {name: User.name, schema: UserSchema}
    ]),
    UsersModule
  ],
  providers: [FriendService],
  controllers: [FriendController]
})
export class FriendModule {}
