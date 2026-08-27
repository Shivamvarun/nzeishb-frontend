import { InjectionToken } from '@angular/core';
import { ChatReply } from './ai-api.models';

/** Application boundary for the ARVA conversational agent. */
export interface AiApiPort {
  ask(question: string, scenarioId: string): Promise<ChatReply>;
}

export const AI_API = new InjectionToken<AiApiPort>('AI_API');
