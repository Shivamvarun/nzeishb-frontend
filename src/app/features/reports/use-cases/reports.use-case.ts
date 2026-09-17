import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BIM_API, BimApiPort } from '../../bim/services/bim-api.port';
import { ShellService } from '../../../core/shared/services/shell.service';
import { Variant } from '../../optimization/models/optimization.models';
import { SolutionsUseCase } from '../../solutions/use-cases/solutions.use-case';
import { ArtifactKind, ArtifactRecord, GeneratedArtifact } from '../models/artifact.models';
import { REPORT_API, ReportApiPort } from '../services/report-api.port';

export interface ReportsState {
  readonly artifactHistory: readonly ArtifactRecord[];
}

@Injectable({ providedIn: 'root' })
export class ReportsUseCase {
  private readonly subject = new BehaviorSubject<ReportsState>({ artifactHistory: [] });
  readonly state$ = this.subject.asObservable();

  constructor(
    @Inject(BIM_API) private readonly bimApi: BimApiPort,
    @Inject(REPORT_API) private readonly reportApi: ReportApiPort,
    private readonly solutions: SolutionsUseCase,
    private readonly shell: ShellService
  ) {}

  getState(): ReportsState {
    return this.subject.value;
  }

  async generateArtifact(kind: ArtifactKind): Promise<string> {
    const id = `${kind}-${Date.now()}`;
    const variant = this.solutions.getState().selectedVariant;
    const pending: ArtifactRecord = {
      id,
      kind,
      fileName: `${kind}-${variant.id}`,
      variantId: variant.id,
      status: 'generating',
      created: new Date().toLocaleString(),
      preview: this.previewFor(kind, variant)
    };
    this.patch({ artifactHistory: [pending, ...this.getState().artifactHistory] });
    try {
      const artifact = await this.generateArtifactFromApi(kind, variant.id);
      this.patch({
        artifactHistory: this.getState().artifactHistory.map(item =>
          item.id === id
            ? { ...item, status: 'ready', fileName: artifact.fileName, downloadUrl: artifact.downloadUrl }
            : item
        )
      });
      return artifact.downloadUrl;
    } catch (error) {
      this.patch({
        artifactHistory: this.getState().artifactHistory.map(item =>
          item.id === id ? { ...item, status: 'failed' } : item
        )
      });
      this.shell.setError('No se pudo generar el entregable.');
      throw error;
    }
  }

  private patch(change: Partial<ReportsState>): void {
    this.subject.next({ ...this.getState(), ...change });
  }

  private generateArtifactFromApi(kind: ArtifactKind, solutionId: string): Promise<GeneratedArtifact> {
    if (kind === 'ifc') return this.bimApi.generateIfc(solutionId);
    if (kind === 'budget') return this.reportApi.generateBudget(solutionId);
    return this.reportApi.generateReport(solutionId);
  }

  private previewFor(kind: ArtifactKind, variant: Variant): string {
    const previews: Record<ArtifactKind, string> = {
      ifc: `IFC LOD 400 for ${variant.name}: ${variant.stories} stories, ${variant.housingUnits} dwellings, structure ${variant.structureId}.`,
      budget: `Budget preview: ${variant.costPerUnit.toLocaleString()} EUR/unit and ${variant.costPerM2.toLocaleString()} EUR/m2.`,
      report: `Regulatory report preview: nZEB ${variant.zebCompliancePct}%, BREEAM ${variant.breeamScore}, VERDE ${variant.verdeScore}.`
    };
    return previews[kind];
  }
}
