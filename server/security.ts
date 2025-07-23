import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { storage } from './storage';

// Two-Factor Authentication (2FA) with TOTP
export class TwoFactorAuth {
  static generateSecret(userEmail: string): { secret: string; qrCodeUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `SignChain (${userEmail})`,
      issuer: 'SignChain',
      length: 32,
    });

    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: userEmail,
      issuer: 'SignChain',
      encoding: 'ascii',
    });

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  static async generateQRCode(secret: string, userEmail: string): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: userEmail,
      issuer: 'SignChain',
      encoding: 'base32',
    });

    return await QRCode.toDataURL(otpauthUrl);
  }

  static verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
    });
  }

  static async enableTwoFactor(userId: number, token: string): Promise<{ success: boolean; backupCodes?: string[] }> {
    try {
      const userSecurity = await storage.getUserSecurity(userId);
      if (!userSecurity?.twoFactorSecret) {
        throw new Error('2FA secret not found');
      }

      const isValid = this.verifyToken(token, userSecurity.twoFactorSecret);
      if (!isValid) {
        return { success: false };
      }

      await storage.updateUserSecurity(userId, {
        twoFactorEnabled: true,
      });

      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      return { success: true, backupCodes };
    } catch (error) {
      console.error('2FA 활성화 오류:', error);
      return { success: false };
    }
  }

  static async verifyTwoFactor(userId: number, token: string): Promise<boolean> {
    try {
      const userSecurity = await storage.getUserSecurity(userId);
      if (!userSecurity?.twoFactorEnabled || !userSecurity.twoFactorSecret) {
        return false;
      }

      return this.verifyToken(token, userSecurity.twoFactorSecret);
    } catch (error) {
      console.error('2FA 검증 오류:', error);
      return false;
    }
  }
}

// Biometric Authentication with WebAuthn
export class BiometricAuth {
  private static readonly rpName = 'SignChain';
  private static readonly rpID = 'localhost'; // Should be your domain in production
  private static readonly origin = 'http://localhost:5000'; // Should be your origin in production

  static async generateRegistrationOptions(userId: number, userEmail: string) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    // Get existing authenticators for this user
    const userSecurity = await storage.getUserSecurity(userId);
    const excludeCredentials = userSecurity?.biometricPublicKey ? [{
      id: Buffer.from(userSecurity.biometricPublicKey, 'base64'),
      type: 'public-key' as const,
    }] : [];

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: userId.toString(),
      userName: userEmail,
      userDisplayName: user.username,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // Prefer platform authenticators (TouchID, FaceID, Windows Hello)
      },
    });

    return options;
  }

  static async verifyRegistration(userId: number, credential: any) {
    try {
      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: credential.challenge, // You should store this in session/cache
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
      });

      if (verification.verified && verification.registrationInfo) {
        // Store the credential
        await storage.updateUserSecurity(userId, {
          biometricEnabled: true,
          biometricPublicKey: Buffer.from(verification.registrationInfo.credentialPublicKey).toString('base64'),
        });

        return { success: true, credentialID: verification.registrationInfo.credentialID };
      }

      return { success: false };
    } catch (error) {
      console.error('생체 인증 등록 검증 오류:', error);
      return { success: false };
    }
  }

  static async generateAuthenticationOptions(userId?: number) {
    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      userVerification: 'preferred',
    });

    return options;
  }

  static async verifyAuthentication(userId: number, credential: any) {
    try {
      const userSecurity = await storage.getUserSecurity(userId);
      if (!userSecurity?.biometricEnabled || !userSecurity.biometricPublicKey) {
        return { success: false };
      }

      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: credential.challenge, // You should store this in session/cache
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        authenticator: {
          credentialID: Buffer.from(userSecurity.biometricPublicKey, 'base64'),
          credentialPublicKey: Buffer.from(userSecurity.biometricPublicKey, 'base64'),
          counter: 0, // You should track this
        },
      });

      return { success: verification.verified };
    } catch (error) {
      console.error('생체 인증 검증 오류:', error);
      return { success: false };
    }
  }
}

// Security Helper Functions
export class SecurityHelpers {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateSessionToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  static async checkAccountLock(userId: number): Promise<{ isLocked: boolean; remainingTime?: number }> {
    const userSecurity = await storage.getUserSecurity(userId);
    if (!userSecurity) {
      return { isLocked: false };
    }

    if (userSecurity.lockedUntil && new Date() < userSecurity.lockedUntil) {
      const remainingTime = userSecurity.lockedUntil.getTime() - Date.now();
      return { isLocked: true, remainingTime: Math.ceil(remainingTime / 1000) };
    }

    return { isLocked: false };
  }

  static async recordFailedLogin(userId: number): Promise<{ shouldLock: boolean; attemptsRemaining: number }> {
    const userSecurity = await storage.getUserSecurity(userId);
    if (!userSecurity) {
      return { shouldLock: false, attemptsRemaining: 5 };
    }

    const newAttempts = userSecurity.loginAttempts + 1;
    const shouldLock = newAttempts >= 5;
    
    const updates: any = { loginAttempts: newAttempts };
    if (shouldLock) {
      updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      updates.loginAttempts = 0; // Reset attempts after lock
    }

    await storage.updateUserSecurity(userId, updates);

    return { 
      shouldLock, 
      attemptsRemaining: shouldLock ? 0 : 5 - newAttempts 
    };
  }

  static async recordSuccessfulLogin(userId: number): Promise<void> {
    await storage.updateUserSecurity(userId, {
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });
  }

  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('대문자가 포함되어야 합니다');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('소문자가 포함되어야 합니다');
    }

    if (!/\d/.test(password)) {
      errors.push('숫자가 포함되어야 합니다');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자가 포함되어야 합니다');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}