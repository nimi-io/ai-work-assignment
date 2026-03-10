import { Injectable } from '@nestjs/common';
import { CreateSummarizationDto } from './dto/create-summarization.dto';
import { UpdateSummarizationDto } from './dto/update-summarization.dto';

@Injectable()
export class SummarizationService {
  create(createSummarizationDto: CreateSummarizationDto) {
    return 'This action adds a new summarization';
  }

  findAll() {
    return `This action returns all summarization`;
  }

  findOne(id: number) {
    return `This action returns a #${id} summarization`;
  }

  update(id: number, updateSummarizationDto: UpdateSummarizationDto) {
    return `This action updates a #${id} summarization`;
  }

  remove(id: number) {
    return `This action removes a #${id} summarization`;
  }
}
