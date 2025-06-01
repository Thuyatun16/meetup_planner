import { IsString, IsNotEmpty, IsDateString, IsArray, IsMongoId } from 'class-validator';

export class CreateMeetDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // Using string because @IsDateString expects ISO string

  @IsArray()
  @IsMongoId({ each: true })
  participants: string[];
}
