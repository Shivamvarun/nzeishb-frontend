import { Injectable } from '@angular/core';
import { NormativeApiPort } from '../../normative/normative-api.port';
import { ChatReply } from '../../normative/normative-api.models';
import { mockLegalCitations } from './mock-inventory';

@Injectable()
export class MockNormativeApiAdapter implements NormativeApiPort {
  async askNormative(question: string): Promise<ChatReply> {
    await delay(350);
    return { text: `Respuesta de demostración: ${question}`, citations: mockLegalCitations };
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
