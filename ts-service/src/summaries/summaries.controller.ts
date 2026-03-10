import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { SummariesService } from './summaries.service';
import { CurrentUser } from '../auth/auth-user.decorator';
import { AuthUser } from '../auth/auth.types';

@ApiTags('Summaries')
@Controller('candidates/:candidateId/summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Post('generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger LLM summarization for a candidate', description: 'Creates a pending summary record and enqueues background LLM processing. Returns 202 immediately.' })
  @ApiParam({ name: 'candidateId', description: 'UUID of the candidate' })
  @ApiAcceptedResponse({ description: 'Summary generation queued' })
  @ApiNotFoundResponse({ description: 'Candidate not found' })
  @ApiForbiddenResponse({ description: 'Candidate does not belong to this workspace' })
  generate(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.summariesService.generate(candidateId, user.workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'List all summaries for a candidate' })
  @ApiParam({ name: 'candidateId', description: 'UUID of the candidate' })
  @ApiOkResponse({ description: 'Array of summary records with their current status' })
  @ApiNotFoundResponse({ description: 'Candidate not found' })
  @ApiForbiddenResponse({ description: 'Candidate does not belong to this workspace' })
  findAll(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.summariesService.findAllForCandidate(
      candidateId,
      user.workspaceId,
    );
  }

  @Get(':summaryId')
  @ApiOperation({ summary: 'Get a single summary by ID' })
  @ApiParam({ name: 'candidateId', description: 'UUID of the candidate' })
  @ApiParam({ name: 'summaryId', description: 'UUID of the summary' })
  @ApiOkResponse({ description: 'Full summary detail including score, strengths, concerns and decision' })
  @ApiNotFoundResponse({ description: 'Candidate or summary not found' })
  @ApiForbiddenResponse({ description: 'Candidate does not belong to this workspace' })
  findOne(
    @Param('candidateId') candidateId: string,
    @Param('summaryId') summaryId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.summariesService.findOne(
      summaryId,
      candidateId,
      user.workspaceId,
    );
  }
}
