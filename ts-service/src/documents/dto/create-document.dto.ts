import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from 'src/shared/interface/index.interface';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.RESUME, description: 'Type of document being uploaded' })
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @ApiProperty({ example: 'jane_resume.pdf', description: 'Original file name' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ example: 'uploads/jane_resume.pdf', description: 'Storage key / path where the file is stored' })
  @IsString()
  @IsNotEmpty()
  storageKey!: string;

  @ApiProperty({ example: 'Jane has 5 years of experience in…', description: 'Extracted raw text content of the document' })
  @IsString()
  @IsNotEmpty()
  rawText!: string;
}
