import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Security Headers Middleware
 * 보안 헤더 설정 (OWASP 권장사항 기반)
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Vite 개발용
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.coingecko.com https://*.infura.io https://*.alchemy.com",
    "frame-ancestors 'none'",
  ].join('; '));

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HTTPS 강제 (프로덕션)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

/**
 * API Rate Limiting
 * API 요청 빈도 제한
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 인증 Rate Limiting
 * 로그인/회원가입 시도 제한
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 시도
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
});

/**
 * 관리자 Rate Limiting
 * 관리자 API 요청 제한
 */
export const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5분
  max: 50, // 최대 50 요청
  message: {
    success: false,
    message: 'Admin API rate limit exceeded',
    retryAfter: '5 minutes'
  },
});

/**
 * CORS 설정
 * 개발/프로덕션 환경별 설정
 */
export function corsConfig(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5174',
    'http://localhost:3000',
    'https://trendy.storydot.kr'
  ];

  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24시간

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

/**
 * Request 크기 제한
 * 대용량 파일 업로드 방지
 */
export function requestSizeLimit(req: Request, res: Response, next: NextFunction) {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request too large'
    });
  }

  next();
}
