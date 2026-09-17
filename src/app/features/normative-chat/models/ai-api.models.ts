export type { ChatReply, UploadedAiFile } from './chat.models';

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

export interface AskAgentResultDto {
  readonly sessionId: string;
  readonly response: AgentCoreResponseDto;
}

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

export interface UploadUrlResultDto {
  readonly url: string;
  readonly key: string;
  readonly s3Uri: string;
  readonly expiresInSeconds: number;
}

export interface DownloadUrlResultDto {
  readonly url: string;
  readonly expiresInSeconds: number;
}
