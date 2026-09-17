import { Injectable } from '@angular/core';
import { AiApiPort, AiAskContext } from '../../ai/ai-api.port';
import { ChatReply } from '../../ai/ai-api.models';
import { mockLegalCitations } from './mock-inventory';

@Injectable()
export class MockAiApiAdapter implements AiApiPort {
  async createConversation(): Promise<string> { return `session-${crypto.randomUUID()}`; }
  resetConversation(): void { return; }
  async uploadFile(): Promise<any> { throw new Error('File upload is unavailable in mock mode.'); }
  async uploadToPresignedUrl(): Promise<void> { return; }
  async getDownloadUrl(): Promise<any> { throw new Error('File download is unavailable in mock mode.'); }
  async ask(question: string, context: AiAskContext): Promise<ChatReply> {
    await delay(350);
    if (context.view === 'bim' && context.ifc) {
      return {
        text: `Respuesta de demostración sobre ${context.ifc.fileName}: ${question}. El contexto IFC es ${context.ifc.fileName} (${context.ifc.uri}).`,
        citations: [{
          document: context.ifc.fileName,
          provision: 'IFC',
          text: `Static IFC context ${context.ifc.fileName}.`,
          s3Uri: context.ifc.uri
        }]
      };
    }
    return {
      text: `Respuesta de demostración: ${question}`,
      citations: mockLegalCitations
    };
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
