import { storage } from "../storage";
import { BlockchainService } from "../blockchain";
import { generateDocumentHash } from "../crypto";
import crypto from "crypto";

// DID Module - 사업자등록증, 주민증, 여권 인증서 발급 및 DID 활용
export class DIDModule {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  // DID 자격증명 발급 (사업자등록증, 주민증, 여권)
  async issueCredential(credentialData: {
    userId: number;
    credentialType: "사업자등록증" | "주민증" | "여권";
    subjectData: {
      name: string;
      idNumber: string;
      birthDate?: string;
      address?: string;
      issueDate: string;
      expiryDate?: string;
      [key: string]: any;
    };
    issuer: string;
    verificationDocuments?: Buffer[];
  }) {
    try {
      // 고유 DID 식별자 생성
      const credentialId = this.generateDID(credentialData.credentialType, credentialData.subjectData.idNumber);
      
      // 검증 키 쌍 생성
      const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // 자격증명 데이터 암호화
      const encryptedSubject = this.encryptCredentialData(credentialData.subjectData);
      
      // 암호학적 증명 생성
      const proof = this.generateProof(credentialData.subjectData, keyPair.privateKey);

      // 블록체인에 DID 등록
      const blockchainTx = await this.blockchainService.registerDID({
        credentialId,
        credentialType: credentialData.credentialType,
        holder: credentialData.userId,
        issuer: credentialData.issuer,
        dataHash: generateDocumentHash(Buffer.from(JSON.stringify(credentialData.subjectData)))
      });

      // DID 자격증명 저장
      const credential = await storage.createDIDCredential({
        userId: credentialData.userId,
        credentialType: credentialData.credentialType,
        credentialId,
        issuer: credentialData.issuer,
        subject: encryptedSubject,
        proof,
        expiresAt: credentialData.subjectData.expiryDate ? new Date(credentialData.subjectData.expiryDate) : null,
        blockchainTxHash: blockchainTx.transactionHash,
        verificationKey: keyPair.publicKey,
        metadata: JSON.stringify({
          issueDate: credentialData.subjectData.issueDate,
          verificationLevel: this.getVerificationLevel(credentialData.credentialType),
          supportingDocuments: credentialData.verificationDocuments?.length || 0
        })
      });

      // 감사 로그
      await storage.createAuditLog({
        userId: credentialData.userId,
        action: "DID_CREDENTIAL_ISSUED",
        resource: "did_credential",
        resourceId: credential.id.toString(),
        details: JSON.stringify({
          credentialType: credentialData.credentialType,
          credentialId,
          blockchainTxHash: blockchainTx.transactionHash
        })
      });

      return {
        credential: {
          ...credential,
          subject: credentialData.subjectData // 반환 시에는 원본 데이터
        },
        verificationKey: keyPair.publicKey,
        privateKey: keyPair.privateKey, // 보안상 일회성 반환
        blockchainTransaction: blockchainTx,
        qrCode: await this.generateQRCode(credentialId),
        success: true
      };
    } catch (error) {
      console.error("DID credential issuance error:", error);
      throw new Error("DID 자격증명 발급 실패");
    }
  }

  // DID 자격증명 검증
  async verifyCredential(verificationData: {
    credentialId: string;
    verifierId: number;
    verificationMethod: "블록체인" | "QR코드" | "API";
    challenge?: string;
  }) {
    try {
      // 자격증명 조회
      const credential = await storage.getDIDCredential(verificationData.credentialId);
      if (!credential) {
        throw new Error("자격증명을 찾을 수 없습니다");
      }

      // 블록체인 검증
      const blockchainVerification = await this.blockchainService.verifyDID({
        credentialId: verificationData.credentialId,
        transactionHash: credential.blockchainTxHash
      });

      // 자격증명 상태 확인
      const isValid = credential.status === "활성" && 
                     !credential.revokedAt && 
                     (!credential.expiresAt || new Date() < credential.expiresAt);

      // 암호학적 증명 검증
      const proofVerification = this.verifyProof(
        credential.proof,
        credential.verificationKey,
        verificationData.challenge
      );

      // 검증 결과 저장
      const verification = await storage.createDIDVerification({
        credentialId: verificationData.credentialId,
        verifierId: verificationData.verifierId,
        verificationResult: isValid && blockchainVerification.isValid && proofVerification,
        verificationMethod: verificationData.verificationMethod,
        blockchainTxHash: blockchainVerification.transactionHash,
        metadata: JSON.stringify({
          blockchainValid: blockchainVerification.isValid,
          proofValid: proofVerification,
          statusValid: isValid,
          verificationChain: blockchainVerification.confirmations
        })
      });

      return {
        verification,
        credential: {
          id: credential.credentialId,
          type: credential.credentialType,
          issuer: credential.issuer,
          status: credential.status,
          issuedAt: credential.createdAt,
          expiresAt: credential.expiresAt
        },
        isValid: verification.verificationResult,
        verificationDetails: {
          blockchain: blockchainVerification.isValid,
          proof: proofVerification,
          status: isValid,
          method: verificationData.verificationMethod
        }
      };
    } catch (error) {
      console.error("DID credential verification error:", error);
      throw new Error("DID 자격증명 검증 실패");
    }
  }

  // DID로 신원 인증
  async authenticateWithDID(authData: {
    credentialId: string;
    userId: number;
    challenge: string;
    signature: string;
  }) {
    try {
      const credential = await storage.getDIDCredential(authData.credentialId);
      if (!credential || credential.userId !== authData.userId) {
        throw new Error("자격증명이 유효하지 않습니다");
      }

      // 챌린지 서명 검증
      const isSignatureValid = crypto.verify(
        'sha256',
        Buffer.from(authData.challenge),
        credential.verificationKey,
        Buffer.from(authData.signature, 'base64')
      );

      if (!isSignatureValid) {
        throw new Error("서명이 유효하지 않습니다");
      }

      // 인증 성공 기록
      await storage.createDIDVerification({
        credentialId: authData.credentialId,
        verifierId: authData.userId,
        verificationResult: true,
        verificationMethod: "API",
        metadata: JSON.stringify({
          authenticationType: "challenge_response",
          challengeHash: generateDocumentHash(Buffer.from(authData.challenge))
        })
      });

      return {
        authenticated: true,
        credentialType: credential.credentialType,
        credentialId: credential.credentialId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("DID authentication error:", error);
      throw new Error("DID 인증 실패");
    }
  }

  // 자격증명 폐기
  async revokeCredential(revokeData: {
    credentialId: string;
    revokedBy: number;
    reason: string;
  }) {
    try {
      const credential = await storage.getDIDCredential(revokeData.credentialId);
      if (!credential) {
        throw new Error("자격증명을 찾을 수 없습니다");
      }

      // 블록체인에 폐기 기록
      const blockchainTx = await this.blockchainService.revokeDID({
        credentialId: revokeData.credentialId,
        revokedBy: revokeData.revokedBy,
        reason: revokeData.reason
      });

      // 자격증명 상태 업데이트
      await storage.updateDIDCredential(revokeData.credentialId, {
        status: "폐기",
        revokedAt: new Date()
      });

      // 감사 로그
      await storage.createAuditLog({
        userId: revokeData.revokedBy,
        action: "DID_CREDENTIAL_REVOKED",
        resource: "did_credential",
        resourceId: credential.id.toString(),
        details: JSON.stringify({
          credentialId: revokeData.credentialId,
          reason: revokeData.reason,
          blockchainTxHash: blockchainTx.transactionHash
        })
      });

      return {
        revoked: true,
        blockchainTransaction: blockchainTx,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("DID credential revocation error:", error);
      throw new Error("DID 자격증명 폐기 실패");
    }
  }

  // 사용자의 모든 DID 자격증명 조회
  async getUserCredentials(userId: number) {
    try {
      const credentials = await storage.getDIDCredentialsByUser(userId);
      
      return credentials.map(credential => ({
        id: credential.credentialId,
        type: credential.credentialType,
        issuer: credential.issuer,
        status: credential.status,
        issuedAt: credential.createdAt,
        expiresAt: credential.expiresAt,
        verificationCount: 0, // 검증 횟수 조회 필요
        lastVerified: null // 마지막 검증 시간 조회 필요
      }));
    } catch (error) {
      console.error("User credentials retrieval error:", error);
      throw new Error("사용자 자격증명 조회 실패");
    }
  }

  // QR 코드를 통한 자격증명 공유
  async generateShareableCredential(credentialId: string, shareData: {
    validUntil?: Date;
    allowedVerifiers?: string[];
    sharedBy: number;
  }) {
    try {
      const credential = await storage.getDIDCredential(credentialId);
      if (!credential) {
        throw new Error("자격증명을 찾을 수 없습니다");
      }

      // 공유 토큰 생성
      const shareToken = crypto.randomBytes(32).toString('hex');
      const shareUrl = `${process.env.BASE_URL}/verify/did/${shareToken}`;

      // 공유 정보 임시 저장 (Redis 등 사용 권장)
      const shareInfo = {
        credentialId,
        validUntil: shareData.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간
        allowedVerifiers: shareData.allowedVerifiers,
        sharedBy: shareData.sharedBy,
        createdAt: new Date()
      };

      // QR 코드 생성
      const qrCode = await this.generateQRCode(shareUrl);

      return {
        shareToken,
        shareUrl,
        qrCode,
        validUntil: shareInfo.validUntil,
        credentialType: credential.credentialType
      };
    } catch (error) {
      console.error("Shareable credential generation error:", error);
      throw new Error("공유 가능한 자격증명 생성 실패");
    }
  }

  // 개인 정보 생성
  private generateDID(credentialType: string, idNumber: string): string {
    const prefix = "did:signchain:";
    const typeCode = {
      "사업자등록증": "biz",
      "주민증": "id",
      "여권": "passport"
    }[credentialType] || "unknown";
    
    const hash = crypto.createHash('sha256')
      .update(`${credentialType}:${idNumber}:${Date.now()}`)
      .digest('hex').slice(0, 16);
    
    return `${prefix}${typeCode}:${hash}`;
  }

  private encryptCredentialData(data: any): any {
    // 실제 구현에서는 강력한 암호화 사용
    const encrypted = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'default-key');
    let result = encrypted.update(JSON.stringify(data), 'utf8', 'hex');
    result += encrypted.final('hex');
    return { encrypted: result };
  }

  private generateProof(data: any, privateKey: string): any {
    const dataHash = generateDocumentHash(Buffer.from(JSON.stringify(data)));
    const signature = crypto.sign('sha256', Buffer.from(dataHash), privateKey);
    
    return {
      type: "RsaSignature2018",
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: "publicKey",
      jws: signature.toString('base64')
    };
  }

  private verifyProof(proof: any, publicKey: string, challenge?: string): boolean {
    try {
      if (!proof.jws) return false;
      
      const signature = Buffer.from(proof.jws, 'base64');
      const data = challenge || proof.created;
      
      return crypto.verify('sha256', Buffer.from(data), publicKey, signature);
    } catch (error) {
      return false;
    }
  }

  private getVerificationLevel(credentialType: string): string {
    const levels = {
      "사업자등록증": "high",
      "주민증": "high",
      "여권": "highest"
    };
    return levels[credentialType] || "medium";
  }

  private async generateQRCode(data: string): Promise<string> {
    // QR 코드 생성 (qrcode 라이브러리 사용)
    const QRCode = require('qrcode');
    try {
      return await QRCode.toDataURL(data);
    } catch (error) {
      console.error('QR code generation error:', error);
      return '';
    }
  }
}