import { STATIC_IFC } from '../../core/ai/static-ifc';

const DB_NAME = 'nzeishb-ifc-cache';
const STORE_NAME = 'ifc-files';
const DB_VERSION = 1;
const HEADER_TIMEOUT_MS = 4000;

export type IfcBytesSource = 'indexeddb' | 'https' | 'asset';

export interface LoadedIfcBytes {
  readonly buffer: ArrayBuffer;
  readonly source: IfcBytesSource;
}

export async function loadStaticIfcBytes(
  onStatus: (status: string) => void
): Promise<LoadedIfcBytes> {
  onStatus(`Checking cached ${STATIC_IFC.fileName}…`);
  const cached = await readCachedIfc().catch(() => null);
  if (cached && isIfcBuffer(cached)) {
    onStatus(`Loading ${STATIC_IFC.fileName} from cache…`);
    return { buffer: cached, source: 'indexeddb' };
  }

  const fromHttps = await downloadFromHttps(onStatus);
  if (fromHttps) {
    onStatus(`Saving ${STATIC_IFC.fileName} locally…`);
    await persistIfc(fromHttps).catch(() => undefined);
    return { buffer: fromHttps, source: 'https' };
  }

  onStatus(`Loading ${STATIC_IFC.fileName} from app assets…`);
  const assetUrl = `${window.location.origin}/${STATIC_IFC.assetUrl}`.replace(/([^:]\/)\/+/g, '$1');
  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw new Error(`Could not load ${STATIC_IFC.fileName} from ${assetUrl}`);
  }
  const fromAsset = await response.arrayBuffer();
  if (!isIfcBuffer(fromAsset)) {
    throw new Error(`${STATIC_IFC.fileName} from ${assetUrl} is not a valid IFC file`);
  }
  onStatus(`Saving ${STATIC_IFC.fileName} locally…`);
  await persistIfc(fromAsset).catch(() => undefined);
  return { buffer: fromAsset, source: 'asset' };
}

async function downloadFromHttps(onStatus: (status: string) => void): Promise<ArrayBuffer | null> {
  for (const url of STATIC_IFC.viewerHttpsUrls) {
    onStatus(`Downloading ${STATIC_IFC.fileName}…`);
    const buffer = await fetchIfcIfReachable(url);
    if (buffer && isIfcBuffer(buffer)) return buffer;
  }
  return null;
}

/** Browser fetch cannot use s3://. Abort if response headers do not arrive quickly (CORS / dead host). */
async function fetchIfcIfReachable(url: string): Promise<ArrayBuffer | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), HEADER_TIMEOUT_MS);
  try {
    const response = await fetch(url, { mode: 'cors', signal: controller.signal });
    window.clearTimeout(timer);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    window.clearTimeout(timer);
    return null;
  }
}

function isIfcBuffer(buffer: ArrayBuffer): boolean {
  if (!buffer || buffer.byteLength < 16) return false;
  const head = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buffer, 0, Math.min(80, buffer.byteLength)));
  return head.includes('ISO-10303-21') || /ISO-10303/i.test(head);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCachedIfc(): Promise<ArrayBuffer | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(STATIC_IFC.fileName);
    request.onsuccess = () => {
      const value = request.result as ArrayBuffer | Blob | undefined;
      if (!value) {
        resolve(null);
        return;
      }
      if (value instanceof Blob) {
        void value.arrayBuffer().then(resolve, reject);
        return;
      }
      resolve(value);
    };
    request.onerror = () => reject(request.error);
  });
}

async function persistIfc(buffer: ArrayBuffer): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db
      .transaction(STORE_NAME, 'readwrite')
      .objectStore(STORE_NAME)
      .put(new Blob([buffer], { type: 'application/x-step' }), STATIC_IFC.fileName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
