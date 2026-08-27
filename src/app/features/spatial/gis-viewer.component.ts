import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/state/store.service';
import { GeoJsonPolygon, Plot } from '../../core/models/app.models';
import { SPATIAL_CONTEXT_API, SpatialContextApiPort } from '../../core/api/spatial/spatial-context-api.port';
import { SpatialContextSnapshot } from '../../core/api/spatial/spatial-context-api.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-gis-viewer',
  template: `
    <div class="gis-shell">
      <div #mapContainer class="map-container" [class.map-hidden]="mapMode === '3d'"></div>
      <div class="spatial-3d-preview" [class.visible]="mapMode === '3d'" aria-label="3D spatial mock preview">
        <div class="spatial-3d-header"><strong>3D spatial preview</strong><span>PoC mock geometry · SpatialContext-ready</span><button type="button" class="context-button" (click)="loadSpatialContext()">{{ contextLoading ? 'Loading…' : 'SpatialContext' }}</button></div>
        <svg viewBox="0 0 900 560" preserveAspectRatio="xMidYMid meet">
          <polygon class="site-plane" points="130,405 450,300 770,405 450,515" />
          <polygon class="envelope-plane" points="210,380 450,300 690,380 450,460" />
          <g class="mock-building">
            <polygon points="280,335 450,280 620,335 450,390" />
            <polygon points="280,335 450,390 450,390 280,335" />
            <polygon points="450,390 620,335 620,430 450,485" />
            <polygon points="280,335 450,390 450,485 280,430" />
            <g *ngFor="let floor of mockFloors; let i = index">
              <line x1="285" [attr.y1]="350 + i * 28" x2="445" [attr.y2]="402 + i * 28" class="floor-line" />
              <line x1="455" [attr.y1]="402 + i * 28" x2="615" [attr.y2]="350 + i * 28" class="floor-line" />
            </g>
          </g>
          <text x="55" y="70" class="spatial-axis-label">Height ↑</text>
          <text x="690" y="490" class="spatial-axis-label">Site / envelope</text>
        </svg>
        <div class="spatial-3d-hint">Drag-style preview · use 3D rotation control to indicate the interactive renderer boundary.</div>
        <aside class="context-panel" *ngIf="spatialContext">
          <div class="context-panel-head"><strong>SpatialContext</strong><button type="button" (click)="spatialContext=null" aria-label="Close SpatialContext">×</button></div>
          <span class="context-mock" *ngIf="spatialContext.isMock">MOCK DATA</span>
          <dl>
            <div><dt>ID</dt><dd>{{ spatialContext.contextId }}</dd></div>
            <div><dt>Version</dt><dd>{{ spatialContext.version }}</dd></div>
            <div><dt>CRS</dt><dd>{{ spatialContext.crs }}</dd></div>
            <div><dt>Buildable area</dt><dd>{{ spatialContext.planning.buildableAreaM2 | number }} m²</dd></div>
            <div><dt>Hard constraints</dt><dd>{{ spatialContext.hardConstraints.length }}</dd></div>
          </dl>
          <small>Provenance is shown as returned by the context adapter.</small>
        </aside>
      </div>

      <div class="map-building-card" [class.collapsed]="buildingCardCollapsed">
        <div class="building-card-head">
          <strong>Building data</strong>
          <button type="button" class="icon-button" title="{{ buildingCardCollapsed ? 'Expand' : 'Collapse' }}" [attr.aria-label]="buildingCardCollapsed ? 'Expand building data' : 'Collapse building data'" (click)="buildingCardCollapsed = !buildingCardCollapsed">
            <img [src]="buildingCardCollapsed ? iconPaths.expand : iconPaths.collapse" alt="">
          </button>
        </div>
        <ng-container *ngIf="!buildingCardCollapsed">
          <span>{{ activePlot.name }}</span>
          <button type="button" class="map-link" (click)="showPlanningDialog = true">GIS & planning data</button>
        </ng-container>
      </div>

      <div class="map-tools" aria-label="Map tools">
        <button type="button" title="Zoom in" aria-label="Zoom in" (click)="zoomIn()">+</button>
        <button type="button" title="Zoom out" aria-label="Zoom out" (click)="zoomOut()">−</button>
        <button type="button" title="Fit parcel" aria-label="Fit parcel" (click)="renderPlot(activePlot)">□</button>
        <button type="button" title="Edit parcel" aria-label="Edit parcel" [class.active]="drawingMode" (click)="toggleDrawing()">
          <img [src]="iconPaths.edit" alt="">
        </button>
        <button type="button" title="Delete drawing" aria-label="Delete drawing" (click)="clearDrawing()">
          <img [src]="iconPaths.delete" alt="">
        </button>
        <button type="button" title="2D map" aria-label="2D map" [class.active]="mapMode === '2d'" (click)="setMapMode('2d')">
          <img [src]="iconPaths.twoD" alt="">
        </button>
        <button type="button" title="3D spatial view" aria-label="3D spatial view" [class.active]="mapMode === '3d'" (click)="setMapMode('3d')">
          <img [src]="iconPaths.rotation" alt="">
        </button>
        <button type="button" title="Rotate 3D preview" aria-label="Rotate 3D preview" [class.active]="rotationMode" (click)="toggleRotationMode()">↻</button>
        <button type="button" title="Fullscreen map" aria-label="Fullscreen map" (click)="toggleFullscreen()">
          <img [src]="iconPaths.expand" alt="">
        </button>
      </div>

      <div class="map-tool-note" *ngIf="rotationMode">3D rotation mode selected. This is a mock renderer boundary for the PoC; replace it with the Spatial viewer adapter when the backend/viewer contract is confirmed.</div>

      <div class="map-bottom-actions">
        <label class="map-action">GeoJSON<input type="file" accept=".geojson,application/geo+json,.json" (change)="onGeoJsonSelected($event)" /></label>
        <label class="map-action">CAD / DXF<input type="file" accept=".dxf,.dwg" (change)="onCadSelected($event)" /></label>
        <button type="button" class="map-action" [class.active]="showLayerDrawer" (click)="showLayerDrawer=!showLayerDrawer">Layers</button>
      </div>

      <aside class="layer-drawer" *ngIf="showLayerDrawer" aria-label="Layer catalogue">
        <div class="layer-drawer-header"><strong>Layers</strong><button type="button" (click)="showLayerDrawer=false" aria-label="Close layers">×</button></div>
        <div class="layer-group" *ngFor="let group of layerGroups">
          <button type="button" class="layer-group-title" (click)="toggleLayerGroup(group.name)">
            <span>{{ isLayerGroupCollapsed(group.name) ? '▸' : '▾' }} {{ group.name }}</span>
            <span class="layer-count" *ngIf="activeLayerCount(group) > 0">{{ activeLayerCount(group) }}</span>
          </button>
          <small class="layer-group-hint" *ngIf="!isLayerGroupCollapsed(group.name)">{{ group.hint }}</small>
          <ng-container *ngIf="!isLayerGroupCollapsed(group.name)">
          <div class="layer-row" *ngFor="let layer of group.layers">
            <span class="layer-swatch" [style.background]="layer.swatch"></span>
            <span class="layer-copy"><strong>{{ layer.name }}</strong><small>{{ layer.source }}</small></span>
            <input type="checkbox" [checked]="isLayerVisible(layer.id)" [disabled]="!layer.available" (change)="setLayerVisible(layer.id, $any($event.target).checked)" />
          </div>
          </ng-container>
        </div>
      </aside>

      <div class="planning-backdrop" *ngIf="showPlanningDialog" (click)="showPlanningDialog=false">
        <section class="planning-dialog" role="dialog" aria-modal="true" aria-label="GIS and planning data" (click)="$event.stopPropagation()">
          <div class="stepper">
            <div class="step done"><span>✓</span><small>Select an area</small></div>
            <div class="step active"><span>2</span><small>GIS & planning data</small></div>
            <div class="step"><span>3</span><small>Optimal volume</small></div>
          </div>
          <div class="planning-content">
            <div class="planning-stats">
              <p><b>Maximum permitted buildable area:</b> {{ activePlot.buildableAreaMaxM2 | number }} m²</p>
              <p><b>Occupation:</b> {{ occupation | number }} m²</p>
              <p><b>Maximum permitted height:</b> {{ activePlot.maxHeightStories * 4 }} m</p>
            </div>
            <div class="planning-fields">
              <label>Target dwellings<input type="number" [ngModel]="store.getState().vpoParams.targetUnits" (ngModelChange)="store.updateVPOParams({targetUnits: $event})"></label>
              <label>Buildable area<input type="number" [ngModel]="store.getState().vpoParams.buildableAreaM2" (ngModelChange)="store.updateVPOParams({buildableAreaM2: $event})"></label>
              <label>Max height<input type="number" [ngModel]="store.getState().vpoParams.maxHeightStories" (ngModelChange)="store.updateVPOParams({maxHeightStories: $event})"></label>
            </div>
            <h3>Urban planning data:</h3>
            <ul><li>Setbacks</li><li>Boundaries</li><li>Local planning regulations</li></ul>
            <h3>Typologies <span>Recommended by AI</span></h3>
            <div class="typology-grid">
              <button *ngFor="let type of typologies" type="button" [class.selected]="selectedTypology === type" (click)="selectedTypology=type">
                <strong>{{ type }}</strong><span class="typology-sketch" [class.u-shape]="type === 'U-shaped'"></span><small *ngIf="type === 'U-shaped'">AI recommendation</small>
              </button>
            </div>
            <div class="planning-actions"><button type="button" class="btn-secondary" (click)="showPlanningDialog=false">Close</button><button type="button" class="btn-primary" (click)="acceptPlanning()">Accept & continue</button></div>
          </div>
        </section>
      </div>

      <div class="map-error" *ngIf="importError">{{ importError }}</div>
    </div>
  `,
  styles: [`
    :host{display:block;height:100%;min-height:0}.gis-shell{position:relative;width:100%;height:100%;min-height:520px;overflow:hidden;background:#e9eee9}.map-container{position:absolute;inset:0;z-index:1}.map-building-card{position:absolute;top:14px;left:16px;z-index:20;background:#fff;border:1px solid #d9e2dc;border-radius:5px;padding:12px 14px;min-width:245px;box-shadow:0 2px 7px rgba(0,0,0,.12);display:grid;gap:4px}.map-building-card strong{font-size:14px}.building-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.map-building-card.collapsed{min-width:180px}.icon-button{width:24px;height:24px;border:0;background:#fff;display:grid;place-items:center;cursor:pointer;padding:0}.icon-button img,.map-tools img{width:18px;height:18px;object-fit:contain}.map-tools button.active{background:#f7fbf8;border-left:2px solid #087021}.map-building-card span{font-size:10px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.map-link{justify-self:start;border:0;background:#fff;color:#1f2937;padding:0;text-decoration:underline;cursor:pointer}.map-tools{position:absolute;top:92px;left:16px;z-index:20;display:grid;gap:2px;background:#fff;border:1px solid #d9e2dc;border-radius:4px;overflow:hidden;box-shadow:0 2px 7px rgba(0,0,0,.12)}.map-tools button,.map-tools label{width:42px;height:42px;display:grid;place-items:center;border:0;background:#fff;color:#1f2937;cursor:pointer;font-size:22px}.map-tools button:hover{background:#f7fbf8}.map-tools label{font-size:18px}.map-tools input{display:none}.map-bottom-actions{position:absolute;right:16px;bottom:16px;z-index:20;display:flex;gap:6px}.map-action{background:#fff;border:1px solid #d9e2dc;border-radius:4px;color:#087021;padding:9px 12px;font-size:11px;font-weight:800;cursor:pointer;box-shadow:0 2px 7px rgba(0,0,0,.08)}.map-action input{display:none}.map-action.active{background:#f1f8f2;border-color:#087021}.planning-backdrop{position:absolute;inset:0;z-index:50;background:rgba(15,23,42,.10);display:grid;place-items:center;padding:20px}.planning-dialog{width:min(760px,calc(100% - 20px));max-height:calc(100% - 30px);overflow:auto;background:#fff;border:1px solid #d9e2dc;box-shadow:0 10px 35px rgba(15,23,42,.22);border-radius:5px}.stepper{display:grid;grid-template-columns:1fr 1fr 1fr;padding:18px 26px 12px;border-bottom:1px solid #e5ebe7}.step{position:relative;text-align:center;color:#a4b0a7;font-weight:700;font-size:11px}.step:before{content:"";position:absolute;left:50%;right:-50%;top:10px;height:2px;background:#dce6df}.step:last-child:before{display:none}.step span{position:relative;z-index:1;display:grid;place-items:center;width:20px;height:20px;margin:0 auto 7px;border-radius:50%;border:2px solid #c7d5cc;background:#fff;color:#9aaa9f}.step.done span,.step.active span{border-color:#087021;color:#087021}.step.done span{background:#fff}.step.active small,.step.done small{color:#087021}.planning-content{padding:18px 24px 20px}.planning-stats p{margin:0 0 14px}.planning-fields{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0 18px}.planning-fields label{display:grid;gap:5px;font-size:11px;font-weight:700;color:#475569}.planning-fields input{border:1px solid #cfdad2;padding:8px;border-radius:3px}.planning-content h3{font-size:13px;margin:16px 0 8px}.planning-content h3 span{float:right;color:#6b1fa5;font-size:10px}.planning-content ul{margin:0 0 16px;padding-left:20px;color:#334155}.typology-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.typology-grid button{min-height:132px;text-align:left;background:#fff;border:1px solid #d9e2dc;border-radius:5px;padding:10px;cursor:pointer;position:relative}.typology-grid button.selected{border:2px solid #6b1fa5}.typology-grid strong{display:block;font-size:12px}.typology-sketch{display:block;height:65px;margin-top:8px;border:1px solid #aab5ad;transform:skew(-25deg) rotate(-35deg);width:48px;margin-left:25px;box-shadow:8px 8px 0 -7px #fff,8px 8px 0 -6px #aab5ad}.typology-sketch.u-shape{width:55px;border-right-color:transparent;border-bottom-color:transparent;transform:skew(-25deg) rotate(-35deg)}.typology-grid small{position:absolute;bottom:8px;left:10px;color:#6b1fa5;font-weight:800}.planning-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.layer-drawer{position:absolute;top:14px;right:16px;bottom:62px;width:min(330px,calc(100% - 32px));z-index:40;background:#fff;border:1px solid #d9e2dc;border-radius:5px;box-shadow:0 6px 24px rgba(0,0,0,.16);overflow:auto}.layer-drawer-header{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #e5ebe7}.layer-drawer-header button{border:0;background:transparent;font-size:20px;cursor:pointer}.layer-group{padding:10px 12px;border-bottom:1px solid #eef2ef}.layer-group-title{width:100%;display:flex;justify-content:space-between;align-items:center;border:0;background:transparent;text-align:left;font-size:11px;font-weight:800;color:#087021;margin-bottom:4px;padding:0;cursor:pointer}.layer-count{min-width:18px;height:18px;border-radius:9px;background:#c4ddca;color:#087021;display:grid;place-items:center;font-size:9px}.layer-group-hint{display:block;color:#64748b;font-size:9px;line-height:1.35;margin-bottom:5px}.layer-row{display:flex;align-items:center;gap:8px;padding:7px 2px}.layer-swatch{width:12px;height:12px;border-radius:2px;border:1px solid rgba(0,0,0,.15);flex:none}.layer-copy{display:grid;gap:2px;min-width:0;flex:1}.layer-copy strong{font-size:11px;font-weight:700}.layer-copy small{font-size:9px;color:#64748b}.layer-row input{accent-color:#087021}.map-tool-note{position:absolute;left:16px;top:380px;z-index:25;max-width:280px;padding:8px 10px;background:#fff;border:1px solid #c4ddca;color:#35553d;border-radius:4px;font-size:10px;box-shadow:0 2px 7px rgba(0,0,0,.08)}.map-error{position:absolute;left:50%;bottom:70px;transform:translateX(-50%);z-index:70;background:#fff4f2;color:#b42318;border:1px solid #e0a4a0;padding:8px 12px;border-radius:4px;font-size:11px}.map-container.map-hidden{visibility:hidden}.spatial-3d-preview{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,#f8fbf9,#eef5f0);visibility:hidden;opacity:0;pointer-events:none;transition:none}.spatial-3d-preview.visible{visibility:visible;opacity:1;pointer-events:auto}.spatial-3d-header{position:absolute;left:18px;top:18px;z-index:2;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #d9e2dc;border-radius:5px;padding:10px 12px;box-shadow:0 2px 7px rgba(0,0,0,.08)}.spatial-3d-header strong{font-size:13px}.spatial-3d-header span{font-size:10px;color:#64748b}.context-button{margin-left:4px;border:1px solid #087021;background:#fff;color:#087021;border-radius:4px;padding:6px 8px;font-size:10px;font-weight:800;cursor:pointer}.context-panel{position:absolute;right:18px;top:18px;width:min(340px,calc(100% - 36px));z-index:5;background:#fff;border:1px solid #d9e2dc;border-radius:6px;box-shadow:0 8px 28px rgba(0,0,0,.14);padding:14px}.context-panel-head{display:flex;justify-content:space-between;align-items:center}.context-panel-head button{border:0;background:transparent;font-size:20px;cursor:pointer}.context-mock{display:inline-block;margin-top:8px;padding:4px 6px;border-radius:3px;background:#fffdf4;border:1px solid #eadca8;color:#67551b;font-size:9px;font-weight:800}.context-panel dl{display:grid;gap:7px;margin:12px 0}.context-panel dl div{display:grid;grid-template-columns:100px 1fr;gap:8px;font-size:10px}.context-panel dt{color:#64748b}.context-panel dd{margin:0;color:#1f2937}.context-panel>small{color:#64748b;font-size:9px}.spatial-3d-preview svg{display:block;width:100%;height:100%}.site-plane{fill:#e5eee7;stroke:#b8cdbd;stroke-width:2}.envelope-plane{fill:#c4ddca;fill-opacity:.55;stroke:#087021;stroke-width:2;stroke-dasharray:8 6}.mock-building polygon{fill:#fff;stroke:#087021;stroke-width:2}.mock-building polygon:nth-child(1){fill:#d9e9dc}.mock-building polygon:nth-child(4){fill:#eef6ef}.floor-line{stroke:#6e9b7a;stroke-width:1.2;opacity:.7}.spatial-axis-label{fill:#334155;font-size:15px;font-weight:700}.spatial-3d-hint{position:absolute;left:18px;bottom:18px;background:#fff;border:1px solid #d9e2dc;border-radius:5px;padding:9px 11px;color:#64748b;font-size:10px}@media(max-width:760px){.planning-fields{grid-template-columns:1fr}.typology-grid{grid-template-columns:1fr 1fr}.map-building-card{left:10px;top:10px}.map-tools{left:10px;top:90px}.map-bottom-actions{right:10px;bottom:10px}.planning-backdrop{padding:8px}}
  `]
})
export class GisViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) private mapContainerRef!: ElementRef<HTMLDivElement>;
  inventoryPlots = this.store.getPlots();
  activePlot = this.store.getState().activePlot;
  selectedPlotId = this.inventoryPlots.length ? this.inventoryPlots[0].id : '';
  cadastralRef = '';
  importError = '';
  showPlanningDialog = false;
  selectedTypology = 'U-shaped';
  readonly typologies = ['Linear', 'Corner', 'U-shaped', 'Closed block'];
  readonly layerGroups = [
    { name: 'Land / cadastre', hint: 'Parcel identity and land-bank information', layers: [
      { id: 'vpo', name: 'VPO-eligible parcels', source: 'Spatial', swatch: '#087021', available: true },
      { id: 'cadastre', name: 'Cadastral parcels', source: 'Catastro', swatch: '#6b1fa5', available: true }
    ] },
    { name: 'Urban system', hint: 'Population, blocks, buildings and green areas', layers: [
      { id: 'populations', name: 'Populations', source: 'DERA 07', swatch: '#94a3b8', available: false },
      { id: 'blocks', name: 'Urban blocks', source: 'DERA 07', swatch: '#64748b', available: false },
      { id: 'buildings', name: 'Buildings', source: 'DERA 07', swatch: '#a1a1aa', available: false },
      { id: 'green', name: 'Green areas', source: 'DERA 07', swatch: '#7ab678', available: false }
    ] },
    { name: 'Heritage', hint: 'Protected cultural assets and perimeters', layers: [
      { id: 'heritage', name: 'BIC / UNESCO protection', source: 'CGPHA', swatch: '#b45309', available: false }
    ] },
    { name: 'Mobility', hint: 'Transport, stations and cycle infrastructure', layers: [
      { id: 'mobility', name: 'Transport and communications', source: 'DERA 09', swatch: '#0284c7', available: false },
      { id: 'cycle', name: 'Cycle lanes', source: 'IDEAndalucía', swatch: '#0ea5e9', available: false }
    ] },
    { name: 'Services', hint: 'Amenities used for proximity evidence', layers: [
      { id: 'services', name: 'Services and amenities', source: 'DERA 12', swatch: '#14b8a6', available: false }
    ] },
    { name: 'Nature', hint: 'Natura 2000, protected nature and vegetation', layers: [
      { id: 'nature', name: 'Natura 2000 / protected areas', source: 'MITECO / Andalucía', swatch: '#16a34a', available: false },
      { id: 'ndvi', name: 'Vegetation / NDVI', source: 'Spatial', swatch: '#65a30d', available: false }
    ] },
    { name: 'Climate hazards', hint: 'Climate exposure and hazard information', layers: [
      { id: 'hazards', name: 'Climate hazards', source: 'Spatial / AdapteCCa', swatch: '#f59e0b', available: false }
    ] },
    { name: 'Climate change', hint: 'Time-indexed climate-change scenarios', layers: [
      { id: 'climate-change', name: 'AdapteCCa climate-change grid', source: 'AdapteCCa', swatch: '#dc2626', available: false }
    ] }
  ];
  showParcel = true;
  showEnvelope = true;
  showCadLayer = false;
  showLayerDrawer = false;
  private readonly collapsedLayerGroups = new Set<string>([
    'Land / cadastre',
    'Urban system',
    'Heritage',
    'Mobility',
    'Services',
    'Nature',
    'Climate hazards',
    'Climate change'
  ]);
  drawingMode = false;
  buildingCardCollapsed = false;
  rotationMode = false;
  mapMode: '2d' | '3d' = '2d';
  readonly iconPaths = {
    twoD: 'assets/arva-icons/2d.png',
    rotation: 'assets/arva-icons/3d_rotation.png',
    collapse: 'assets/arva-icons/collapse_content.png',
    expand: 'assets/arva-icons/expand_content.png',
    delete: 'assets/arva-icons/delete.png',
    edit: 'assets/arva-icons/edit_square.png'
  };
  drawingPoints: L.LatLng[] = [];
  spatialContext: SpatialContextSnapshot | null = null;
  contextLoading = false;
  get mockFloors(): number[] { return Array.from({ length: Math.max(3, Math.min(6, this.store.getState().vpoParams.maxHeightStories || 4)) }, (_, i) => i); }

  private map: L.Map | undefined;
  private parcelLayer: L.Layer | undefined;
  private envelopeLayer: L.Layer | undefined;
  private cadLayer: L.Layer | undefined;
  private drawingLayer: L.Polyline | undefined;
  private subscription: Subscription | undefined;
  private resizeObserver: ResizeObserver | undefined;

  constructor(public readonly store: StoreService, @Inject(SPATIAL_CONTEXT_API) private readonly spatialContextApi: SpatialContextApiPort) {}

  ngAfterViewInit(): void {
    this.subscription = this.store.state$.subscribe(current => {
      this.inventoryPlots = current.plots;
      this.activePlot = current.activePlot;
      this.selectedPlotId = current.activePlot.id;
      if (!this.isRenderablePlot(current.activePlot)) return;
      if (!this.map) this.initializeMap(current.activePlot);
      else this.renderPlot(current.activePlot);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.map?.remove();
    this.map = undefined;
  }

  get occupation(): number { return Math.round(this.activePlot.graphicAreaM2 * 0.82); }

  toggleLayerGroup(name: string): void {
    if (this.collapsedLayerGroups.has(name)) this.collapsedLayerGroups.delete(name);
    else this.collapsedLayerGroups.add(name);
  }

  isLayerGroupCollapsed(name: string): boolean { return this.collapsedLayerGroups.has(name); }

  activeLayerCount(group: { layers: readonly { id: string }[] }): number {
    return group.layers.filter(layer => this.isLayerVisible(layer.id)).length;
  }

  isLayerVisible(id: string): boolean {
    if (id === 'vpo') return this.showEnvelope;
    if (id === 'cadastre') return this.showParcel;
    return false;
  }

  setLayerVisible(id: string, visible: boolean): void {
    if (id === 'vpo') this.showEnvelope = visible;
    if (id === 'cadastre') this.showParcel = visible;
    this.renderPlot(this.activePlot);
  }

  zoomIn(): void { this.map?.zoomIn(); }

  zoomOut(): void { this.map?.zoomOut(); }

  setMapMode(mode: '2d' | '3d'): void {
    this.mapMode = mode;
    if (mode === '2d') this.rotationMode = false;
    this.invalidateMapSize();
  }

  toggleRotationMode(): void {
    this.rotationMode = !this.rotationMode;
  }

  async toggleFullscreen(): Promise<void> {
    const element = this.mapContainerRef.nativeElement.parentElement;
    if (!element) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (element.requestFullscreen) {
      await element.requestFullscreen();
      this.invalidateMapSize();
    }
  }

  acceptPlanning(): void {
    this.showPlanningDialog = false;
    this.store.setActiveView('optimization');
  }


  async loadSpatialContext(): Promise<void> {
    if (this.contextLoading) return;
    this.contextLoading = true;
    try {
      this.spatialContext = await this.spatialContextApi.getContext(this.activePlot.id, this.store.getState().activeScenario.id);
    } catch {
      this.importError = 'SpatialContext gateway route is not available yet.';
    } finally {
      this.contextLoading = false;
    }
  }

  selectPlot(plotId: string): void {
    const selected = this.store.getPlotById(plotId);
    if (selected) {
      this.store.setActivePlot(selected);
      this.cadastralRef = selected.cadastralRef || '';
      this.importError = '';
    }
  }

  async searchByCadastralRef(): Promise<void> {
    const reference = this.cadastralRef.trim();
    if (!reference) {
      this.importError = 'Enter a valid cadastral reference.';
      return;
    }
    try {
      const found = await this.store.findAndSelectPlot(reference);
      this.importError = found ? '' : 'No parcel found with that reference.';
    } catch {
      this.importError = 'Cadastral search is temporarily unavailable.';
    }
  }

  onGeoJsonSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const geometry = this.extractGeoJsonGeometry(JSON.parse(reader.result as string));
        if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates?.length) throw new Error('Invalid geometry');
        this.addImportedGeometry(file.name, geometry);
      } catch {
        this.importError = 'Could not import the file. A simple Polygon GeoJSON is expected.';
      }
    };
    reader.readAsText(file);
  }

  onCadSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importError = `${file.name} is attached as a CAD/DXF overlay placeholder. Backend CAD parsing can replace this with real geometry.`;
    this.showCadLayer = true;
    this.renderPlot(this.activePlot);
  }

  toggleDrawing(): void {
    if (this.drawingMode && this.drawingPoints.length >= 3) {
      const ring = [...this.drawingPoints, this.drawingPoints[0]].map(point => [point.lng, point.lat]);
      this.addImportedGeometry('Manual parcel', { type: 'Polygon', coordinates: [ring] });
      this.clearDrawing();
    }
    this.drawingMode = !this.drawingMode;
  }

  clearDrawing(): void {
    this.drawingPoints = [];
    if (this.drawingLayer && this.map) this.map.removeLayer(this.drawingLayer);
    this.drawingLayer = undefined;
  }

  private onMapClick(latlng: L.LatLng): void {
    if (this.drawingMode) {
      this.drawingPoints = [...this.drawingPoints, latlng];
      if (this.drawingLayer && this.map) this.map.removeLayer(this.drawingLayer);
      this.drawingLayer = L.polyline(this.drawingPoints, { color: '#facc15', weight: 3 }).addTo(this.map!);
      return;
    }
    if (!this.parcelLayer) return;
    const latlngs = ((this.parcelLayer as L.Polygon).getLatLngs() as L.LatLng[][])[0];
    if (this.isPointInPolygon(latlng, latlngs)) this.store.setActivePlot(this.activePlot);
  }

  private addImportedGeometry(name: string, geometry: GeoJsonPolygon): void {
    const plot: Plot = {
      id: `IMPORTED-${Date.now()}`,
      name,
      cadastralRef: 'IMPORTED',
      coordinates: [geometry.coordinates[0][0][1], geometry.coordinates[0][0][0]],
      geojson: geometry,
      municipality: 'Imported',
      municipalityCode: '',
      graphicAreaM2: 0,
      buildableAreaMaxM2: 0,
      maxHeightStories: 0,
      maxUnits: 0,
      climateZone: '',
      pgouZone: 'Imported',
      decreeLaw1_2025Applied: false
    };
    this.store.addPlot(plot);
    this.importError = '';
  }

  private extractGeoJsonGeometry(json: unknown): GeoJsonPolygon | null {
    const item = json as { type?: string; features?: { geometry?: GeoJsonPolygon }[]; geometry?: GeoJsonPolygon; coordinates?: number[][][] };
    if (item.type === 'FeatureCollection' && item.features?.length) return item.features[0].geometry ?? null;
    if (item.type === 'Feature' && item.geometry) return item.geometry;
    if (item.type === 'Polygon') return item as GeoJsonPolygon;
    return null;
  }

  private isPointInPolygon(point: L.LatLng, polygon: L.LatLng[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      const intersect = ((yi > point.lng) !== (yj > point.lng)) && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  renderPlot(plot: Plot): void {
    if (!this.map || !this.isRenderablePlot(plot)) return;
    [this.parcelLayer, this.envelopeLayer, this.cadLayer].forEach(layer => layer && this.map?.removeLayer(layer));
    this.parcelLayer = this.envelopeLayer = this.cadLayer = undefined;

    const [lat, lng] = plot.coordinates;
    this.map.setView([lat, lng] as L.LatLngTuple, 17);
    const coords = plot.geojson.coordinates[0].map(c => [c[1], c[0]] as [number, number]);
    if (this.showParcel) this.parcelLayer = L.polygon(coords, { color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.25 }).addTo(this.map);
    if (this.showEnvelope) this.envelopeLayer = L.polygon(coords.map(([plat, plng]) => [lat + (plat - lat) * 0.82, lng + (plng - lng) * 0.82] as [number, number]), { color: '#34d399', weight: 2, fillColor: '#34d399', fillOpacity: 0.4 }).addTo(this.map);
    if (this.showCadLayer) this.cadLayer = L.polyline(coords, { color: '#38bdf8', weight: 1, dashArray: '5 6' }).addTo(this.map);
    this.invalidateMapSize();
  }

  private initializeMap(plot: Plot): void {
    const [lat, lng] = plot.coordinates;
    this.map = L.map(this.mapContainerRef.nativeElement, { center: [lat, lng] as L.LatLngTuple, zoom: 17, zoomControl: true });
    L.tileLayer(environment.mapTileUrl, { maxZoom: 19, attribution: environment.mapAttribution }).addTo(this.map);
    this.map.on('click', event => this.onMapClick(event.latlng));
    this.resizeObserver = new ResizeObserver(() => this.invalidateMapSize());
    this.resizeObserver.observe(this.mapContainerRef.nativeElement);
    this.renderPlot(plot);
  }

  private invalidateMapSize(): void {
    requestAnimationFrame(() => this.map?.invalidateSize({ pan: false, animate: false }));
  }

  private isRenderablePlot(plot: Plot): boolean {
    return plot.id !== 'loading-plot' && plot.geojson.coordinates[0]?.length >= 3;
  }
}
