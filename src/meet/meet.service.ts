import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meet } from './meet-schema/meet.schema';
import { Model } from 'mongoose';

@Injectable()
export class MeetService {
    constructor(@InjectModel(Meet.name) private meetModel: Model<Meet>){}
    async createMeet(title: string, location: string, time: Date, participants: string[]){
        const newMeet = new this.meetModel({ title, location, time, participants });
        return await newMeet.save();
    }

    async findAll(userId: string){
        return this.meetModel.find({ $or: [{ creator: userId }, { participants: userId }] }).populate('participants creator').exec();
    }
}
