import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// 컴포넌트별 Lazy Loading 설정
export const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
export const LazyContract = lazy(() => import('@/pages/Contract'));
export const LazyApproval = lazy(() => import('@/pages/Approval'));
export const LazyDID = lazy(() => import('@/pages/DID'));
export const LazyFiles = lazy(() => import('@/pages/Files'));
export const LazySecurity = lazy(() => import('@/pages/Security'));
export const LazyApiDocs = lazy(() => import('@/pages/ApiDocs'));

// 로딩 스피너 컴포넌트
export function LoadingSpinner({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// 에러 바운더리 컴포넌트
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class LazyComponentErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive">
              컴포넌트 로딩 실패
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              페이지를 새로고침해주세요
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC: Lazy Loading Wrapper
export function withLazyLoading<T extends React.ComponentType<any>>(
  LazyComponent: React.LazyExoticComponent<T>,
  loadingMessage?: string
) {
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyComponentErrorBoundary>
        <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyComponentErrorBoundary>
    );
  };
}

// 이미지 레이지 로딩 훅
export function useImageLazyLoading() {
  React.useEffect(() => {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              img.classList.add('fade-in');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));

      return () => imageObserver.disconnect();
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach((img) => {
        const src = img.getAttribute('data-src');
        if (src) {
          (img as HTMLImageElement).src = src;
          img.removeAttribute('data-src');
        }
      });
    }
  }, []);
}

// 레이지 로딩 이미지 컴포넌트
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholderSrc?: string;
  alt: string;
}

export function LazyImage({ 
  src, 
  placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNEMyMCAxNCAxNyAxOSAxNyAxOUMxNyAxOSAyMCAxNCAyNCAxNEMyOCAxNCAzMiAxOCAzMiAyMlYyOEMzMiAzMiAyOCAzNiAyNCAzNkgxNkMxMiAzNiA4IDMyIDggMjhWMjJDOCAxOCAxMiAxNCAxNiAxNFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K',
  alt,
  className = '',
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgElement = entry.target as HTMLImageElement;
            imgElement.src = src;
            observer.unobserve(imgElement);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={placeholderSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      onLoad={() => setIsLoaded(true)}
      onError={() => setError(true)}
      {...props}
    />
  );
}
