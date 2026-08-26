import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/state/store.service';
import { GeoJsonPolygon, Plot } from '../../core/models/app.models';

@Component({
  selector: 'app-gis-viewer',
  template: `
    <div class="gis-shell">
      <div #mapContainer class="map-container"></div>
      <div class="gis-layout">
        <section class="gis-actions">
          <div class="panel-title">Seleccionar parcela</div>
          <div class="action-row">
            <label>
              Inventario
              <select [(ngModel)]="selectedPlotId" (change)="selectPlot(selectedPlotId)">
                <option *ngFor="let plot of inventoryPlots" [value]="plot.id">{{ plot.name }}</option>
              </select>
            </label>
            <button class="btn-secondary" type="button" (click)="selectPlot(selectedPlotId)">Seleccionar</button>
          </div>
          <div class="action-row">
            <input type="text" placeholder="Referencia catastral" [(ngModel)]="cadastralRef" />
            <button class="btn-secondary" type="button" (click)="searchByCadastralRef()">Buscar</button>
          </div>
          <div class="action-row file-row">
            <label class="file-upload">GeoJSON<input type="file" accept=".geojson,application/geo+json,.json" (change)="onGeoJsonSelected($event)" /></label>
            <label class="file-upload">CAD/DXF<input type="file" accept=".dxf,.dwg" (change)="onCadSelected($event)" /></label>
            <button class="btn-secondary" type="button" [class.active]="drawingMode" (click)="toggleDrawing()">{{ drawingMode ? 'Terminar dibujo' : 'Dibujar parcela' }}</button>
            <button class="btn-secondary" type="button" *ngIf="drawingPoints.length" (click)="clearDrawing()">Limpiar</button>
          </div>
          <div class="layer-row">
            <label><input type="checkbox" [(ngModel)]="showParcel" (change)="renderPlot(activePlot)"> Parcela</label>
            <label><input type="checkbox" [(ngModel)]="showEnvelope" (change)="renderPlot(activePlot)"> Envolvente</label>
            <label><input type="checkbox" [(ngModel)]="showCadLayer" (change)="renderPlot(activePlot)"> Superposición CAD</label>
          </div>
          <div *ngIf="importError" class="error-message">{{ importError }}</div>
        </section>

        <aside class="restriction-panel">
          <div class="panel-title">Datos de parcela</div>
          <dl>
            <div><dt>Municipio</dt><dd>{{ activePlot.municipality }}</dd></div>
            <div><dt>Zona PGOU</dt><dd>{{ activePlot.pgouZone }}</dd></div>
            <div><dt>Zona climática</dt><dd>{{ activePlot.climateZone || 'Pendiente de catálogo' }}</dd></div>
            <div><dt>Altura máx.</dt><dd>{{ activePlot.maxHeightStories }} plantas</dd></div>
            <div><dt>Edificabilidad</dt><dd>{{ activePlot.buildableAreaMaxM2 | number }} m²</dd></div>
            <div><dt>Viviendas máx.</dt><dd>{{ activePlot.maxUnits }}</dd></div>
            <div><dt>D.L. 1/2025</dt><dd>{{ activePlot.decreeLaw1_2025Applied ? 'Aplicado' : 'No aplicado' }}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; min-height: 0; }
    .gis-shell { position: relative; height: 100%; min-height: 0; overflow: hidden; }
    .map-container { position: absolute; inset: 0; border-radius: 10px; overflow: hidden; background: #e8eeec; }
    .gis-layout { position: absolute; z-index: 5; top: 12px; left: 12px; right: 12px; display: grid; grid-template-columns: minmax(0, 1.6fr) 300px; gap: 12px; pointer-events: none; }
    .gis-actions, .restriction-panel { pointer-events: auto; padding: 14px; border-radius: 10px; background: rgba(255,255,255,.96); border: 1px solid var(--color-border); box-shadow: var(--shadow); }
    .action-row, .layer-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 10px; }
    label { color: var(--color-muted); font-size: .86rem; }
    select, input[type="text"] { min-width: 220px; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--color-border); background: #fff; color: var(--color-text); }
    .file-upload { display: inline-flex; align-items: center; padding: 10px 12px; border-radius: 6px; background: var(--color-brand-100); color: var(--color-brand-800); cursor: pointer; font-weight: 600; }
    .file-upload input { display: none; }
    .btn-secondary.active { border-color: var(--color-brand-500); color: var(--color-brand-800); background: var(--color-brand-50); }
    .error-message { color: var(--color-error); margin-top: 10px; }
    .restriction-panel dl { display: grid; gap: 8px; margin: 10px 0 0; }
    .restriction-panel div { display: grid; grid-template-columns: 120px 1fr; gap: 10px; }
    .restriction-panel dt { color: var(--color-muted); }
    .restriction-panel dd { margin: 0; color: var(--color-text); }
    :host ::ng-deep .leaflet-top.leaflet-left { top: auto; bottom: 12px; }
    @media (max-width: 980px) { .gis-layout { grid-template-columns: 1fr; } }
  `]
})
export class GisViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) private mapContainerRef!: ElementRef<HTMLDivElement>;
  inventoryPlots = this.store.getPlots();
  activePlot = this.store.getState().activePlot;
  selectedPlotId = this.inventoryPlots.length ? this.inventoryPlots[0].id : '';
  cadastralRef = '';
  importError = '';
  showParcel = true;
  showEnvelope = true;
  showCadLayer = true;
  drawingMode = false;
  drawingPoints: L.LatLng[] = [];

  private map: L.Map | undefined;
  private parcelLayer: L.Layer | undefined;
  private envelopeLayer: L.Layer | undefined;
  private cadLayer: L.Layer | undefined;
  private drawingLayer: L.Polyline | undefined;
  private subscription: Subscription | undefined;
  private resizeObserver: ResizeObserver | undefined;

  constructor(private readonly store: StoreService) {}

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
    this.map.setView([lat, lng], 17);
    const coords = plot.geojson.coordinates[0].map(c => [c[1], c[0]] as [number, number]);
    if (this.showParcel) this.parcelLayer = L.polygon(coords, { color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.25 }).addTo(this.map);
    if (this.showEnvelope) this.envelopeLayer = L.polygon(coords.map(([plat, plng]) => [lat + (plat - lat) * 0.82, lng + (plng - lng) * 0.82] as [number, number]), { color: '#34d399', weight: 2, fillColor: '#34d399', fillOpacity: 0.4 }).addTo(this.map);
    if (this.showCadLayer) this.cadLayer = L.polyline(coords, { color: '#38bdf8', weight: 1, dashArray: '5 6' }).addTo(this.map);
    this.invalidateMapSize();
  }

  private initializeMap(plot: Plot): void {
    const [lat, lng] = plot.coordinates;
    this.map = L.map(this.mapContainerRef.nativeElement, { center: [lat, lng], zoom: 17, zoomControl: true });
    this.map.zoomControl.setPosition('bottomleft');
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(this.map);
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
