import { ApiProperty } from '@nestjs/swagger';

export class CreateFriendDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the friend',
  })
  name: string;

  @ApiProperty({
    example: 25,
    description: 'The age of the friend',
  })
  age: number;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the friend',
  })
  email: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'The address of the friend',
    required: false,
  })
  address?: string;
}
