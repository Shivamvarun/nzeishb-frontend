import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { NormativeApiPort } from '../../normative/normative-api.port';
import { ChatReply } from '../../normative/normative-api.models';

@Injectable()
export class HttpNormativeApiAdapter implements NormativeApiPort {
  constructor(private readonly http: HttpClient) {}

  askNormative(question: string, scenarioId: string): Promise<ChatReply> {
    return firstValueFrom(this.http.post<ChatReply>(`${environment.apiBaseUrl}/normative/query`, { question, scenarioId }));
  }
}
