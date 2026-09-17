import { InjectionToken } from '@angular/core';
import { ActiveView } from '../../models/app.models';
import { ChatReply, DownloadUrlResultDto, UploadUrlResultDto } from './ai-api.models';

export interface AiAskContext {
  readonly scenarioId: string;
  readonly view: ActiveView;
  readonly solutionId?: string;
}

/** Application boundary for the AVRA conversational agent. */
export interface AiApiPort {
  ask(question: string, context: AiAskContext): Promise<ChatReply>;
  createConversation(): Promise<string>;
  resetConversation(): void;
  uploadFile(file: File, sessionId: string): Promise<UploadUrlResultDto>;
  uploadToPresignedUrl(url: string, file: File): Promise<void>;
  getDownloadUrl(s3Uri: string): Promise<DownloadUrlResultDto>;
}

export const AI_API = new InjectionToken<AiApiPort>('AI_API');
