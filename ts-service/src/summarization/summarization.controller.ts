import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SummarizationService } from './summarization.service';
import { CreateSummarizationDto } from './dto/create-summarization.dto';
import { UpdateSummarizationDto } from './dto/update-summarization.dto';

@Controller('summarization')
export class SummarizationController {
  constructor(private readonly summarizationService: SummarizationService) {}

  @Post()
  create(@Body() createSummarizationDto: CreateSummarizationDto) {
    return this.summarizationService.create(createSummarizationDto);
  }

  @Get()
  findAll() {
    return this.summarizationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.summarizationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSummarizationDto: UpdateSummarizationDto) {
    return this.summarizationService.update(+id, updateSummarizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.summarizationService.remove(+id);
  }
}
