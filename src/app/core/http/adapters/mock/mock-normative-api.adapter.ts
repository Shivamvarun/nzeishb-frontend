import { Injectable } from '@angular/core';
import { NormativeApiPort } from '../../../api/normative/normative-api.port';
import { ChatReply } from '../../../api/normative/normative-api.models';
import { delay } from '../../../../shared/utils/delay';
import { mockLegalCitations } from './mock-inventory';

@Injectable()
export class MockNormativeApiAdapter implements NormativeApiPort {
  async askNormative(question: string): Promise<ChatReply> {
    await delay(350);
    return { text: `Respuesta de demostración: ${question}`, citations: mockLegalCitations };
  }
}
