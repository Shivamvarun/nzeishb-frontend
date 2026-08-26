import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/state/store.service';
import { GeoJsonPolygon, Plot } from '../../core/models/app.models';

@Component({
  selector: 'app-gis-viewer',
  template: `
    <div class="gis-shell">
      <div class="gis-layout">
        <section class="gis-actions">
          <div class="panel-title">Parcel selection</div>
          <div class="action-row">
            <label>
              Inventory parcel
              <select [(ngModel)]="selectedPlotId" (change)="selectPlot(selectedPlotId)">
                <option *ngFor="let plot of inventoryPlots" [value]="plot.id">{{ plot.name }}</option>
              </select>
            </label>
            <button class="btn-secondary" type="button" (click)="selectPlot(selectedPlotId)">Select</button>
          </div>
          <div class="action-row">
            <input type="text" placeholder="Cadastral reference" [(ngModel)]="cadastralRef" />
            <button class="btn-secondary" type="button" (click)="searchByCadastralRef()">Search</button>
          </div>
          <div class="action-row file-row">
            <label class="file-upload">GeoJSON<input type="file" accept=".geojson,application/geo+json,.json" (change)="onGeoJsonSelected($event)" /></label>
            <label class="file-upload">CAD/DXF<input type="file" accept=".dxf,.dwg" (change)="onCadSelected($event)" /></label>
            <button class="btn-secondary" type="button" [class.active]="drawingMode" (click)="toggleDrawing()">{{ drawingMode ? 'Finish drawing' : 'Draw parcel' }}</button>
            <button class="btn-secondary" type="button" *ngIf="drawingPoints.length" (click)="clearDrawing()">Clear</button>
          </div>
          <div class="layer-row">
            <label><input type="checkbox" [(ngModel)]="showParcel" (change)="renderPlot(activePlot)"> Parcel</label>
            <label><input type="checkbox" [(ngModel)]="showEnvelope" (change)="renderPlot(activePlot)"> Buildable envelope</label>
            <label><input type="checkbox" [(ngModel)]="showCadLayer" (change)="renderPlot(activePlot)"> CAD overlay</label>
          </div>
          <div *ngIf="importError" class="error-message">{{ importError }}</div>
        </section>

        <aside class="restriction-panel">
          <div class="panel-title">Parcel restrictions</div>
          <dl>
            <div><dt>Municipality</dt><dd>{{ activePlot.municipality }}</dd></div>
            <div><dt>PGOU zone</dt><dd>{{ activePlot.pgouZone }}</dd></div>
            <div><dt>Climate zone</dt><dd>{{ activePlot.climateZone || 'Pending catalog' }}</dd></div>
            <div><dt>Max height</dt><dd>{{ activePlot.maxHeightStories }} floors</dd></div>
            <div><dt>Buildable area</dt><dd>{{ activePlot.buildableAreaMaxM2 | number }} m2</dd></div>
            <div><dt>Max dwellings</dt><dd>{{ activePlot.maxUnits }}</dd></div>
            <div><dt>Decree-Law 1/2025</dt><dd>{{ activePlot.decreeLaw1_2025Applied ? 'Applied' : 'Not applied' }}</dd></div>
          </dl>
        </aside>
      </div>
      <div #mapContainer class="map-container"></div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; min-height: 0; }
    .gis-shell { display: grid; grid-template-rows: auto minmax(420px, 1fr); gap: 14px; height: 100%; min-height: 0; overflow: hidden; }
    .gis-layout { position: relative; z-index: 5; display: grid; grid-template-columns: minmax(0, 1.6fr) 320px; gap: 14px; }
    .gis-actions, .restriction-panel { position: relative; z-index: 6; padding: 14px; border-radius: 8px; background: rgba(15, 23, 42, .98); border: 1px solid rgba(148, 163, 184, .12); }
    .action-row, .layer-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 10px; }
    label { color: #cbd5e1; font-size: .86rem; }
    select, input[type="text"] { min-width: 220px; padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(148, 163, 184, .18); background: rgba(2, 8, 23, .95); color: #e2e8f0; }
    .file-upload { display: inline-flex; align-items: center; padding: 10px 12px; border-radius: 6px; background: rgba(56, 189, 248, .12); color: #cfe8ff; cursor: pointer; }
    .file-upload input { display: none; }
    .btn-secondary.active { border-color: #38bdf8; color: #e0f2fe; }
    .error-message { color: #fb7185; margin-top: 10px; }
    .restriction-panel dl { display: grid; gap: 8px; margin: 10px 0 0; }
    .restriction-panel div { display: grid; grid-template-columns: 120px 1fr; gap: 10px; }
    .restriction-panel dt { color: #94a3b8; }
    .restriction-panel dd { margin: 0; color: #e2e8f0; }
    .map-container { position: relative; z-index: 1; width: 100%; height: 100%; min-height: 420px; border-radius: 8px; overflow: hidden; }
    @media (max-width: 980px) { .gis-shell { overflow-y: auto; } .gis-layout { grid-template-columns: 1fr; } .map-container { height: 540px; } }
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
