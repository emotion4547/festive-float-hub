/**
 * Image optimization utilities using Supabase Storage Transform API
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */

const SUPABASE_PROJECT_ID = 'edzhahcogyhamcwkqszp';
const SUPABASE_STORAGE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1`;

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Check if URL is from Supabase storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage');
}

/**
 * Transform Supabase storage URL to optimized version
 * Supports WebP/AVIF conversion and resizing
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: ImageTransformOptions = {}
): string {
  if (!url) return '/placeholder.svg';
  
  // Default options for optimal performance
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options;

  // Only transform Supabase storage URLs
  if (!isSupabaseStorageUrl(url)) {
    return url;
  }

  // Extract bucket and path from URL
  // Format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return url;

  const [, bucket, path] = match;

  // Build transform URL
  const params = new URLSearchParams();
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  params.set('format', format);
  params.set('resize', resize);

  return `${SUPABASE_STORAGE_URL}/render/image/public/${bucket}/${path}?${params.toString()}`;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  url: string | null | undefined,
  sizes: number[] = [320, 640, 960, 1280],
  options: Omit<ImageTransformOptions, 'width'> = {}
): string {
  if (!url || !isSupabaseStorageUrl(url)) {
    return '';
  }

  return sizes
    .map(size => `${getOptimizedImageUrl(url, { ...options, width: size })} ${size}w`)
    .join(', ');
}

/**
 * Generate sizes attribute based on common breakpoints
 */
export function generateSizes(config: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  default?: string;
} = {}): string {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw',
    default: defaultSize = '100vw',
  } = config;

  return [
    `(max-width: 640px) ${mobile}`,
    `(max-width: 1024px) ${tablet}`,
    `(max-width: 1280px) ${desktop}`,
    defaultSize,
  ].join(', ');
}

/**
 * Preload critical image
 */
export function preloadImage(url: string, options?: ImageTransformOptions): void {
  if (typeof document === 'undefined') return;
  
  const optimizedUrl = getOptimizedImageUrl(url, options);
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;
  link.type = options?.format === 'avif' ? 'image/avif' : 'image/webp';
  document.head.appendChild(link);
}

/**
 * Calculate aspect ratio padding for skeleton loaders
 */
export function getAspectRatioPadding(aspectRatio: '1:1' | '4:3' | '16:9' | '3:4' = '1:1'): string {
  const ratios: Record<string, string> = {
    '1:1': '100%',
    '4:3': '75%',
    '16:9': '56.25%',
    '3:4': '133.33%',
  };
  return ratios[aspectRatio] || '100%';
}
