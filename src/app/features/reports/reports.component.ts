import { Component, ChangeDetectionStrategy } from '@angular/core';
import { merge } from 'rxjs';
import { ArtifactKind } from './models/artifact.models';
import { ReportsUseCase } from './use-cases/reports.use-case';
import { SolutionsUseCase } from '../solutions/use-cases/solutions.use-case';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ButtonComponent]
})
export class ReportsComponent {
  state = this.compose();
  generating = new Set<ArtifactKind>();

  readonly artifacts: { kind: ArtifactKind; title: string; description: string; action: string }[] = [
    { kind: 'ifc', title: 'BIM IFC model (LOD 400)', description: 'IFC hierarchy, technical PSETs and model metadata.', action: 'Generate IFC' },
    { kind: 'budget', title: 'Detailed budget', description: 'Manufacturing, transport, assembly and KPI cost summary.', action: 'Generate budget' },
    { kind: 'report', title: 'Regulatory report', description: 'Traceable compliance report with deterministic KPI references.', action: 'Generate report' }
  ];

  constructor(
    private readonly reports: ReportsUseCase,
    private readonly solutions: SolutionsUseCase
  ) {
    merge(this.reports.state$, this.solutions.state$).subscribe(() => {
      this.state = this.compose();
    });
  }

  isGenerating(kind: ArtifactKind): boolean { return this.generating.has(kind); }

  export(kind: ArtifactKind): void {
    void this.createDownload(kind);
  }

  download(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }

  private compose() {
    return {
      ...this.reports.getState(),
      selectedVariant: this.solutions.getState().selectedVariant
    };
  }

  private async createDownload(kind: ArtifactKind): Promise<void> {
    this.generating.add(kind);
    try {
      const url = await this.reports.generateArtifact(kind);
      this.download(url, `${kind}-${this.state.selectedVariant.id}`);
    } finally {
      this.generating.delete(kind);
    }
  }
}
