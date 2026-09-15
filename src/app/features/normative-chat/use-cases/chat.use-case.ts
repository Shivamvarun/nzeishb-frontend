import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { STATIC_IFC } from '../../../core/config/static-ifc';
import { ActiveView } from '../../../core/shared/models/common.models';
import { ShellService } from '../../../core/shared/services/shell.service';
import { ScenarioUseCase } from '../../scenario/use-cases/scenario.use-case';
import { CHAT_VIEW_COPY } from '../helpers/chat-copy';
import { DownloadUrlResultDto } from '../models/ai-api.models';
import { ChatMessage, ChatSuggestion, LegalCitation } from '../models/chat.models';
import { AI_API, AiApiPort, AiAskContext } from '../services/ai-api.port';

export interface ChatState {
  readonly activeView: ActiveView;
  readonly chatMessages: readonly ChatMessage[];
}

@Injectable({ providedIn: 'root' })
export class ChatUseCase {
  private readonly subject = new BehaviorSubject<ChatState>({
    activeView: 'spatial',
    chatMessages: [this.welcomeMessage('spatial')]
  });
  readonly state$ = this.subject.asObservable();

  constructor(
    @Inject(AI_API) private readonly aiApi: AiApiPort,
    private readonly scenario: ScenarioUseCase,
    private readonly shell: ShellService
  ) {}

  getState(): ChatState {
    return this.subject.value;
  }

  setActiveView(view: ActiveView): void {
    if (view === this.getState().activeView) return;
    this.aiApi.resetConversation();
    this.subject.next({
      activeView: view,
      chatMessages: [this.welcomeMessage(view)]
    });
  }

  async askNormative(question: string): Promise<void> {
    this.addChatMessage('user', question);
    try {
      const context: AiAskContext = {
        scenarioId: this.scenario.getState().activeScenario.id,
        view: this.getState().activeView,
        ...(this.getState().activeView === 'bim' ? { solutionId: STATIC_IFC.solutionId } : {})
      };
      const reply = await this.aiApi.ask(question, context);
      this.addChatMessage('bot', reply.text, reply.citations);
    } catch (error) {
      this.addChatMessage('bot', 'No se pudo consultar a AVRA AI. Inténtalo de nuevo en unos segundos.');
      this.shell.setError('No se pudo consultar la normativa.');
      console.error('askNormative failed', error);
    }
  }

  resetChat(): void {
    this.aiApi.resetConversation();
    this.subject.next({
      ...this.getState(),
      chatMessages: [this.welcomeMessage(this.getState().activeView)]
    });
  }

  welcomeForView(view: ActiveView): string {
    return CHAT_VIEW_COPY[view].welcome;
  }

  suggestionsForView(view: ActiveView): readonly ChatSuggestion[] {
    return CHAT_VIEW_COPY[view].suggestions;
  }

  placeholderForView(view: ActiveView): string {
    return CHAT_VIEW_COPY[view].placeholder;
  }

  async uploadAttachedFile(file: File): Promise<string> {
    const sessionId = await this.aiApi.createConversation();
    const result = await this.aiApi.uploadFile(file, sessionId);
    await this.aiApi.uploadToPresignedUrl(result.url, file);
    return result.s3Uri;
  }

  getDownloadUrl(s3Uri: string): Promise<DownloadUrlResultDto> {
    return this.aiApi.getDownloadUrl(s3Uri);
  }

  addChatMessage(sender: 'bot' | 'user', text: string, citations: readonly LegalCitation[] = []): void {
    this.subject.next({
      ...this.getState(),
      chatMessages: [
        ...this.getState().chatMessages,
        { sender, text, citations, timestamp: new Date().toLocaleTimeString() }
      ]
    });
  }

  private welcomeMessage(view: ActiveView): ChatMessage {
    return { sender: 'bot', text: this.welcomeForView(view), citations: [], timestamp: new Date().toLocaleTimeString() };
  }
}
