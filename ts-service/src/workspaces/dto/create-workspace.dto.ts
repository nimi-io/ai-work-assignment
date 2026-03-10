import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Workspace display name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
