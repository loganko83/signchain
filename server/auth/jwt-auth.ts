import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// JWT 토큰 관련 타입 정의
export interface JwtPayload {
  userId: number;
  email: string;
  role?: string;
}

// Request 객체에 user 정보 추가
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// JWT 설정
export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  /**
   * JWT 토큰 생성
   */
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'signchain',
      audience: 'signchain-users'
    });
  }

  /**
   * 리프레시 토큰 생성
   */
  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'signchain',
      audience: 'signchain-users'
    });
  }

  /**
   * JWT 토큰 검증
   */
  static verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'signchain',
        audience: 'signchain-users'
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * 토큰에서 사용자 ID 추출
   */
  static getUserIdFromToken(token: string): number {
    const payload = this.verifyToken(token);
    return payload.userId;
  }
}

/**
 * JWT 인증 미들웨어
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
      return;
    }

    // 토큰 검증 및 사용자 정보 추출
    const user = AuthService.verifyToken(token);
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Token authentication failed:', error);
    res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const user = AuthService.verifyToken(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // 토큰이 유효하지 않아도 계속 진행
    console.warn('Optional auth failed, continuing without user:', error);
    next();
  }
};

/**
 * 관리자 권한 확인 미들웨어
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ 
      error: 'Admin privileges required',
      code: 'ADMIN_REQUIRED'
    });
    return;
  }

  next();
};

/**
 * 현재 사용자 ID 가져오기 (인증된 경우)
 */
export const getCurrentUserId = (req: Request): number | null => {
  return req.user?.userId || null;
};

/**
 * 현재 사용자 ID 가져오기 (필수, 없으면 에러)
 */
export const requireCurrentUserId = (req: Request): number => {
  if (!req.user?.userId) {
    throw new Error('User authentication required');
  }
  return req.user.userId;
};
