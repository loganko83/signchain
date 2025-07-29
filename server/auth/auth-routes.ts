import { Request, Response } from 'express';
import { SecurityHelpers } from '../security.js';
import { AuthService, JwtPayload } from './jwt-auth.js';
import { storage } from '../storage.js';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  expiresIn?: string;
  error?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 사용자 로그인
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe = false }: LoginRequest = req.body;

    // 입력 검증
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
      return;
    }

    // 사용자 조회
    const user = await storage.getUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // 비밀번호 검증
    const isValidPassword = await SecurityHelpers.verifyPassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // JWT 페이로드 생성
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    };

    // 토큰 생성
    const token = AuthService.generateToken(payload);
    const refreshToken = rememberMe ? AuthService.generateRefreshToken(payload) : undefined;

    // 로그인 기록 업데이트
    await storage.updateUserLastLogin(user.id);

    // 응답
    const response: LoginResponse = {
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };

    res.json(response);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * 토큰 갱신
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken }: RefreshTokenRequest = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
      return;
    }

    // 리프레시 토큰 검증
    const payload = AuthService.verifyToken(refreshToken);

    // 사용자 존재 확인
    const user = await storage.getUser(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // 새 토큰 생성
    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    };

    const newToken = AuthService.generateToken(newPayload);
    const newRefreshToken = AuthService.generateRefreshToken(newPayload);

    const response: LoginResponse = {
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };

    res.json(response);

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};

/**
 * 로그아웃 (클라이언트 측에서 토큰 삭제)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // 서버 측에서는 토큰 블랙리스트 관리 등을 할 수 있지만
    // 현재는 단순히 클라이언트에서 토큰을 삭제하는 방식으로 구현
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * 현재 사용자 정보 조회
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const user = await storage.getUser(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
