import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AiApiPort } from '../../ai/ai-api.port';
import { ChatReply } from '../../ai/ai-api.models';

/**
 * AI adapter boundary. The exact gateway route/payload must follow the
 * published AI contract when it is available; the feature UI does not change.
 */
@Injectable()
export class HttpAiApiAdapter implements AiApiPort {
  constructor(private readonly http: HttpClient) {}

  ask(question: string, scenarioId: string): Promise<ChatReply> {
    if (!environment.aiApiPath) {
      return Promise.reject(new Error('AI gateway route is not configured.'));
    }

    return firstValueFrom(
      this.http.post<ChatReply>(
        `${environment.apiBaseUrl}${environment.aiApiPath}`,
        { question, scenarioId }
      )
    );
  }
}
