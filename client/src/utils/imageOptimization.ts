/**
 * Image optimization utilities for performance enhancement
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Convert image to WebP format for better compression
 */
export const convertToWebP = async (
  imageFile: File | string, 
  options: ImageOptimizationOptions = {}
): Promise<string> => {
  const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options;
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate optimal dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and convert
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP
      const webpDataUrl = canvas.toDataURL('image/webp', quality);
      resolve(webpDataUrl);
    };
    
    img.onerror = reject;
    
    if (typeof imageFile === 'string') {
      img.src = imageFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageFile);
    }
  });
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (baseUrl: string, sizes: number[]): string => {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string, as: 'image' = 'image'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = src;
    
    link.onload = () => resolve();
    link.onerror = reject;
    
    document.head.appendChild(link);
  });
};

/**
 * Lazy load image with intersection observer
 */
export const lazyLoadImage = (
  img: HTMLImageElement, 
  src: string, 
  options: IntersectionObserverInit = {}
): void => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          target.src = src;
          target.classList.remove('lazy');
          observer.unobserve(target);
        }
      });
    },
    { threshold: 0.1, ...options }
  );
  
  observer.observe(img);
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalFormat = (): 'webp' | 'jpeg' => {
  const canvas = document.createElement('canvas');
  const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  return webpSupported ? 'webp' : 'jpeg';
};

/**
 * Create responsive image component props
 */
export const createResponsiveImageProps = (
  src: string,
  alt: string,
  sizes?: string
) => {
  const format = getOptimalFormat();
  const baseSrc = src.replace(/\.[^.]+$/, '');
  
  return {
    src: `${baseSrc}.${format}`,
    srcSet: generateSrcSet(baseSrc, [320, 640, 960, 1280, 1920]),
    sizes: sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const
  };
};
