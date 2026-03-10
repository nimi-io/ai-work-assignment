import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';

@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Post()
  create(@Body() createSummaryDto: CreateSummaryDto) {
    return this.summariesService.create(createSummaryDto);
  }

  @Get()
  findAll() {
    return this.summariesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.summariesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSummaryDto: UpdateSummaryDto) {
    return this.summariesService.update(+id, updateSummaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.summariesService.remove(+id);
  }
}
