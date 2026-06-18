/** Treat missing `published` as visible; only explicit `false` hides from catalog. */
export const PUBLISHED_CATALOG_FILTER = { published: { $ne: false } as const };

export function catalogListFilter(
  publishedOnly = false,
): Record<string, unknown> {
  const filter: Record<string, unknown> = { deleted: false };
  if (publishedOnly) {
    Object.assign(filter, PUBLISHED_CATALOG_FILTER);
  }
  return filter;
}
