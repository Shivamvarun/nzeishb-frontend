export interface LegalCitation {
  readonly document: string;
  readonly provision: string;
  readonly text: string;
  readonly s3Uri?: string;
}

export interface ChatReply {
  readonly text: string;
  readonly citations: readonly LegalCitation[];
}

export interface ChatMessage {
  readonly sender: 'bot' | 'user';
  readonly text: string;
  readonly citations: readonly LegalCitation[];
  readonly timestamp: string;
}

export interface UploadedAiFile {
  readonly file: File;
  readonly s3Uri: string;
  readonly name: string;
  readonly mimeType: string;
}

export interface ChatSuggestion {
  readonly label: string;
  readonly query: string;
}

export interface ViewCopy {
  readonly welcome: string;
  readonly placeholder: string;
  readonly suggestions: readonly ChatSuggestion[];
}

export function suggestion(text: string): ChatSuggestion {
  return { label: text, query: text };
}
