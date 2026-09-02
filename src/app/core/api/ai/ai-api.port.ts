import { InjectionToken } from '@angular/core';
import { ChatReply, DownloadUrlResultDto, UploadUrlResultDto } from './ai-api.models';

/** Application boundary for the AVRA conversational agent. */
export interface AiApiPort {
  ask(question: string, scenarioId: string, inputs?: readonly { input_id: string; name: string; mime_type: string; s3_uri: string }[]): Promise<ChatReply>;
  createConversation(): Promise<string>;
  uploadFile(file: File, sessionId: string): Promise<UploadUrlResultDto>;
  uploadToPresignedUrl(url: string, file: File): Promise<void>;
  getDownloadUrl(s3Uri: string): Promise<DownloadUrlResultDto>;
}

export const AI_API = new InjectionToken<AiApiPort>('AI_API');
