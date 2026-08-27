import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/state/store.service';
import { Variant } from '../../core/models/app.models';

interface BimElementInfo {
  id: string;
  type: string;
  floor: number | 'roof';
  areaM2: number;
  material: string;
}

@Component({
  selector: 'app-bim-viewer',
  template: `
    <div class="bim-viewer">
      <div class="bim-toolbar" role="toolbar" aria-label="BIM viewer controls">
        <label>
          Floor
          <select [ngModel]="isolatedFloorLabel" (ngModelChange)="setFloor($event)">
            <option value="all">All</option>
            <option *ngFor="let floor of floors" [value]="floor">Floor {{ floor + 1 }}</option>
          </select>
        </label>
        <button type="button" class="icon-btn" title="Reset camera" (click)="resetCamera()">Reset</button>
        <button type="button" class="icon-btn" [class.active]="sectionEnabled" title="Section cut" (click)="toggleSection()">Section</button>
        <button type="button" class="icon-btn" title="Switch projection" (click)="toggleProjection()">{{ useOrthographic ? 'Ortho' : 'Persp' }}</button>
        <button type="button" class="primary-btn" [disabled]="isGenerating" (click)="generateIfc()">{{ isGenerating ? 'Generating IFC…' : 'Generate IFC' }}</button>
      </div>
      <div class="generation-error" *ngIf="generationError">{{ generationError }}</div>
      <div #container class="bim-container" (click)="selectElement($event)"></div>
      <aside class="property-panel" *ngIf="selectedElement">
        <div class="panel-title">Element properties</div>
        <dl>
          <div><dt>ID</dt><dd>{{ selectedElement.id }}</dd></div>
          <div><dt>Type</dt><dd>{{ selectedElement.type }}</dd></div>
          <div><dt>Floor</dt><dd>{{ selectedElement.floor === 'roof' ? 'Roof' : selectedElement.floor + 1 }}</dd></div>
          <div><dt>Area</dt><dd>{{ selectedElement.areaM2 }} m2</dd></div>
          <div><dt>Material</dt><dd>{{ selectedElement.material }}</dd></div>
        </dl>
      </aside>
      <div class="viewer-hint">Drag rotate | wheel zoom | right button pan</div>
    </div>
  `,
  styles: [`
    .bim-viewer { position: relative; width: 100%; height: 100%; min-height: 520px; }
    .bim-container { width: 100%; height: 100%; border-radius: 8px; overflow: hidden; background: #f7fbf8; }
    .bim-toolbar { position: absolute; z-index: 3; top: 14px; left: 14px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 8px; border-radius: 8px; background: rgba(255,255,255,.96); border: 1px solid #d9e2dc; }
    .bim-toolbar label { display: inline-flex; gap: 8px; align-items: center; color: #1f2937; font-size: .78rem; }
    .bim-toolbar select { border: 1px solid rgba(148, 163, 184, .24); border-radius: 6px; background: #fff; color: #1f2937; padding: 7px 8px; }
    .icon-btn { border: 1px solid rgba(148, 163, 184, .22); border-radius: 6px; background: #fff; color: #1f2937; padding: 8px 10px; cursor: pointer; }
    .icon-btn.active { border-color: #087021; background: #f1f8f2; }.primary-btn{border:1px solid #087021;border-radius:5px;background:#087021;color:#fff;padding:8px 10px;cursor:pointer;font-weight:800}.generation-error{position:absolute;z-index:4;top:70px;left:14px;padding:8px 10px;background:#fff4f2;color:#b42318;border:1px solid #e0a4a0;border-radius:4px;font-size:11px}
    .property-panel { position: absolute; z-index: 3; top: 76px; right: 14px; width: min(280px, calc(100% - 28px)); padding: 14px; border-radius: 8px; background: rgba(255,255,255,.97); border: 1px solid #d9e2dc; color: #1f2937; }
    .property-panel dl { margin: 10px 0 0; display: grid; gap: 8px; }
    .property-panel div { display: grid; grid-template-columns: 76px 1fr; gap: 10px; }
    .property-panel dt { color: #64748b; }
    .property-panel dd { margin: 0; }
    .viewer-hint { position: absolute; left: 16px; bottom: 16px; padding: 8px 10px; border-radius: 8px; color: #1f2937; background: rgba(255,255,255,.92); font-size: .8rem; pointer-events: none; }
    @media (max-width: 760px) { .bim-viewer { min-height: 620px; } .property-panel { top: auto; bottom: 54px; } }
  `]
})
export class BimViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) private containerRef!: ElementRef<HTMLDivElement>;

  floors: number[] = [];
  isolatedFloor: number | null = null;
  selectedElement: BimElementInfo | null = null;
  sectionEnabled = false;
  useOrthographic = false;
  isGenerating = false;
  generationError = '';

  private scene!: THREE.Scene;
  private perspectiveCamera!: THREE.PerspectiveCamera;
  private orthographicCamera!: THREE.OrthographicCamera;
  private camera!: THREE.Camera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private buildingGroup = new THREE.Group();
  private selectable: THREE.Object3D[] = [];
  private sectionPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private animationFrameId: number | undefined;
  private subscription: Subscription | undefined;
  private currentVariant!: Variant;
  private selectedMesh: THREE.Mesh | null = null;
  private readonly onResize = () => this.resizeRenderer();

  get isolatedFloorLabel(): string {
    return this.isolatedFloor === null ? 'all' : String(this.isolatedFloor);
  }

  constructor(private readonly store: StoreService) {}

  ngAfterViewInit(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7fbf8);
    this.perspectiveCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.orthographicCamera = this.createOrthographicCamera(width, height);
    this.camera = this.perspectiveCamera;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.localClippingEnabled = true;
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 12;
    this.controls.maxDistance = 220;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(30, 50, 20);
    this.scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(100, 50, 0x087021, 0xd9e2dc);
    gridHelper.position.y = -0.05;
    this.scene.add(gridHelper);
    this.scene.add(this.buildingGroup);

    this.subscription = this.store.state$.subscribe(current => {
      if (this.currentVariant?.id !== current.selectedVariant.id) {
        this.renderBuilding(current.selectedVariant);
      }
    });
    this.renderBuilding(this.store.getState().selectedVariant);
    this.animate();
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    if (this.animationFrameId !== undefined) cancelAnimationFrame(this.animationFrameId);
    this.subscription?.unsubscribe();
    this.controls?.dispose();
    this.renderer?.renderLists.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.domElement.remove();
  }

  setFloor(value: string): void {
    this.isolatedFloor = value === 'all' ? null : Number(value);
    if (this.currentVariant) this.renderBuilding(this.currentVariant);
  }

  resetCamera(): void {
    if (this.currentVariant) this.frameBuilding(this.currentVariant);
  }

  async generateIfc(): Promise<void> {
    const variant = this.store.getState().selectedVariant;
    if (!variant || variant.id === 'loading-variant' || this.isGenerating) return;
    this.isGenerating = true;
    this.generationError = '';
    try {
      const url = await this.store.generateArtifact('ifc');
      const item = this.store.getState().artifactHistory.find(artifact => artifact.kind === 'ifc' && artifact.variantId === variant.id && artifact.downloadUrl === url);
      const fileName = item?.fileName ?? `ifc-${variant.id}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    } catch {
      this.generationError = 'No se pudo generar el IFC.';
    } finally {
      this.isGenerating = false;
    }
  }

  toggleSection(): void {
    this.sectionEnabled = !this.sectionEnabled;
    this.applySectionState();
  }

  toggleProjection(): void {
    this.useOrthographic = !this.useOrthographic;
    const oldPosition = this.camera.position.clone();
    this.camera = this.useOrthographic ? this.orthographicCamera : this.perspectiveCamera;
    this.camera.position.copy(oldPosition);
    this.controls.object = this.camera;
    this.resetCamera();
  }

  selectElement(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.selectable, false)[0];
    this.selectedMesh?.material instanceof THREE.MeshStandardMaterial && this.selectedMesh.material.emissive.setHex(0x000000);
    if (!hit) {
      this.selectedElement = null;
      this.selectedMesh = null;
      return;
    }
    this.selectedMesh = hit.object as THREE.Mesh;
    if (this.selectedMesh.material instanceof THREE.MeshStandardMaterial) this.selectedMesh.material.emissive.setHex(0x155e75);
    this.selectedElement = this.selectedMesh.userData as BimElementInfo;
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private renderBuilding(variant: Variant): void {
    this.currentVariant = variant;
    this.selectedElement = null;
    this.selectedMesh = null;
    this.selectable = [];
    this.buildingGroup.clear();

    const stories = variant.stories || 4;
    this.floors = Array.from({ length: stories }, (_, index) => index);
    const unitsPerFloor = Math.ceil((variant.housingUnits || 44) / stories);
    const floorHeight = 3.2;
    const unitWidth = 7;
    const unitDepth = 10;
    const blockLength = unitsPerFloor * unitWidth;
    const facadeColor = variant.facadeId === 'FAC-WOOD-03' ? 0xd97706 : 0x10b981;
    const clippingPlanes = this.sectionEnabled ? [this.sectionPlane] : [];

    for (let floor = 0; floor < stories; floor++) {
      if (this.isolatedFloor !== null && this.isolatedFloor !== floor) continue;
      const floorGroup = new THREE.Group();
      floorGroup.position.y = floor * floorHeight;

      const slab = this.createBox(blockLength + 0.6, 0.3, unitDepth + 0.6, 0x334155, clippingPlanes);
      slab.position.y = 0.15;
      slab.userData = { id: `SLAB-F${floor + 1}`, type: 'Structural slab', floor, areaM2: Math.round(blockLength * unitDepth), material: variant.structureId };
      floorGroup.add(slab);
      this.selectable.push(slab);

      for (let unit = 0; unit < unitsPerFloor; unit++) {
        const posX = -blockLength / 2 + (unit + 0.5) * unitWidth;
        const cell = this.createBox(unitWidth - 0.2, floorHeight - 0.4, unitDepth - 0.2, facadeColor, clippingPlanes, 0.88);
        cell.position.set(posX, floorHeight / 2, 0);
        cell.userData = { id: `DWELL-F${floor + 1}-${unit + 1}`, type: 'Housing module', floor, areaM2: Math.round(unitWidth * unitDepth), material: variant.facadeId };
        floorGroup.add(cell);
        this.selectable.push(cell);
      }
      this.buildingGroup.add(floorGroup);
    }

    if (this.isolatedFloor === null) {
      const pv = this.createBox(blockLength * 0.8, 0.1, unitDepth * 0.7, 0x1e293b, clippingPlanes);
      pv.position.set(0, stories * floorHeight + 0.2, 0);
      pv.userData = { id: 'ROOF-PV-01', type: 'PV roof array', floor: 'roof', areaM2: Math.round(blockLength * unitDepth * 0.56), material: 'Photovoltaic panels' };
      this.buildingGroup.add(pv);
      this.selectable.push(pv);
    }

    this.sectionPlane.constant = blockLength * 0.18;
    this.frameBuilding(variant);
  }

  private createBox(width: number, height: number, depth: number, color: number, clippingPlanes: THREE.Plane[], opacity = 1): THREE.Mesh {
    return new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.08, transparent: opacity < 1, opacity, clippingPlanes })
    );
  }

  private frameBuilding(variant: Variant): void {
    const stories = variant.stories || 4;
    const unitsPerFloor = Math.ceil((variant.housingUnits || 44) / stories);
    const blockLength = unitsPerFloor * 7;
    const target = new THREE.Vector3(0, stories * 3.2 / 2, 0);
    this.camera.position.set(blockLength * 0.9, stories * 3.2 * 1.15, blockLength * 0.85);
    this.camera.lookAt(target);
    this.controls.target.copy(target);
    this.controls.update();
    this.camera.updateProjectionMatrix();
  }

  private applySectionState(): void {
    this.buildingGroup.traverse(child => {
      const mesh = child as THREE.Mesh;
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.clippingPlanes = this.sectionEnabled ? [this.sectionPlane] : [];
        mesh.material.needsUpdate = true;
      }
    });
  }

  private resizeRenderer(): void {
    const container = this.renderer?.domElement.parentElement;
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();
    this.orthographicCamera = this.createOrthographicCamera(width, height);
    if (this.useOrthographic) {
      this.camera = this.orthographicCamera;
      this.controls.object = this.camera;
      this.resetCamera();
    }
    this.renderer.setSize(width, height, false);
  }

  private createOrthographicCamera(width: number, height: number): THREE.OrthographicCamera {
    const aspect = width / Math.max(height, 1);
    const size = 34;
    return new THREE.OrthographicCamera(-size * aspect, size * aspect, size, -size, 0.1, 1000);
  }
}
