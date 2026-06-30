/**
 * Real-life material imagery — bundled locally in `public/products/`.
 *
 * These are real photographs of each material (cement bags, steel rebar, bricks,
 * sand/balu, gravel/gitti, tiles, paint, pipes, wire) downloaded from Wikimedia
 * Commons, so they load fast, work offline, and always show the correct content.
 * If a file is ever missing, <ProductImage> shows a graceful icon fallback.
 */

// How many images exist per material key (files: /products/<key>-<n>.jpg).
const COUNTS: Record<string, number> = {
  cement: 3,
  steel: 3,
  bricks: 3,
  sand: 1,
  gravel: 3,
  tiles: 3,
  paint: 2,
  pipes: 3,
  wire: 2,
}

function pool(key: string): string[] {
  const n = COUNTS[key] ?? 1
  return Array.from({ length: n }, (_, i) => `/products/${key}-${i + 1}.jpg`)
}

/** Category id → image key. */
const CATEGORY_KEY: Record<string, string> = {
  cat_cement: 'cement',
  cat_steel: 'steel',
  cat_bricks: 'bricks',
  cat_aggregates: 'sand',
  cat_tiles: 'tiles',
  cat_paint: 'paint',
  cat_plumbing: 'pipes',
  cat_electrical: 'wire',
}

/** Per-product overrides (e.g. gitti/gravel vs balu/sand within aggregates). */
const PRODUCT_KEY: Record<string, string> = {
  p_agg_river_sand: 'sand',
  p_agg_msand: 'sand',
  p_agg_20mm: 'gravel',
  p_agg_gravel: 'gravel',
}

/** Returns the real material photos for a product (main + alternates). */
export function productImages(productId: string, categoryId: string, _index?: number): string[] {
  const key = PRODUCT_KEY[productId] ?? CATEGORY_KEY[categoryId] ?? 'cement'
  return pool(key)
}

/** Attractive hero / banner photo of a real construction site (bundled locally). */
export const HERO_IMAGE = '/products/hero.jpg'
