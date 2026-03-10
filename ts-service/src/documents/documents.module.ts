import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentsRepository } from './documents.repository';
import { CandidateDocument } from './entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateDocument])],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsRepository],
  exports: [DocumentsRepository],
})
export class DocumentsModule {}
