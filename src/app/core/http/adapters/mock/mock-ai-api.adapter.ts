import { Injectable } from '@angular/core';
import { STATIC_IFC } from '../../../config/static-ifc';
import { AiApiPort, AiAskContext } from '../../../api/ai/ai-api.port';
import { ChatReply, DownloadUrlResultDto, UploadUrlResultDto } from '../../../api/ai/ai-api.models';
import { delay } from '../../../../shared/utils/delay';
import { mockLegalCitations } from './mock-inventory';

@Injectable()
export class MockAiApiAdapter implements AiApiPort {
  async createConversation(): Promise<string> { return `session-${crypto.randomUUID()}`; }
  resetConversation(): void { return; }
  async uploadFile(): Promise<UploadUrlResultDto> {
    throw new Error('File upload is unavailable in mock mode.');
  }
  async uploadToPresignedUrl(): Promise<void> { return; }
  async getDownloadUrl(): Promise<DownloadUrlResultDto> {
    throw new Error('File download is unavailable in mock mode.');
  }
  async ask(question: string, context: AiAskContext): Promise<ChatReply> {
    await delay(350);
    if (context.view === 'bim' && context.solutionId) {
      return {
        text: `Respuesta de demostración sobre ${STATIC_IFC.fileName} (solution ${context.solutionId}): ${question}.`,
        citations: [{
          document: STATIC_IFC.fileName,
          provision: 'IFC',
          text: `BIM solution ${context.solutionId}.`
        }]
      };
    }
    return {
      text: `Respuesta de demostración: ${question}`,
      citations: mockLegalCitations
    };
  }
}
