import { Module } from '@nestjs/common';
import { MeetController } from './meet.controller';
import { MeetService } from './meet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetSchema,Meet } from './meet-schema/meet.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from 'src/auth/guards/jwt-refresh.auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Meet.name, schema: MeetSchema}])
  ],
  controllers: [MeetController],
  providers: [MeetService,JwtAuthGuard,JwtRefreshAuthGuard]
})
export class MeetModule {}
