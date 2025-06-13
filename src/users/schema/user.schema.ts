import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {  SchemaTypes, Types } from "mongoose";

@Schema()
export class User {
    @Prop({type: SchemaTypes.ObjectId , auto: true})
    _id: Types.ObjectId;
    @Prop()
    refreshToken?: string;
    @Prop({unique: true, required: true})
    email: string;
    @Prop({required: true})
    password: string;
    @Prop({ default: 'user'})
    role: string;
    @Prop()
    name?: string;
    @Prop({type: [{type: Types.ObjectId, ref: 'User'}]})
    friends?: Types.ObjectId[];
    @Prop({ type: { type: String, default: 'Point' }, coordinates: [Number] })
    location?: { type: string; coordinates: number[] };
}
export const UserSchema = SchemaFactory.createForClass(User);