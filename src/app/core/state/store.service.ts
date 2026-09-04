import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SPATIAL_API, SpatialApiPort } from '../api/spatial/spatial-api.port';
import { SCENARIO_API, ScenarioApiPort } from '../api/scenario/scenario-api.port';
import { OPTIMIZATION_API, OptimizationApiPort } from '../api/optimization/optimization-api.port';
import { BIM_API, BimApiPort } from '../api/bim/bim-api.port';
import { AUDIT_API, AuditApiPort } from '../api/audit/audit-api.port';
import { REPORT_API, ReportApiPort } from '../api/report/report-api.port';
import { AI_API, AiApiPort, AiAskContext } from '../api/ai/ai-api.port';
import { WORKSPACE_API, WorkspaceApiPort } from '../api/workspace/workspace-api.port';
import { welcomeForView } from '../ai/chat-copy';
import { staticIfcRef } from '../ai/static-ifc';
import { ActiveView, AppState, ArtifactKind, Plot, Scenario, Variant, VpoParams } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly subject = new BehaviorSubject<AppState>(this.createInitialState());
  readonly state$ = this.subject.asObservable();

  constructor(
    @Inject(WORKSPACE_API) private readonly workspaceApi: WorkspaceApiPort,
    @Inject(SPATIAL_API) private readonly spatialApi: SpatialApiPort,
    @Inject(SCENARIO_API) private readonly scenarioApi: ScenarioApiPort,
    @Inject(OPTIMIZATION_API) private readonly optimizationApi: OptimizationApiPort,
    @Inject(AI_API) private readonly aiApi: AiApiPort,
    @Inject(BIM_API) private readonly bimApi: BimApiPort,
    @Inject(AUDIT_API) private readonly auditApi: AuditApiPort,
    @Inject(REPORT_API) private readonly reportApi: ReportApiPort
  ) {
    void this.loadWorkspace();
  }

  getState(): AppState { return this.subject.value; }
  getPlots(): readonly Plot[] { return this.getState().plots; }
  getPlotById(id: string): Plot | undefined { return this.getState().plots.find(plot => plot.id === id); }
  setActiveView(view: ActiveView): void {
    if (view === this.getState().activeView) return;
    this.aiApi.resetConversation();
    this.patch({
      activeView: view,
      chatMessages: [this.welcomeMessage(view)]
    });
  }

  selectScenario(scenarioId: string): void {
    const scenario = this.getState()
      .scenarioHistory
      .find(item => item.id === scenarioId);
  
    if (!scenario) {
      return;
    }
  
    this.patch({
      activeScenario: scenario
    });
  }
  setSelectedVariant(id: string): void {
    const variant = this.getState().variants.find(item => item.id === id);
    if (variant) this.patch({ selectedVariant: variant });
  }

  setComparedVariant(slot: 0 | 1, id: string): void {
    const variant = this.getState().variants.find(item => item.id === id);
    if (!variant) return;
    const compared: [Variant, Variant] = [...this.getState().comparedVariants] as [Variant, Variant];
    compared[slot] = variant;
    if (compared[0].id === compared[1].id) {
      compared[slot === 0 ? 1 : 0] = this.getState().variants.find(item => item.id !== id) ?? compared[slot];
    }
    this.patch({ comparedVariants: compared });
  }

  toggleComparedVariant(id: string): void {
    const variant = this.getState().variants.find(item => item.id === id);
    if (!variant) return;
    const [first, second] = this.getState().comparedVariants;
    if (first.id === id || second.id === id) return;
    this.patch({ comparedVariants: [second, variant] });
  }

  updateVPOParams(params: Partial<VpoParams>): void {
    this.patch({ vpoParams: { ...this.getState().vpoParams, ...params } });
  }

  setActivePlot(plot: Plot): void { this.patch({ activePlot: plot }); }

  async findAndSelectPlot(reference: string): Promise<boolean> {
    const plot = await this.spatialApi.findPlotByCadastralRef(reference);
    if (!plot) return false;
    const plots = this.getState().plots.some(item => item.id === plot.id) ? this.getState().plots : [...this.getState().plots, plot];
    this.patch({ plots, activePlot: plot, error: null });
    return true;
  }

  addImportedPlot(plot: Plot): void {
    this.patch({ plots: [...this.getState().plots, plot], activePlot: plot, error: null });
  }

  addPlot(plot: Plot): void { this.addImportedPlot(plot); }

  async saveScenario(): Promise<void> {
    this.patch({ isSaving: true, error: null });
    try {
      const saved = await this.scenarioApi.saveScenario(this.getState().activeScenario, this.getState().vpoParams, this.getState().activePlot.id);
      const scenario = { ...saved, updated: new Date().toISOString(), plotId: this.getState().activePlot.id };
      this.patch({ activeScenario: scenario, scenarioHistory: this.upsertScenario(scenario) });
    } catch {
      this.patch({ error: 'No se pudo guardar el escenario.' });
    } finally {
      this.patch({ isSaving: false });
    }
  }

  async createScenario(): Promise<void> {
    try {
      const scenario = await this.scenarioApi.createScenario(this.getState().activePlot.id, this.getState().vpoParams);
      this.patch({ activeScenario: scenario, scenarioHistory: this.upsertScenario(scenario), error: null });
    } catch {
      this.patch({ error: 'No se pudo crear el escenario.' });
    }
  }

  reopenScenario(id: string): void {
    const scenario = this.getState().scenarioHistory.find(item => item.id === id);
    if (scenario) this.patch({ activeScenario: scenario });
  }

  async deleteScenario(id: string): Promise<void> {
    try {
      await this.scenarioApi.deleteScenario(id);
      const nextHistory = this.getState().scenarioHistory.filter(item => item.id !== id);
      const activeScenario = this.getState().activeScenario.id === id ? (nextHistory[0] ?? this.getState().activeScenario) : this.getState().activeScenario;
      this.patch({ scenarioHistory: nextHistory, activeScenario, error: null });
    } catch {
      this.patch({ error: 'No se pudo eliminar el escenario.' });
    }
  }

  async optimize(): Promise<void> {
    this.patch({ isOptimizing: true, error: null });
    try {
      const variants = await this.optimizationApi.optimize(this.getState().activePlot.id, this.getState().vpoParams);
      if (variants.length >= 2) this.patch({ variants, selectedVariant: variants[0], comparedVariants: [variants[0], variants[1]] });
    } catch {
      this.patch({ error: 'No se pudo ejecutar la optimizacion.' });
    } finally {
      this.patch({ isOptimizing: false });
    }
  }

  async askNormative(question: string, inputs?: readonly { input_id: string; name: string; mime_type: string; s3_uri: string }[]): Promise<void> {
    this.addChatMessage('user', question);
    try {
      const state = this.getState();
      const context: AiAskContext = {
        scenarioId: state.activeScenario.id,
        view: state.activeView,
        ...(state.activeView === 'bim' ? { ifc: staticIfcRef() } : {}),
        ...(inputs?.length ? { inputs } : {})
      };
      const reply = await this.aiApi.ask(question, context);
      this.addChatMessage('bot', reply.text, reply.citations);
    } catch (error) {
      // `state.error` has no renderer wired up anywhere in the current
      // templates, so a failed AgentCore call used to fail completely
      // silently from the user's point of view. Surface it inside the
      // chat itself instead, where the failure actually happened.
      this.addChatMessage('bot', 'No se pudo consultar a AVRA AI. Inténtalo de nuevo en unos segundos.');
      this.patch({ error: 'No se pudo consultar la normativa.' });
      console.error('askNormative failed', error);
    }
  }

  async generateArtifact(kind: ArtifactKind): Promise<string> {
    const id = `${kind}-${Date.now()}`;
    const variant = this.getState().selectedVariant;
    const pending = {
      id,
      kind,
      fileName: `${kind}-${variant.id}`,
      variantId: variant.id,
      status: 'generating' as const,
      created: new Date().toLocaleString(),
      preview: this.previewFor(kind, variant)
    };
    this.patch({ artifactHistory: [pending, ...this.getState().artifactHistory] });
    try {
      const artifact = await this.generateArtifactFromApi(kind, variant.id);
      this.patch({ artifactHistory: this.getState().artifactHistory.map(item => item.id === id ? { ...item, status: 'ready', fileName: artifact.fileName, downloadUrl: artifact.downloadUrl } : item) });
      return artifact.downloadUrl;
    } catch (error) {
      this.patch({ artifactHistory: this.getState().artifactHistory.map(item => item.id === id ? { ...item, status: 'failed' } : item), error: 'No se pudo generar el entregable.' });
      throw error;
    }
  }

  resetChat(): void {
    this.aiApi.resetConversation();
    this.patch({ chatMessages: [this.welcomeMessage(this.getState().activeView)] });
  }

  private welcomeMessage(view: ActiveView): AppState['chatMessages'][number] {
    return { sender: 'bot', text: welcomeForView(view), citations: [], timestamp: new Date().toLocaleTimeString() };
  }

  addChatMessage(sender: 'bot' | 'user', text: string, citations = [] as AppState['chatMessages'][number]['citations']): void {
    this.patch({ chatMessages: [...this.getState().chatMessages, { sender, text, citations, timestamp: new Date().toLocaleTimeString() }] });
  }

  private async loadWorkspace(): Promise<void> {
    try {
      const workspace = await this.workspaceApi.loadWorkspace();
      const activePlot = workspace.plots.find(item => item.id === workspace.activePlotId) ?? workspace.plots[0];
      const activeScenario = workspace.scenarios.find(item => item.id === workspace.activeScenarioId) ?? workspace.scenarios[0];
      const selectedVariant = workspace.variants[0];
      const comparedSecond = workspace.variants[1] ?? selectedVariant;
      if (!activePlot || !activeScenario || !selectedVariant) throw new Error('Incomplete workspace');
      this.patch({
        activePlot, plots: workspace.plots, activeScenario, scenarioHistory: workspace.scenarios,
        vpoParams: workspace.vpoParams, variants: workspace.variants, selectedVariant,
        comparedVariants: [selectedVariant, comparedSecond], error: null
      });
    } catch {
      this.patch({ error: 'No se pudo cargar el espacio de trabajo.' });
    }
  }

  private patch(change: Partial<AppState>): void {
    this.subject.next({ ...this.getState(), ...change });
  }

  private upsertScenario(scenario: Scenario): readonly Scenario[] {
    return [scenario, ...this.getState().scenarioHistory.filter(item => item.id !== scenario.id)];
  }

  private generateArtifactFromApi(kind: ArtifactKind, solutionId: string) {
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

  private createInitialState(): AppState {
    const placeholderPlot: Plot = {
      id: 'loading-plot', name: 'Loading plot', municipality: '', municipalityCode: '', cadastralRef: '', graphicAreaM2: 0,
      buildableAreaMaxM2: 0, maxHeightStories: 0, maxUnits: 0, climateZone: '', coordinates: [0, 0],
      geojson: { type: 'Polygon', coordinates: [] }, pgouZone: '', decreeLaw1_2025Applied: false
    };
    const placeholderVariant: Variant = {
      id: 'loading-variant', name: 'Loading variant', tag: '', tagClass: '', costPerUnit: 0, costPerM2: 0,
      primaryEnergyDemandKwh: 0, zebCompliancePct: 0, degreeIndustrialization: 0, repeatabilityIndex: 0,
      carbonFootprintKgCo2: 0, builtAreaM2: 0, usableAreaM2: 0, efficiencyRatio: 0, housingUnits: 0,
      stories: 0, facadeId: '', wetCoreId: '', structureId: '', hvacCentralized: false, breeamScore: 0, verdeScore: 0
    };
    const activeScenario: Scenario = {
      id: 'loading-scenario',
      name: 'Loading scenario',
      status: 'criteria_set',
      created: '', updated: '', plotId: placeholderPlot.id
    };
    return {
      activePlot: placeholderPlot,
      plots: [],
      activeScenario,
      scenarioHistory: [activeScenario],
      vpoParams: { maxHeightStories: 5, buildableAreaM2: 4165, targetUnits: 44 },
      variants: [],
      selectedVariant: placeholderVariant,
      comparedVariants: [placeholderVariant, placeholderVariant],
      artifactHistory: [],
      activeView: 'spatial',
      isOptimizing: false,
      isSaving: false,
      error: null,
      chatMessages: [this.welcomeMessage('spatial')]
    };
  }
}
