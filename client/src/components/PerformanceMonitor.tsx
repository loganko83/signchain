import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay  
  CLS?: number; // Cumulative Layout Shift
  
  // Other metrics
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
  loadTime?: number;
  domContentLoaded?: number;
  
  // Resource metrics
  jsSize?: number;
  cssSize?: number;
  imageCount?: number;
  
  // Runtime metrics
  memoryUsage?: number;
  connectionType?: string;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  logToConsole?: boolean;
  showOverlay?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  logToConsole = true,
  showOverlay = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const newMetrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        TTFB: navigation.responseStart - navigation.requestStart,
        FCP: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
      };

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.memoryUsage = memory.usedJSHeapSize / 1048576; // MB
      }

      // Connection info
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        newMetrics.connectionType = connection?.effectiveType || 'unknown';
      }

      // Resource metrics
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      const imageResources = resources.filter(r => 
        r.name.includes('.jpg') || r.name.includes('.png') || 
        r.name.includes('.svg') || r.name.includes('.webp')
      );

      newMetrics.jsSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024; // KB
      newMetrics.cssSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024; // KB
      newMetrics.imageCount = imageResources.length;

      setMetrics(newMetrics);
      
      if (logToConsole) {
        console.group('🔍 Performance Metrics');
        console.table(newMetrics);
        console.groupEnd();
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Core Web Vitals (if supported)
    if ('web-vitals' in window) {
      // This would require importing web-vitals library
      // For now, we'll use a simple placeholder
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, [enabled, logToConsole]);

  if (!enabled || !showOverlay) return null;

  const formatMetric = (value: number | undefined, unit: string) => {
    return value ? `${value.toFixed(2)}${unit}` : 'N/A';
  };

  const getScoreColor = (metric: string, value: number | undefined): string => {
    if (!value) return 'text-gray-500';
    
    switch (metric) {
      case 'LCP':
        return value <= 2500 ? 'text-green-500' : value <= 4000 ? 'text-yellow-500' : 'text-red-500';
      case 'FID':
        return value <= 100 ? 'text-green-500' : value <= 300 ? 'text-yellow-500' : 'text-red-500';
      case 'CLS':
        return value <= 0.1 ? 'text-green-500' : value <= 0.25 ? 'text-yellow-500' : 'text-red-500';
      case 'FCP':
        return value <= 1800 ? 'text-green-500' : value <= 3000 ? 'text-yellow-500' : 'text-red-500';
      case 'TTFB':
        return value <= 800 ? 'text-green-500' : value <= 1800 ? 'text-yellow-500' : 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Metrics"
      >
        📊
      </button>
      
      {showDetails && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-64">
          <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-gray-100">Performance Metrics</h3>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Load Time:</span>
              <span className={getScoreColor('load', metrics.loadTime)}>
                {formatMetric(metrics.loadTime, 'ms')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">FCP:</span>
              <span className={getScoreColor('FCP', metrics.FCP)}>
                {formatMetric(metrics.FCP, 'ms')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">TTFB:</span>
              <span className={getScoreColor('TTFB', metrics.TTFB)}>
                {formatMetric(metrics.TTFB, 'ms')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Memory:</span>
              <span className="text-purple-500">
                {formatMetric(metrics.memoryUsage, 'MB')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">JS Size:</span>
              <span className="text-blue-500">
                {formatMetric(metrics.jsSize, 'KB')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Images:</span>
              <span className="text-green-500">
                {metrics.imageCount || 0}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Connection:</span>
              <span className="text-orange-500">
                {metrics.connectionType || 'unknown'}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Core Web Vitals scoring: 
              <span className="text-green-500 ml-1">Good</span>
              <span className="text-yellow-500 ml-1">Needs Improvement</span>  
              <span className="text-red-500 ml-1">Poor</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
