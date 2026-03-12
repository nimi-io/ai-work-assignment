/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ISummarizationProvider,
  SummarizationInput,
  SummarizationResult,
} from 'src/shared/interface/index.interface';
@Injectable()
export class GeminiProvider implements ISummarizationProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('gemini.apiKey', '');
    this.model = this.configService.get<string>(
      'gemini.model',
      'gemini-1.5-flash',
    );
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  async generateCandidateSummary(
    input: SummarizationInput,
  ): Promise<SummarizationResult> {
    const prompt = this.buildPrompt(input);

    this.logger.log(
      `Calling Gemini API for candidate ${input.candidateId} — model: ${this.model}`,
    );

    let responseText: string;

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${error}`);
      }

      const data = await response.json();
      responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error('Gemini returned an empty response');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Gemini API call failed: ${message}`);
      throw err;
    }

    return this.parseAndValidate(responseText, input.candidateId);
  }

  // ---------- private helpers ----------

  private buildPrompt(input: SummarizationInput): string {
    const docs = input.documents
      .map((d, i) => `--- Document ${i + 1} (${d.type}) ---\n${d.rawText}`)
      .join('\n\n');

    return `
You are an expert technical recruiter. Analyse the following candidate documents and return a structured JSON evaluation.

${docs}

Return ONLY a valid JSON object with this exact shape — no markdown, no explanation, no extra fields:
{
  "score": <integer 0-100>,
  "strengths": [<string>, ...],
  "concerns": [<string>, ...],
  "summary": "<concise 2-3 sentence candidate overview>",
  "recommendedDecision": "<advance | hold | reject>"
}
    `.trim();
  }

  private parseAndValidate(
    raw: string,
    candidateId: string,
  ): SummarizationResult {
    let parsed: unknown;

    try {
      // strip markdown fences if model ignores responseMimeType
      const clean = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new Error(
        `Gemini response for candidate ${candidateId} is not valid JSON`,
      );
    }

    const result = parsed as Record<string, unknown>;

    const validDecisions = ['advance', 'hold', 'reject'];

    if (
      typeof result.score !== 'number' ||
      result.score < 0 ||
      result.score > 100 ||
      !Array.isArray(result.strengths) ||
      !Array.isArray(result.concerns) ||
      typeof result.summary !== 'string' ||
      !result.summary.trim() ||
      typeof result.recommendedDecision !== 'string' ||
      !validDecisions.includes(result.recommendedDecision)
    ) {
      throw new Error(
        `Gemini response for candidate ${candidateId} failed validation — unexpected shape: ${JSON.stringify(result)}`,
      );
    }

    return {
      score: result.score as number,
      strengths: result.strengths as string[],
      concerns: result.concerns as string[],
      summary: result.summary as string,
      recommendedDecision: result.recommendedDecision as
        | 'advance'
        | 'hold'
        | 'reject',
    };
  }
}
