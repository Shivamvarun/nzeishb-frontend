import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AgentCoreResponseDto,
  AgentCoreSourceDto,
  ApiEnvelopeDto,
  AskAgentResultDto,
  ChatReply,
  CreateConversationResultDto,
  DownloadUrlResultDto,
  UploadUrlResultDto
} from '../models/ai-api.models';
import { LegalCitation } from '../models/chat.models';
import { AiApiPort, AiAskContext } from './ai-api.port';

@Injectable()
export class AiHttpService implements AiApiPort {
  private sessionId: string | null = null;
  private sessionRequest: Promise<string> | null = null;

  constructor(private readonly http: HttpClient) {}

  async ask(question: string, context: AiAskContext): Promise<ChatReply> {
    const sessionId = await this.ensureSession();

    const envelope = await firstValueFrom(
      this.http.post<ApiEnvelopeDto<AskAgentResultDto | AgentCoreResponseDto>>(
        `${this.baseUrl()}${environment.aiMessagesPath}`,
        {
          session_id: sessionId,
          user_id: environment.aiUserId,
          project_id: environment.aiProjectId,
          prompt: promptWithLanguageRequirement(question),
          ...(context.solutionId ? { solution_id: context.solutionId } : {})
        }
      )
    );

    return toChatReply(agentCoreResponse(envelope.data));
  }

  async createConversation(): Promise<string> { return this.ensureSession(); }
  resetConversation(): void {
    this.sessionId = null;
    this.sessionRequest = null;
  }
  async uploadFile(file: File, sessionId: string): Promise<any> {
    return firstValueFrom(this.http.post<ApiEnvelopeDto<any>>(`${this.baseUrl()}/ai/files/upload-url`, { session_id: sessionId, filename: file.name, content_type: file.type } )).then(r => r.data);
  }

  async uploadToPresignedUrl(url: string, file: File): Promise<void> {
    await firstValueFrom(this.http.put(url, file, { headers: { 'Content-Type': file.type }, responseType: 'text' }));
  }

  async getDownloadUrl(s3Uri: string): Promise<DownloadUrlResultDto> {
    const envelope = await firstValueFrom(
      this.http.post<ApiEnvelopeDto<DownloadUrlResultDto>>(`${this.baseUrl()}/ai/files/download-url`, { s3_uri: s3Uri })
    );
    return envelope.data;
  }

  private async ensureSession(): Promise<string> {
    if (this.sessionId) {
      return this.sessionId;
    }

    if (!this.sessionRequest) {
      const newRequest: Promise<string> = firstValueFrom(
        this.http.post<ApiEnvelopeDto<CreateConversationResultDto>>(
          `${this.baseUrl()}${environment.aiConversationsPath}`,
          {}
        )
      )
        .then(envelope => {
          const sessionId = envelope.data.sessionId;
          this.sessionId = sessionId;
          return sessionId;
        })
        .finally(() => {
          this.sessionRequest = null;
        });

      this.sessionRequest = newRequest;
      return newRequest;
    }

    return this.sessionRequest;
  }

  private baseUrl(): string {
    return environment.aiApiBaseUrl || environment.apiBaseUrl;
  }
}

function agentCoreResponse(data: AskAgentResultDto | AgentCoreResponseDto): AgentCoreResponseDto {
  return 'response' in data ? data.response : data;
}

function promptWithLanguageRequirement(question: string): string {
  const isSpanish = /[¿¡ñáéíóúü]|\b(?:qué|que|cómo|como|cuál|cual|dónde|donde|por qué|porque|hola|gracias|puedo|necesito|vivienda|terreno|normativa|edificable)\b/i.test(question);
  const language = isSpanish ? 'Spanish' : 'English';

  return `${question}\n\nResponse language requirement: Reply entirely in ${language}. Keep any necessary official names, legal citations, and quoted source text unchanged.`;
}

function toChatReply(response: AgentCoreResponseDto): ChatReply {
  if (response.status === 'error') {
    throw new Error(response.message || 'AgentCore returned an error response.');
  }

  const result = response.results[0];
  const analysis = result?.analysis;

  if (!analysis) {
    throw new Error('AgentCore response did not include an analysis result.');
  }

  return {
    text: analysis.response,
    citations: (analysis.sources ?? []).map(toLegalCitation)
  };
}
function toLegalCitation(source: AgentCoreSourceDto): LegalCitation {
  return {
    document: source.document,
    provision: `#${source.id}`,
    text: source.text,
    ...(source.uri?.startsWith('s3://') ? { s3Uri: source.uri } : {})
  };
}
