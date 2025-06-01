import { Prop, Schema } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { SchemaFactory } from "@nestjs/mongoose";
@Schema()
export class Meet{
    @Prop({type: Types.ObjectId, auto: true})
    _id: Types.ObjectId;
    @Prop({required: true})
    title: string;
    @Prop({required: true})
    location: string;
    @Prop({required: true})
    date: Date;
    @Prop({type: Types.ObjectId, ref: 'User'})
    participants: Types.ObjectId[];
    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    creator: Types.ObjectId;
}
export const MeetSchema = SchemaFactory.createForClass(Meet);