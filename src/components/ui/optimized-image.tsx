import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { 
  getOptimizedImageUrl, 
  generateSrcSet, 
  generateSizes,
  isSupabaseStorageUrl 
} from '@/lib/imageUtils';
import { Skeleton } from './skeleton';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4';
  sizes?: string;
  fallback?: string;
  showSkeleton?: boolean;
  onLoad?: () => void;
}

/**
 * Optimized image component with:
 * - Automatic WebP conversion for Supabase images
 * - Lazy loading with Intersection Observer
 * - Responsive srcset generation
 * - Skeleton placeholder during loading
 * - Error fallback handling
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  priority = false,
  aspectRatio = '1:1',
  sizes,
  fallback = '/placeholder.svg',
  showSkeleton = true,
  className,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Generate optimized URLs
  const isSupabase = src && isSupabaseStorageUrl(src);
  const optimizedSrc = hasError
    ? fallback
    : getOptimizedImageUrl(src, { width, height, quality });

  const srcSet = isSupabase && !hasError
    ? generateSrcSet(src, [320, 640, 960, 1280], { quality })
    : undefined;

  const defaultSizes = sizes || generateSizes({
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
  });

  // Aspect ratio styles
  const aspectRatioClass = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '3:4': 'aspect-[3/4]',
  }[aspectRatio];

  return (
    <div 
      ref={imgRef}
      className={cn('relative overflow-hidden', aspectRatioClass, className)}
    >
      {/* Skeleton placeholder */}
      {showSkeleton && !isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Image - only render when in view or priority */}
      {isInView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={srcSet ? defaultSizes : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
}
