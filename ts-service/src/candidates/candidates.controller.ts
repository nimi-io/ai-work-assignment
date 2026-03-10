import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CurrentUser } from '../auth/auth-user.decorator';
import { AuthUser } from '../auth/auth.types';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiCreatedResponse({ description: 'Candidate created successfully' })
  create(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(dto);
  }

  @Get(':candidateId')
  @ApiOperation({ summary: 'Get a candidate by ID' })
  @ApiParam({ name: 'candidateId', description: 'UUID of the candidate' })
  @ApiOkResponse({ description: 'Candidate found' })
  @ApiNotFoundResponse({ description: 'Candidate not found' })
  @ApiForbiddenResponse({ description: 'Candidate does not belong to this workspace' })
  findOne(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.candidatesService.findOne(candidateId, user.workspaceId);
  }
}
