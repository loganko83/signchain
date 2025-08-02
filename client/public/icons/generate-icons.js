// Icon Generator Script for PWA
// This would normally be run with a tool like sharp or canvas, but for now we'll create static files

const iconSizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'icon-180x180.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

const appleTouchSizes = [
  { size: 57, name: 'icon-57x57.png' },
  { size: 60, name: 'icon-60x60.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 76, name: 'icon-76x76.png' },
  { size: 114, name: 'icon-114x114.png' },
  { size: 120, name: 'icon-120x120.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'icon-180x180.png' }
];

const splashSizes = [
  { width: 640, height: 1136, name: 'splash-640x1136.png' },
  { width: 750, height: 1334, name: 'splash-750x1334.png' },
  { width: 1242, height: 2208, name: 'splash-1242x2208.png' },
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
  { width: 1536, height: 2048, name: 'splash-1536x2048.png' },
  { width: 1668, height: 2388, name: 'splash-1668x2388.png' },
  { width: 2048, height: 2732, name: 'splash-2048x2732.png' }
];

console.log('PWA 아이콘 크기 목록:');
console.log('기본 아이콘:', iconSizes.map(icon => `${icon.size}x${icon.size}`).join(', '));
console.log('Apple Touch 아이콘:', appleTouchSizes.map(icon => `${icon.size}x${icon.size}`).join(', '));
console.log('스플래시 화면:', splashSizes.map(splash => `${splash.width}x${splash.height}`).join(', '));

// 실제 구현에서는 canvas API나 server-side 이미지 처리 라이브러리를 사용해야 함
// 예: sharp, canvas, or online tools like favicon.io
