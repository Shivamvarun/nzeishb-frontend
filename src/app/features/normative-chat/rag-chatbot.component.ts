import { Component } from '@angular/core';
import { AppState } from '../../core/models/app.models';
import { StoreService } from '../../core/state/store.service';
@Component({ selector: 'app-rag-chatbot', templateUrl: '../../components/rag-chatbot/rag-chatbot.component.html', styleUrls: ['../../components/rag-chatbot/rag-chatbot.component.css'] })
export class RagChatbotComponent { state: AppState = this.store.getState(); inputText = ''; isSending = false; constructor(private readonly store: StoreService) { this.store.state$.subscribe(state => this.state = state); } async sendMessage(): Promise<void> { const query = this.inputText.trim(); if (!query || this.isSending) return; this.inputText = ''; this.isSending = true; try { await this.store.askNormative(query); } finally { this.isSending = false; } } suggest(query: string): void { this.inputText = query; void this.sendMessage(); } }
