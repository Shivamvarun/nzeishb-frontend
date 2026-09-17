export interface GeneratedArtifact {
  readonly fileName: string;
  readonly downloadUrl: string;
}

export type ArtifactKind = 'ifc' | 'budget' | 'report';

export interface ArtifactRecord {
  readonly id: string;
  readonly kind: ArtifactKind;
  readonly fileName: string;
  readonly variantId: string;
  readonly status: 'queued' | 'generating' | 'ready' | 'failed';
  readonly created: string;
  readonly downloadUrl?: string;
  readonly preview?: string;
}
