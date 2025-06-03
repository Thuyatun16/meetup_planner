import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meet } from './meet-schema/meet.schema';
import { Model, Types } from 'mongoose';
import { UpdateMeetDto } from './dto/meet-create.dto';

@Injectable()
export class MeetService {
    constructor(@InjectModel(Meet.name) private meetModel: Model<Meet>){}
    async createMeet(title: string, location: string, time: Date, participants: string[],creator:string){
        const participantId = participants.map((participant) => new Types.ObjectId(participant));
        const creatorId = new Types.ObjectId(creator);
        const newMeet = new this.meetModel({ title, location, time, participants: participantId,creator:  creatorId});
        console.log({ title, location, time, participants,creator },
            "this is the meet object"
        );
        return await newMeet.save();
    }
    async findOne(id: string){
        return this.meetModel.findById(id).exec();
    }
    async update(id: string, meet: UpdateMeetDto){
        const updateData = {...meet};
        const dbUpdateData = {
            ...updateData,
            ...(meet.participants && { participants: meet.participants.map((participant) => new Types.ObjectId(participant)) }),
          };
        return this.meetModel.findByIdAndUpdate(id, dbUpdateData, { new: true }).exec();
    }
    async delete(id: string){
        return this.meetModel.findByIdAndDelete(id).exec();
    }
    async findAll(userId: string){
        const meetup = await this.meetModel.find({ $or: [{ creator: userId }, { participants: userId }] })
                                            .populate('participants creator')
                                            .exec();
        return meetup.map((meet)=>({...meet.toObject(),participants: Array.isArray(meet.participants?meet.participants:[])}));
    }
}
