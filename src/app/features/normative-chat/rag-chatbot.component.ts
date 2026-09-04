import { Component, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { placeholderForView, suggestionsForView } from '../../core/ai/chat-copy';
import { AI_API, AiApiPort } from '../../core/api/ai/ai-api.port';
import { ActiveView, AppState } from '../../core/models/app.models';
import { StoreService } from '../../core/state/store.service';

@Component({
  selector: 'app-rag-chatbot',
  templateUrl: '../../components/rag-chatbot/rag-chatbot.component.html',
  styleUrls: ['../../components/rag-chatbot/rag-chatbot.component.css']
})
export class RagChatbotComponent implements OnDestroy {
  state: AppState = this.store.getState();
  inputText = '';
  s3UriInput = '';
  isSending = false;
  isOpen = false;
  isHelpOpen = false;
  isExpanded = false;
  attachedFile: { file: File; s3Uri: string; name: string; mimeType: string } | null = null;
  uploadState: 'idle' | 'uploading' | 'uploaded' | 'failed' = 'idle';
  uploadError = '';

  private lastView: ActiveView = this.state.activeView;
  private readonly subscription: Subscription;

  constructor(
    private readonly store: StoreService,
    @Inject(AI_API) private readonly aiApi: AiApiPort
  ) {
    this.subscription = this.store.state$.subscribe(state => {
      if (state.activeView !== this.lastView) {
        this.lastView = state.activeView;
        this.inputText = '';
        this.removeFile();
      }
      this.state = state;
    });
  }

  get suggestions() {
    return suggestionsForView(this.state.activeView);
  }

  get inputPlaceholder(): string {
    return placeholderForView(this.state.activeView);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async sendMessage(): Promise<void> {
    const query = this.inputText.trim();
    if (!query || this.isSending || this.uploadState === 'uploading') return;
    this.inputText = '';
    this.isSending = true;
    try {
      await this.store.askNormative(
        query,
        this.attachedFile
          ? [{ input_id: 'file-1', name: this.attachedFile.name, mime_type: this.attachedFile.mimeType, s3_uri: this.attachedFile.s3Uri }]
          : undefined
      );
    } finally {
      this.isSending = false;
    }
  }

  suggest(query: string): void {
    this.inputText = query;
    void this.sendMessage();
  }

  async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const mimeType = file.type || (/\.ifc$/i.test(file.name) ? 'model/ifc' : 'application/pdf');
    this.attachedFile = { file, s3Uri: '', name: file.name, mimeType };
    this.uploadState = 'uploading';
    this.uploadError = '';
    try {
      const sessionId = await this.aiApi.createConversation();
      const result = await this.aiApi.uploadFile(file, sessionId);
      await this.aiApi.uploadToPresignedUrl(result.url, file);
      this.attachedFile = { ...this.attachedFile, s3Uri: result.s3Uri };
      this.uploadState = 'uploaded';
    } catch (error) {
      this.uploadState = 'failed';
      this.uploadError = 'File upload is currently unavailable.';
      console.error('AI file upload failed', error);
    }
  }

  removeFile(): void {
    this.attachedFile = null;
    this.uploadState = 'idle';
    this.uploadError = '';
  }

  async downloadFile(): Promise<void> {
    if (!this.attachedFile?.s3Uri) return;
    try {
      const result = await this.aiApi.getDownloadUrl(this.attachedFile.s3Uri);
      window.open(result.url, '_blank', 'noopener');
    } catch (error) {
      this.uploadError = 'File download is currently unavailable.';
      console.error('AI file download failed', error);
    }
  }

  async downloadExistingFile(): Promise<void> {
    const s3Uri = this.s3UriInput.trim();
    if (!s3Uri) return;
    this.uploadError = '';
    try {
      const result = await this.aiApi.getDownloadUrl(s3Uri);
      window.open(result.url, '_blank', 'noopener');
    } catch (error) {
      this.uploadError = 'File download is currently unavailable.';
      console.error('AI S3 download failed', error);
    }
  }

  async downloadCitation(s3Uri: string): Promise<void> {
    try {
      const result = await this.aiApi.getDownloadUrl(s3Uri);
      window.open(result.url, '_blank', 'noopener');
    } catch (error) {
      this.uploadError = 'File download is currently unavailable.';
      console.error('AI citation download failed', error);
    }
  }

  clearChat(): void {
    this.store.resetChat();
    this.inputText = '';
    this.isHelpOpen = false;
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleHelp(): void {
    this.isHelpOpen = !this.isHelpOpen;
  }
}
