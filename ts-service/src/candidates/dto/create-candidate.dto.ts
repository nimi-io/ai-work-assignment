import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ example: 'b1e7c2d0-…', description: 'ID of the workspace this candidate belongs to' })
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({ example: 'Jane', description: "Candidate's first name" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: "Candidate's last name" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'jane.doe@example.com', description: "Candidate's email address" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
