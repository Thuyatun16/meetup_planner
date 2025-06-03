export class CreateMeetDto {
  title: string;
  location: string;
  time: Date;
  participants: string[];
}
export class UpdateMeetDto{
  title?: string;
  location?: string;
  time?: Date;
  participants?: string[];
}