import { Schema } from "@nestjs/mongoose";
import { Prop } from "@nestjs/mongoose";
import { SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema()
export class Friend{
    @Prop({type: Types.ObjectId, ref: 'User', require: true})
    user: Types.ObjectId;
    @Prop({type: Types.ObjectId, ref: 'User', require: true})
    friend: Types.ObjectId;
}
export const FriendSchema = SchemaFactory.createForClass(Friend);