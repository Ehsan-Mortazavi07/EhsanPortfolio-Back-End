import { unlink } from 'fs/promises';
import { join } from 'path';

const UPLOADS_PREFIX = '/uploads/';
const UPLOAD_SRC_RE = /(?:src|href)=["'](\/uploads\/[^"']+)["']/gi;

export function isManagedUpload(path: string | null | undefined): boolean {
  if (!path) return false;
  const normalized = path.trim();
  return (
    normalized.startsWith(UPLOADS_PREFIX) && !normalized.includes('..')
  );
}

export function managedUploadToDisk(path: string): string {
  const name = path.replace(/^\/uploads\//, '');
  return join(process.cwd(), 'public', 'uploads', name);
}

export function normalizeMediaRef(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value.trim();
}

export async function deleteManagedUpload(
  path: string | null | undefined,
): Promise<void> {
  if (!isManagedUpload(path)) return;
  try {
    await unlink(managedUploadToDisk(path!.trim()));
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') throw err;
  }
}

export async function deleteManagedUploads(
  paths: Iterable<string | null | undefined>,
): Promise<void> {
  await Promise.all([...paths].map((path) => deleteManagedUpload(path)));
}

export async function deleteReplacedManagedUpload(
  oldPath: string | null | undefined,
  newPath: string | null | undefined,
): Promise<void> {
  const oldVal = normalizeMediaRef(oldPath);
  const newVal = normalizeMediaRef(newPath);
  if (oldVal && oldVal !== newVal) {
    await deleteManagedUpload(oldVal);
  }
}

export function extractManagedUploadsFromHtml(
  html: string | null | undefined,
): string[] {
  if (!html) return [];
  const found = new Set<string>();
  for (const match of html.matchAll(UPLOAD_SRC_RE)) {
    if (isManagedUpload(match[1])) found.add(match[1]);
  }
  return [...found];
}

export async function deleteHtmlUploadDiff(
  oldHtml: string | null | undefined,
  newHtml: string | null | undefined,
): Promise<void> {
  const oldPaths = new Set(extractManagedUploadsFromHtml(oldHtml));
  const newPaths = new Set(extractManagedUploadsFromHtml(newHtml));
  const toDelete = [...oldPaths].filter((path) => !newPaths.has(path));
  await deleteManagedUploads(toDelete);
}
