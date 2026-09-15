import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent } from 'ngx-markdown';
import { Subscription } from 'rxjs';
import { ActiveView } from '../../core/shared/models/common.models';
import { UploadedAiFile } from './models/chat.models';
import { ChatState, ChatUseCase } from './use-cases/chat.use-case';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
    selector: 'app-normative-chat',
    templateUrl: './normative-chat.component.html',
    styleUrls: ['./normative-chat.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, MarkdownComponent, ButtonComponent]
})
export class NormativeChatComponent implements OnDestroy {
  state: ChatState = this.chat.getState();
  inputText = '';
  isSending = false;
  isOpen = false;
  isExpanded = false;
  attachedFile: UploadedAiFile | null = null;
  uploadState: 'idle' | 'uploading' | 'uploaded' | 'failed' = 'idle';
  uploadError = '';

  private lastView: ActiveView = this.state.activeView;
  private readonly subscription: Subscription;

  constructor(
    private readonly chat: ChatUseCase
  ) {
    this.subscription = this.chat.state$.subscribe(state => {
      if (state.activeView !== this.lastView) {
        this.lastView = state.activeView;
        this.inputText = '';
        this.removeFile();
      }
      this.state = state;
    });
  }

  get suggestions() {
    return this.chat.suggestionsForView(this.state.activeView);
  }

  get inputPlaceholder(): string {
    return this.chat.placeholderForView(this.state.activeView);
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
      await this.chat.askNormative(query);
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
      const s3Uri = await this.chat.uploadAttachedFile(file);
      this.attachedFile = { ...this.attachedFile, s3Uri };
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
    await this.openDownload(this.attachedFile.s3Uri);
  }

  async downloadCitation(s3Uri: string): Promise<void> {
    await this.openDownload(s3Uri);
  }

  clearChat(): void {
    this.chat.resetChat();
    this.inputText = '';
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  private async openDownload(s3Uri: string): Promise<void> {
    try {
      const result = await this.chat.getDownloadUrl(s3Uri);
      window.open(result.url, '_blank', 'noopener');
    } catch (error) {
      this.uploadError = 'File download is currently unavailable.';
      console.error('AI file download failed', error);
    }
  }
}
