import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 사용자 타입 정의
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  lastLogin?: Date;
}

// 로그인 응답 타입
interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  expiresIn?: string;
  error?: string;
}

// AuthContext 타입 정의
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  getCurrentUserId: () => number | null;
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 토큰 관리
class TokenManager {
  private static readonly TOKEN_KEY = 'signchain_token';
  private static readonly REFRESH_TOKEN_KEY = 'signchain_refresh_token';
  private static readonly USER_KEY = 'signchain_user';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clearAll(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

// API 요청 헬퍼
class AuthAPI {
  private static readonly BASE_URL = '/api/auth';

  static async login(email: string, password: string, rememberMe = false): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || `HTTP ${response.status}: ${response.statusText}` 
        };
      }
      
      return data;
    } catch (error) {
      console.error('Login API error:', error);
      return { 
        success: false, 
        error: '네트워크 오류가 발생했습니다.' 
      };
    }
  }

  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || '토큰 갱신 실패' 
        };
      }
      
      return data;
    } catch (error) {
      console.error('Token refresh API error:', error);
      return { 
        success: false, 
        error: '토큰 갱신 중 오류가 발생했습니다.' 
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = TokenManager.getToken();
      if (token) {
        await fetch(`${this.BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // 로그아웃은 실패해도 로컬 토큰은 삭제해야 함
    }
  }

  static async getCurrentUser(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const token = TokenManager.getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await fetch(`${this.BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || '사용자 정보 조회 실패' 
        };
      }
      
      return data;
    } catch (error) {
      console.error('Get current user API error:', error);
      return { 
        success: false, 
        error: '사용자 정보 조회 중 오류가 발생했습니다.' 
      };
    }
  }
}

// AuthProvider 컴포넌트
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 저장된 인증 정보 확인
  useEffect(() => {
    const initializeAuth = async () => {
      const token = TokenManager.getToken();
      const savedUser = TokenManager.getUser();

      if (!token || !savedUser) {
        setIsLoading(false);
        return;
      }

      // 토큰이 만료되었는지 확인
      if (TokenManager.isTokenExpired(token)) {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          const success = await handleRefreshToken();
          if (!success) {
            TokenManager.clearAll();
          }
        } else {
          TokenManager.clearAll();
        }
      } else {
        // 토큰이 유효하면 사용자 정보 설정
        setUser(savedUser);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await AuthAPI.login(email, password, rememberMe);

      if (response.success && response.token && response.user) {
        TokenManager.setToken(response.token);
        TokenManager.setUser(response.user);
        
        if (response.refreshToken) {
          TokenManager.setRefreshToken(response.refreshToken);
        }

        setUser(response.user);
        return true;
      } else {
        console.error('Login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearAll();
      setUser(null);
      setIsLoading(false);
    }
  };

  // 토큰 갱신 함수
  const handleRefreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await AuthAPI.refreshToken(refreshToken);

      if (response.success && response.token && response.user) {
        TokenManager.setToken(response.token);
        TokenManager.setUser(response.user);
        
        if (response.refreshToken) {
          TokenManager.setRefreshToken(response.refreshToken);
        }

        setUser(response.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  // 현재 사용자 ID 가져오기
  const getCurrentUserId = (): number | null => {
    return user?.id || null;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken: handleRefreshToken,
    getCurrentUserId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API 요청 시 자동으로 토큰을 포함하는 fetch 래퍼
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = TokenManager.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 401 응답 시 토큰 갱신 시도
  if (response.status === 401 && token) {
    const refreshToken = TokenManager.getRefreshToken();
    if (refreshToken) {
      const refreshResponse = await AuthAPI.refreshToken(refreshToken);
      if (refreshResponse.success && refreshResponse.token) {
        TokenManager.setToken(refreshResponse.token);
        if (refreshResponse.user) {
          TokenManager.setUser(refreshResponse.user);
        }
        
        // 새 토큰으로 재시도
        const newHeaders = {
          ...headers,
          'Authorization': `Bearer ${refreshResponse.token}`,
        };
        
        return fetch(url, {
          ...options,
          headers: newHeaders,
        });
      } else {
        // 토큰 갱신 실패 시 로그아웃 처리
        TokenManager.clearAll();
        window.location.href = '/login';
      }
    }
  }

  return response;
};

export { TokenManager };
