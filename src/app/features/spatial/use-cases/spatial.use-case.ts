import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ShellService } from '../../../core/shared/services/shell.service';
import { PLACEHOLDER_PLOT, Plot, SpatialContextSnapshot } from '../models/spatial.models';
import { SPATIAL_API, SpatialApiPort } from '../services/spatial-api.port';

export interface SpatialState {
  readonly plots: readonly Plot[];
  readonly activePlot: Plot;
}

@Injectable({ providedIn: 'root' })
export class SpatialUseCase {
  private readonly subject = new BehaviorSubject<SpatialState>({
    plots: [],
    activePlot: PLACEHOLDER_PLOT
  });
  readonly state$ = this.subject.asObservable();

  constructor(
    @Inject(SPATIAL_API) private readonly spatialApi: SpatialApiPort,
    private readonly shell: ShellService
  ) {}

  getState(): SpatialState {
    return this.subject.value;
  }

  getPlots(): readonly Plot[] {
    return this.getState().plots;
  }

  getPlotById(id: string): Plot | undefined {
    return this.getState().plots.find(plot => plot.id === id);
  }

  hydrate(plots: readonly Plot[], activePlot: Plot): void {
    this.subject.next({ plots, activePlot });
  }

  setActivePlot(plot: Plot): void {
    this.subject.next({ ...this.getState(), activePlot: plot });
  }

  async findAndSelectPlot(reference: string): Promise<boolean> {
    const plot = await this.spatialApi.findPlotByCadastralRef(reference);
    if (!plot) return false;
    const plots = this.getState().plots.some(item => item.id === plot.id)
      ? this.getState().plots
      : [...this.getState().plots, plot];
    this.subject.next({ plots, activePlot: plot });
    this.shell.setError(null);
    return true;
  }

  addPlot(plot: Plot): void {
    this.subject.next({
      plots: [...this.getState().plots, plot],
      activePlot: plot
    });
    this.shell.setError(null);
  }

  getContext(plotId: string, scenarioId: string): Promise<SpatialContextSnapshot> {
    return this.spatialApi.getContext(plotId, scenarioId);
  }
}
