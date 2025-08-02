import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // 이미지 최적화 설정
    assetsInlineLimit: 4096, // 4KB 미만 파일은 인라인으로 처리
    rollupOptions: {
      output: {
        // 에셋 파일명 설정
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          
          // 이미지 파일은 별도 폴더로
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name].[hash][extname]`;
          }
          
          // 폰트 파일
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return `assets/fonts/[name].[hash][extname]`;
          }
          
          return `assets/[name].[hash][extname]`;
        },
        manualChunks: {
          // React 관련 라이브러리
          'react-vendor': ['react', 'react-dom', 'wouter'],
          // UI 라이브러리
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-tooltip'],
          // 유틸리티 라이브러리
          'utils': ['clsx', 'class-variance-authority', 'tailwind-merge'],
          // API 및 상태 관리
          'api': ['@tanstack/react-query', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    // 압축 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 5179,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
