import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  placeholder?: string;
  threshold?: number;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallback = '/signchain/placeholder.svg',
  placeholder = '/signchain/placeholder.svg',
  threshold = 0.1,
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const currentImg = imgRef.current;
    if (!currentImg) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(currentImg);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
  };

  return (
    <div className={`lazy-image-container ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !imageError && (
        <img
          src={placeholder}
          alt={alt}
          className="lazy-image-placeholder"
          style={{
            filter: 'blur(5px)',
            transition: 'opacity 0.3s ease',
            opacity: isInView ? 0.5 : 1
          }}
          {...props}
        />
      )}
      
      {/* Actual Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageError ? fallback : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className="lazy-image-actual"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            position: isLoaded ? 'static' : 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
