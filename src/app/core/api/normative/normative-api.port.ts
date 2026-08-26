import { InjectionToken } from '@angular/core';
import { ChatReply } from './normative-api.models';

export interface NormativeApiPort {
  askNormative(question: string, scenarioId: string): Promise<ChatReply>;
}

export const NORMATIVE_API = new InjectionToken<NormativeApiPort>('NORMATIVE_API');
