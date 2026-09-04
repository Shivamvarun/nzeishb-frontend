import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AiApiPort, AiAskContext } from '../../ai/ai-api.port';
import {
  ApiEnvelopeDto,
  AskAgentResultDto,
  AgentCoreResponseDto,
  AgentCoreSourceDto,
  CreateConversationResultDto,
  ChatReply
} from '../../ai/ai-api.models';
import { LegalCitation } from '../../../models/app.models';

/**
 * AI adapter for the nZEISHB AgentCore integration.
 *
 * Talks to ai-service's /api/v1/ai/conversations and /api/v1/ai/messages
 * routes (see nZEISHB-Agent-Integration.md and ask-agent.dto.ts on the
 * backend). The api-gateway does not yet proxy /api/v1/ai/*
 * (apps/api-gateway/src/main.ts), so aiApiBaseUrl currently points
 * straight at ai-service; see environment.ts for the fallback behaviour
 * once the gateway proxy exists.
 *
 * AgentCore requires a runtimeSessionId that is created once and reused
 * for every turn of the same conversation. That session concept is an
 * AgentCore/infrastructure detail, not something the application layer
 * (StoreService) or the AiApiPort contract should know about, so it is
 * owned entirely inside this adapter.
 */
@Injectable()
export class HttpAiApiAdapter implements AiApiPort {
  /** Cached AgentCore session id, created lazily on first use. */
  private sessionId: string | null = null;

  /** In-flight session creation, so concurrent calls don't create two sessions. */
  private sessionRequest: Promise<string> | null = null;

  constructor(private readonly http: HttpClient) {}

  async ask(question: string, context: AiAskContext): Promise<ChatReply> {
    const sessionId = await this.ensureSession();
    const inputs = [...(context.inputs ?? [])];
    if (context.ifc && !inputs.some(item => item.s3_uri === context.ifc!.uri)) {
      inputs.unshift({
        input_id: 'ifc-modelo',
        name: context.ifc.fileName,
        mime_type: 'model/ifc',
        s3_uri: context.ifc.uri
      });
    }

    const envelope = await firstValueFrom(
      this.http.post<ApiEnvelopeDto<AskAgentResultDto | AgentCoreResponseDto>>(
        `${this.baseUrl()}${environment.aiMessagesPath}`,
        {
          session_id: sessionId,
          user_id: environment.aiUserId,
          project_id: environment.aiProjectId,
          prompt: promptWithLanguageRequirement(question),
          ...(inputs.length ? { inputs } : {})
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
  async uploadToPresignedUrl(url: string, file: File): Promise<void> { await firstValueFrom(this.http.put(url, file, { headers: { 'Content-Type': file.type }, responseType: 'text' })); }
  async getDownloadUrl(s3Uri: string): Promise<any> { return firstValueFrom(this.http.post<ApiEnvelopeDto<any>>(`${this.baseUrl()}/ai/files/download-url`, { s3_uri: s3Uri })).then(r => r.data); }

  /** Returns the cached AgentCore session id, creating one if needed. */
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

/** Supports both the current ai-service result wrapper and the earlier API. */
function agentCoreResponse(data: AskAgentResultDto | AgentCoreResponseDto): AgentCoreResponseDto {
  return 'response' in data ? data.response : data;
}

/**
 * AgentCore does not receive the browser locale. Give it an explicit answer
 * language instruction so an English question is not answered in Spanish (or
 * the reverse). This is intentionally a small, conservative detector: when
 * unclear, English is used rather than guessing a language from a name.
 */
function promptWithLanguageRequirement(question: string): string {
  const isSpanish = /[¿¡ñáéíóúü]|\b(?:qué|que|cómo|como|cuál|cual|dónde|donde|por qué|porque|hola|gracias|puedo|necesito|vivienda|terreno|normativa|edificable)\b/i.test(question);
  const language = isSpanish ? 'Spanish' : 'English';

  return `${question}\n\nResponse language requirement: Reply entirely in ${language}. Keep any necessary official names, legal citations, and quoted source text unchanged.`;
}

/** Maps the AgentCore response contract onto the application's ChatReply. */
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

/**
 * AgentCore sources don't carry a "provision" field the way ChatReply's
 * LegalCitation does. The response text already references sources with
 * inline `[#N]` markers matching `sources[].id`, so `#N` is used here to
 * keep the citation chip consistent with those markers rather than left
 * blank or invented.
 */
function toLegalCitation(source: AgentCoreSourceDto): LegalCitation {
  return {
    document: source.document,
    provision: `#${source.id}`,
    text: source.text,
    ...(source.uri?.startsWith('s3://') ? { s3Uri: source.uri } : {})
  };
}
