import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meet } from './meet-schema/meet.schema';
import { Model, Types } from 'mongoose';
import { UpdateMeetDto } from './dto/meet-create.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class MeetService {
    constructor(@InjectModel(Meet.name) private meetModel: Model<Meet>){}
    async createMeet(title: string, location: string, time: Date, participants: string[], creator: string) {
        const participantId = participants.map((participant) => {
          if (!Types.ObjectId.isValid(participant)) {
            throw new BadRequestException(`Invalid participant ID: ${participant}`);
          }
          return new Types.ObjectId(participant);
        });
        if (!Types.ObjectId.isValid(creator)) {
          throw new BadRequestException(`Invalid creator ID: ${creator}`);
        }
        const creatorId = new Types.ObjectId(creator);
        const newMeet = new this.meetModel({ title, location, time, participants: participantId, creator: creatorId });
        return await newMeet.save();
      }
    async findOne(id: string){
        return this.meetModel.findById(id)
        .populate({
            path: 'participants',
            select: '-password -refreshToken -__v -friends' ,

        }).populate({
            path: 'creator',
            select: '-password -refreshToken -__v -friends',
        })                            
        .exec();
    }
    async update(id: string, meet: UpdateMeetDto) {
        const updateData = { ...meet };
        const dbUpdateData = {
          ...updateData,
          ...(meet.participants && {
            participants: meet.participants.map((participant) => {
              if (!Types.ObjectId.isValid(participant)) {
                throw new BadRequestException(`Invalid participant ID: ${participant}`);
              }
              return new Types.ObjectId(participant);
            }),
          }),
        };
        return this.meetModel.findByIdAndUpdate(id, dbUpdateData, { new: true }).exec();
      }
    
    async delete(id: string){
        return this.meetModel.findByIdAndDelete(id).exec();
    }
    async findAll(userId: string) {
        const meetups = await this.meetModel.find({ 
            $or: [{ creator: userId }, { participants: userId }] 
        })
        .populate({
            path: 'participants',
            select: '-password -refreshToken -__v -friends' // Exclude more fields if needed
        })
        .populate({
            path: 'creator',
            select: '-password -refreshToken -__v -friends'
        })
        .lean()
        .exec();
        console.log(meetups,'This is meetups data');
    
        return meetups.map(meet => ({
            ...meet,
            participants: Array.isArray(meet.participants) 
                ? meet.participants 
                : meet.participants ? [meet.participants] : []
        }));
    }
}
