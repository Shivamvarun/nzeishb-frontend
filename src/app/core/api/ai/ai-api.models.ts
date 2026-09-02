export type { ChatReply } from '../../models/app.models';

/**
 * Wire-format types for the nZEISHB AgentCore integration
 * (see nZEISHB-Agent-Integration.md and services/ai-service's
 * ask-agent.dto.ts / packages/ai-agentcore/agentcore.port.ts on the
 * backend). These mirror the *response* contract only — the request body
 * is built inline in HttpAiApiAdapter since it is small and used once.
 *
 * These types are intentionally local to the HTTP adapter boundary and are
 * not used by the application/feature layer, which only ever sees the
 * port-level ChatReply.
 */

export interface AgentCoreSourceDto {
  readonly id: number;
  readonly document: string;
  readonly uri: string;
  readonly text: string;
}

export interface AgentCoreAnalysisDto {
  readonly response: string;
  readonly sources?: readonly AgentCoreSourceDto[];
  readonly tools_used?: readonly string[];
}

export interface AgentCoreResultDto {
  readonly input_id: string;
  readonly status: 'ok' | 'error';
  readonly analysis: AgentCoreAnalysisDto;
}

export interface AgentCoreResponseDto {
  readonly schema_version: '1.0.0';
  readonly status: 'ok' | 'error';
  readonly message: string;
  readonly results: readonly AgentCoreResultDto[];
}

/**
 * Current ai-service message responses wrap the AgentCore payload with the
 * server-generated session id. Older service builds returned the payload
 * directly, so the HTTP adapter accepts both shapes during rollout.
 */
export interface AskAgentResultDto {
  readonly sessionId: string;
  readonly response: AgentCoreResponseDto;
}

/** ai-service wraps every response in AVRA's standard API envelope. */
export interface ApiEnvelopeDto<TData> {
  readonly success: boolean;
  readonly data: TData;
  readonly metadata?: {
    readonly traceId: string;
    readonly timestamp: string;
    readonly version: string;
  };
}

export interface CreateConversationResultDto {
  readonly sessionId: string;
}

export interface UploadedAiFile { readonly file: File; readonly s3Uri: string; readonly name: string; readonly mimeType: string; }
export interface UploadUrlResultDto { readonly url: string; readonly key: string; readonly s3Uri: string; readonly expiresInSeconds: number; }
export interface DownloadUrlResultDto { readonly url: string; readonly expiresInSeconds: number; }
