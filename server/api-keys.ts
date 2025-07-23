import crypto from 'crypto';
import { storage } from './storage';

// API Key management for external integrations
export class ApiKeyManager {
  static generateApiKey(): string {
    const prefix = 'sk_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}${randomBytes}`;
  }

  static generateApiSecret(): string {
    return crypto.randomBytes(48).toString('hex');
  }

  static hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  static verifyApiKey(apiKey: string, hashedKey: string): boolean {
    return this.hashApiKey(apiKey) === hashedKey;
  }

  static generateWebhookSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateWebhookSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}

// Rate limiting
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(apiKey: string, maxRequests: number = 100, windowMs: number = 60000): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(apiKey)) {
      this.requests.set(apiKey, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    const requestData = this.requests.get(apiKey)!;
    
    if (now > requestData.resetTime) {
      // Reset the window
      this.requests.set(apiKey, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    if (requestData.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: requestData.resetTime };
    }

    requestData.count++;
    return { 
      allowed: true, 
      remaining: maxRequests - requestData.count, 
      resetTime: requestData.resetTime 
    };
  }
}

// API middleware for authentication and rate limiting
export function apiAuthMiddleware(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'X-API-Key header is required for API access'
    });
  }

  // Check rate limit
  const rateLimit = RateLimiter.checkRateLimit(apiKey);
  
  res.set({
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
  });

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'API rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    });
  }

  // For now, we'll skip actual API key validation for demo purposes
  // In production, you would validate against stored API keys
  req.apiKey = apiKey;
  next();
}