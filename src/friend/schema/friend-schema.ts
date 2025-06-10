import { Schema } from "@nestjs/mongoose";
import { Prop } from "@nestjs/mongoose";
import { SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum FriendStatus{
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

@Schema({timestamps: true})
export class Friend extends Document{
    @Prop( {ref: 'User', require: true})
    user: string;
    @Prop({ ref: 'User', require: true})
    friend: string;
    @Prop({enum: FriendStatus, default: FriendStatus.PENDING})
    status: FriendStatus;
}
export const FriendSchema = SchemaFactory.createForClass(Friend);