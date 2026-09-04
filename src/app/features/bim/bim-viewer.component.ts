import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STATIC_IFC } from '../../core/ai/static-ifc';
import { StoreService } from '../../core/state/store.service';
import { IfcModelService, IfcStoreyView, ParsedIfcModel } from './ifc-model.service';

interface BimElementInfo {
  id: string;
  type: string;
  floor: number | string | 'roof';
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
            <option *ngFor="let storey of storeys" [value]="storey.index">{{ storey.name }}</option>
          </select>
        </label>
        <button type="button" class="icon-btn" title="Reset camera" (click)="resetCamera()">Reset</button>
        <button type="button" class="icon-btn" [class.active]="sectionEnabled" title="Section cut" (click)="toggleSection()">Section</button>
        <button type="button" class="icon-btn" title="Switch projection" (click)="toggleProjection()">{{ useOrthographic ? 'Ortho' : 'Persp' }}</button>
        <button type="button" class="primary-btn" [disabled]="isGenerating" (click)="generateIfc()">{{ isGenerating ? 'Generating IFC…' : 'Generate IFC' }}</button>
      </div>
      <div class="generation-error" *ngIf="generationError">{{ generationError }}</div>
      <div class="bim-status" *ngIf="loadStatus" role="status" aria-live="polite">{{ loadStatus }}</div>
      <div #container class="bim-container" (click)="selectElement($event)"></div>
      <aside class="property-panel" *ngIf="selectedElement">
        <div class="panel-title">Element properties</div>
        <dl>
          <div><dt>ID</dt><dd>{{ selectedElement.id }}</dd></div>
          <div><dt>Type</dt><dd>{{ selectedElement.type }}</dd></div>
          <div><dt>Floor</dt><dd>{{ floorLabel(selectedElement.floor) }}</dd></div>
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
    .icon-btn.active { border-color: #087021; background: #f1f8f2; }
    .primary-btn { border: 1px solid #087021; border-radius: 5px; background: #087021; color: #fff; padding: 8px 10px; cursor: pointer; font-weight: 800; }
    .generation-error { position: absolute; z-index: 4; top: 70px; left: 14px; padding: 8px 10px; background: #fff4f2; color: #b42318; border: 1px solid #e0a4a0; border-radius: 4px; font-size: 11px; }
    .bim-status { position: absolute; z-index: 4; left: 50%; top: 50%; transform: translate(-50%, -50%); padding: 12px 16px; border-radius: 8px; background: rgba(255,255,255,.96); border: 1px solid #d9e2dc; color: #1f2937; font-size: .9rem; box-shadow: 0 8px 24px rgba(15, 23, 42, .08); }
    .property-panel { position: absolute; z-index: 3; top: 76px; right: 14px; width: min(280px, calc(100% - 28px)); padding: 14px; border-radius: 8px; background: rgba(255,255,255,.97); border: 1px solid #d9e2dc; color: #1f2937; }
    .property-panel dl { margin: 10px 0 0; display: grid; gap: 8px; }
    .property-panel div { display: grid; grid-template-columns: 76px 1fr; gap: 10px; }
    .property-panel dt { color: #64748b; }
    .property-panel dd { margin: 0; }
    .viewer-hint { position: absolute; right: 16px; bottom: 16px; left: auto; padding: 8px 10px; border-radius: 8px; color: #1f2937; background: rgba(255,255,255,.92); font-size: .8rem; pointer-events: none; }
    @media (max-width: 760px) { .bim-viewer { min-height: 620px; } .property-panel { top: auto; bottom: 54px; } }
  `]
})
export class BimViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) private containerRef!: ElementRef<HTMLDivElement>;

  storeys: IfcStoreyView[] = [];
  isolatedFloor: number | null = null;
  selectedElement: BimElementInfo | null = null;
  sectionEnabled = false;
  useOrthographic = false;
  isGenerating = false;
  generationError = '';
  loadStatus = `Loading ${STATIC_IFC.fileName}…`;

  private scene!: THREE.Scene;
  private perspectiveCamera!: THREE.PerspectiveCamera;
  private orthographicCamera!: THREE.OrthographicCamera;
  private camera!: THREE.Camera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private model: ParsedIfcModel | null = null;
  private grid: THREE.GridHelper | null = null;
  private selectable: THREE.Object3D[] = [];
  private sectionPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private animationFrameId: number | undefined;
  private selectedMesh: THREE.Mesh | null = null;
  private destroyed = false;
  private readonly onResize = () => this.resizeRenderer();

  get isolatedFloorLabel(): string {
    return this.isolatedFloor === null ? 'all' : String(this.isolatedFloor);
  }

  constructor(
    private readonly store: StoreService,
    private readonly ifcModels: IfcModelService
  ) {}

  ngAfterViewInit(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7fbf8);
    this.perspectiveCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    this.orthographicCamera = this.createOrthographicCamera(width, height, 40);
    this.camera = this.perspectiveCamera;
    this.camera.position.set(40, 30, 40);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.localClippingEnabled = true;
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 400;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    this.controls.target.set(0, 8, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(40, 80, 30);
    this.scene.add(dirLight);

    this.animate();
    window.addEventListener('resize', this.onResize);
    void this.attachModel();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    window.removeEventListener('resize', this.onResize);
    if (this.animationFrameId !== undefined) cancelAnimationFrame(this.animationFrameId);
    if (this.model) this.scene?.remove(this.model.root);
    this.controls?.dispose();
    this.renderer?.renderLists.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.domElement.remove();
  }

  setFloor(value: string): void {
    this.isolatedFloor = value === 'all' ? null : Number(value);
    this.applyFloorVisibility();
  }

  resetCamera(): void {
    this.frameBuilding();
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
    if (!this.renderer) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.selectable, false)[0];
    if (this.selectedMesh?.material instanceof THREE.MeshStandardMaterial) this.selectedMesh.material.emissive.setHex(0x000000);
    if (!hit) {
      this.selectedElement = null;
      this.selectedMesh = null;
      return;
    }
    this.selectedMesh = hit.object as THREE.Mesh;
    if (this.selectedMesh.material instanceof THREE.MeshStandardMaterial) this.selectedMesh.material.emissive.setHex(0x155e75);
    this.selectedElement = this.selectedMesh.userData as BimElementInfo;
  }

  floorLabel(floor: BimElementInfo['floor']): string {
    if (floor === 'roof') return 'Roof';
    return String(floor);
  }

  private async attachModel(): Promise<void> {
    try {
      const cached = this.ifcModels.getCached();
      if (!cached) this.loadStatus = `Loading ${STATIC_IFC.fileName}…`;
      const model = cached ?? await this.ifcModels.load(status => {
        if (!this.destroyed) this.loadStatus = status;
      });
      if (this.destroyed) return;
      this.model = model;
      this.storeys = model.storeys;
      this.selectable = model.selectable;
      for (const storey of this.storeys) storey.group.visible = true;
      this.scene.add(model.root);
      this.replaceGrid(model.footprint.width, model.footprint.depth);
      this.sectionPlane.constant = model.footprint.width * 0.18;
      this.applySectionState();
      this.frameBuilding();
      this.loadStatus = '';
    } catch (error) {
      console.error('Failed to load modelo.ifc', error);
      const detail = error instanceof Error && error.message ? error.message : '';
      if (!this.destroyed) this.loadStatus = detail ? `Could not load ${STATIC_IFC.fileName}. ${detail}` : `Could not load ${STATIC_IFC.fileName}.`;
    }
  }

  private applyFloorVisibility(): void {
    for (const storey of this.storeys) {
      storey.group.visible = this.isolatedFloor === null || storey.index === this.isolatedFloor;
    }
  }

  private applySectionState(): void {
    const planes = this.sectionEnabled ? [this.sectionPlane] : [];
    for (const material of this.model?.materials ?? []) {
      material.clippingPlanes = planes;
      material.needsUpdate = true;
    }
  }

  private replaceGrid(width: number, depth: number): void {
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.dispose();
    }
    const footprint = Math.max(width, depth, 20);
    const gridSize = Math.max(20, Math.ceil(footprint * 1.35 / 10) * 10);
    const divisions = Math.max(10, Math.round(gridSize / 4));
    this.grid = new THREE.GridHelper(gridSize, divisions, 0x087021, 0xd9e2dc);
    this.grid.position.y = 0;
    this.scene.add(this.grid);
  }

  private frameBuilding(): void {
    if (!this.model) return;
    const box = new THREE.Box3().setFromObject(this.model.root, true);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const footprint = Math.max(size.x, size.z, 12);
    const height = Math.max(size.y, 4);
    const front = detectFrontDirection(this.model.root, box);
    const left = new THREE.Vector3(0, 1, 0).cross(front).normalize();
    const yaw = THREE.MathUtils.degToRad(38);
    const view = front.clone().multiplyScalar(Math.cos(yaw)).add(left.multiplyScalar(Math.sin(yaw))).normalize();
    const elevation = THREE.MathUtils.degToRad(26);
    const horizDist = Math.max(footprint, height) * 1.45;
    const cameraY = Math.max(center.y * 0.25 + horizDist * Math.tan(elevation), height * 0.55, 6);
    this.controls.minDistance = Math.max(2, footprint * 0.08);
    this.controls.maxDistance = Math.max(footprint * 8, height * 8, 80);
    this.perspectiveCamera.near = Math.max(0.05, footprint / 1000);
    this.perspectiveCamera.far = Math.max(footprint * 20, height * 20, 500);
    this.camera.position.set(
      center.x + view.x * horizDist,
      cameraY,
      center.z + view.z * horizDist
    );
    this.controls.target.copy(new THREE.Vector3(center.x, Math.max(height * 0.38, 2), center.z));
    this.controls.minPolarAngle = 0.18;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.08;
    this.controls.update();
    if (this.useOrthographic) {
      const width = this.renderer.domElement.clientWidth;
      const heightPx = this.renderer.domElement.clientHeight;
      this.orthographicCamera = this.createOrthographicCamera(width, heightPx, Math.max(footprint, height) * 0.7);
      this.orthographicCamera.position.copy(this.camera.position);
      this.camera = this.orthographicCamera;
      this.controls.object = this.camera;
    }
    this.camera.lookAt(this.controls.target);
    if (this.camera instanceof THREE.PerspectiveCamera || this.camera instanceof THREE.OrthographicCamera) {
      this.camera.updateProjectionMatrix();
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private resizeRenderer(): void {
    const container = this.renderer?.domElement.parentElement;
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();
    const span = this.model ? Math.max(this.model.footprint.width, this.model.footprint.depth, this.model.footprint.height) : 40;
    this.orthographicCamera = this.createOrthographicCamera(width, height, span * 0.7);
    if (this.useOrthographic) {
      this.camera = this.orthographicCamera;
      this.controls.object = this.camera;
      this.resetCamera();
    }
    this.renderer.setSize(width, height, false);
  }

  private createOrthographicCamera(width: number, height: number, size: number): THREE.OrthographicCamera {
    const aspect = width / Math.max(height, 1);
    return new THREE.OrthographicCamera(-size * aspect, size * aspect, size, -size, 0.5, 8000);
  }
}

function detectFrontDirection(root: THREE.Object3D, box: THREE.Box3): THREE.Vector3 {
  const center = box.getCenter(new THREE.Vector3());
  const hint = new THREE.Vector3();
  root.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const type = String(mesh.userData?.type ?? '');
    let weight = 0;
    if (/stair|ramp/i.test(type)) weight = 10;
    else if (/door/i.test(type)) weight = 6;
    else if (/railing|member/i.test(type)) weight = 2;
    else if (/window|opening|curtain/i.test(type)) weight = 1;
    if (!weight) return;
    const point = new THREE.Box3().setFromObject(mesh, true).getCenter(new THREE.Vector3());
    hint.x += (point.x - center.x) * weight;
    hint.z += (point.z - center.z) * weight;
  });
  hint.y = 0;
  if (hint.lengthSq() > 1e-6) return hint.normalize();
  const size = box.getSize(new THREE.Vector3());
  return size.z >= size.x ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
}
