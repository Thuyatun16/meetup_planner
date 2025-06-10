import { Prop, Schema } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { SchemaFactory } from "@nestjs/mongoose";
@Schema()
export class Meet{
    @Prop({required: true})
    title: string;
    @Prop({required: true})
    location: string;
    @Prop({required: true})
    time: Date;
    @Prop({type: [Types.ObjectId], ref: 'User'})
    participants: Types.ObjectId[];
    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    creator: Types.ObjectId;
}
export const MeetSchema = SchemaFactory.createForClass(Meet);