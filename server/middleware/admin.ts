import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key';

// 관리자 계정 정보 (실제 환경에서는 DB에서 관리)
const ADMIN_ACCOUNTS = [
  {
    id: 'admin',
    username: 'admin',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'superadmin',
    organizationId: null
  }
];

interface AdminRequest extends Request {
  admin?: {
    id: string;
    username: string;
    role: string;
    organizationId?: string;
  };
}

/**
 * 관리자 로그인
 */
export async function adminLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password required'
      });
    }

    // 관리자 계정 확인
    const admin = ADMIN_ACCOUNTS.find(acc => acc.username === username);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 관리자 JWT 토큰 생성
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        organizationId: admin.organizationId,
        type: 'admin'
      },
      ADMIN_JWT_SECRET,
      { expiresIn: '8h' } // 관리자는 8시간 유효
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          organizationId: admin.organizationId
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * 관리자 JWT 인증 미들웨어
 */
export function authenticateAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Admin access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any;
    
    // 관리자 토큰인지 확인
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin token'
      });
    }

    req.admin = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      organizationId: decoded.organizationId
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired admin token'
    });
  }
}

/**
 * 관리자 역할 기반 인가
 */
export function requireAdminRole(roles: string[]) {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient admin permissions'
      });
    }

    next();
  };
}

/**
 * 조직별 접근 권한 확인
 */
export function requireOrganizationAccess(req: AdminRequest, res: Response, next: NextFunction) {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }

  // SuperAdmin은 모든 조직 접근 가능
  if (req.admin.role === 'superadmin') {
    return next();
  }

  // 조직 관리자는 자신의 조직만 접근 가능
  const requestedOrgId = req.params.organizationId || req.body.organizationId;
  if (req.admin.organizationId !== requestedOrgId) {
    return res.status(403).json({
      success: false,
      message: 'Organization access denied'
    });
  }

  next();
}

export type { AdminRequest };
