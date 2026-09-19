import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_leave_approval_jwt_secret_key_2026_super_secure';
const JWT_EXPIRES_IN = '24h';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'MENTOR' | 'PARENT' | 'CLASS_INCHARGE' | 'HOD' | 'ADMIN' | 'SECURITY';
  department?: string;
  year?: number;
  section?: string;
  rollNumber?: string;
  studentEmail?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const Security = {
  hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },

  comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  },

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  },

  extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token && token !== 'null' && token !== 'undefined') {
        return token;
      }
    }
    if (req.query && typeof req.query.token === 'string') {
      const queryToken = req.query.token.trim();
      if (queryToken && queryToken !== 'null' && queryToken !== 'undefined') {
        return queryToken;
      }
    }
    return null;
  },

  // Authentication Middleware
  authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = Security.extractToken(req);
    if (!token) {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        message: 'Full authentication is required to access this resource. Missing Bearer JWT.',
      });
    }

    const payload = Security.verifyToken(token);
    if (!payload) {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        message: 'JWT token is expired or invalid.',
      });
    }

    req.user = payload;
    next();
  },

  // Role Authorization Middleware
  authorizeRoles(...allowedRoles: Array<TokenPayload['role']>) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          timestamp: new Date().toISOString(),
          status: 401,
          error: 'Unauthorized',
          message: 'User identity is not authenticated.',
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          timestamp: new Date().toISOString(),
          status: 403,
          error: 'Forbidden',
          message: `Access denied. Role 'ROLE_${req.user.role}' is not authorized to access this resource. Required one of: ${allowedRoles.map(r => 'ROLE_' + r).join(', ')}`,
        });
      }

      next();
    };
  },
};
