import { Injectable } from '@angular/core';
import { AiApiPort } from '../../ai/ai-api.port';
import { ChatReply } from '../../ai/ai-api.models';
import { mockLegalCitations } from './mock-inventory';

@Injectable()
export class MockAiApiAdapter implements AiApiPort {
  async createConversation(): Promise<string> { return `session-${crypto.randomUUID()}`; }
  async uploadFile(): Promise<any> { throw new Error('File upload is unavailable in mock mode.'); }
  async uploadToPresignedUrl(): Promise<void> { return; }
  async getDownloadUrl(): Promise<any> { throw new Error('File download is unavailable in mock mode.'); }
  async ask(question: string): Promise<ChatReply> {
    await delay(350);
    return {
      text: `Respuesta de demostración: ${question}`,
      citations: mockLegalCitations
    };
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
