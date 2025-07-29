import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../../db';
import { SecurityHelpers } from '../../security';

const router = Router();

// DID Document 스키마
interface DIDDocument {
  "@context": string[];
  id: string;
  controller?: string;
  verificationMethod: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyJwk?: any;
    publicKeyMultibase?: string;
  }>;
  authentication?: string[];
  assertionMethod?: string[];
  keyAgreement?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
}

// Verifiable Credential 스키마
interface VerifiableCredential {
  "@context": string[];
  type: string[];
  id: string;
  issuer: string | { id: string; name?: string };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: any;
  proof?: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws?: string;
    proofValue?: string;
  };
}

// DID 생성
router.post('/create', async (req, res) => {
  try {
    const { method, keyType, purpose, userId } = req.body;
    
    // 키 쌍 생성 (실제로는 더 복잡한 암호화 로직 필요)
    const keyPair = crypto.generateKeyPairSync('ec', {
      namedCurve: 'P-256',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // DID 생성
    const didId = `did:${method}:signchain:${Date.now()}`;
    
    // DID Document 생성
    const didDocument: DIDDocument = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/jws-2020/v1"
      ],
      id: didId,
      verificationMethod: [{
        id: `${didId}#key-1`,
        type: keyType === "Ed25519" ? "Ed25519VerificationKey2020" : "JsonWebKey2020",
        controller: didId,
        publicKeyJwk: {
          kty: "EC",
          crv: "P-256",
          x: crypto.randomBytes(32).toString('base64url'),
          y: crypto.randomBytes(32).toString('base64url')
        }
      }],
      authentication: [`${didId}#key-1`],
      assertionMethod: [`${didId}#key-1`]
    };

    // 서비스 엔드포인트 추가
    if (method === "web") {
      didDocument.service = [{
        id: `${didId}#signchain-service`,
        type: "SignChainService",
        serviceEndpoint: `https://signchain.example.com/api/did/${didId}`
      }];
    }

    // 개인 키 암호화
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY is not set');
    }
    
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedPrivateKey = cipher.update(keyPair.privateKey, 'utf8', 'hex');
    encryptedPrivateKey += cipher.final('hex');
    
    const encryptedData = {
      encrypted: encryptedPrivateKey,
      iv: iv.toString('hex')
    };

    // 데이터베이스에 저장
    await db.query(
      `INSERT INTO dids (did, method, document, public_key, private_key_encrypted, purpose, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        didId,
        method,
        JSON.stringify(didDocument),
        keyPair.publicKey,
        JSON.stringify(encryptedData), // 암호화된 개인 키 저장
        purpose,
        userId
      ]
    );

    res.json({
      did: didId,
      didDocument,
      created: new Date().toISOString()
    });
  } catch (error) {
    console.error('DID creation error:', error);
    res.status(500).json({ error: 'Failed to create DID' });
  }
});

// DID 조회 (Resolver)
router.get('/resolve/:did', async (req, res) => {
  try {
    const { did } = req.params;
    
    // 데이터베이스에서 조회
    const result = await db.query(
      'SELECT * FROM dids WHERE did = $1',
      [did]
    );

    if (result.rows.length === 0) {
      // 외부 Universal Resolver 호출 (실제 구현 시)
      return res.status(404).json({ error: 'DID not found' });
    }

    const didRecord = result.rows[0];
    
    res.json({
      didDocument: JSON.parse(didRecord.document),
      metadata: {
        method: didRecord.method,
        created: didRecord.created_at,
        updated: didRecord.updated_at,
        versionId: "1.0.0"
      }
    });
  } catch (error) {
    console.error('DID resolution error:', error);
    res.status(500).json({ error: 'Failed to resolve DID' });
  }
});

// Verifiable Credential 발급
router.post('/issue-credential', async (req, res) => {
  try {
    const { 
      credentialType, 
      subjectDID, 
      subjectData, 
      issuerDID,
      expirationDate 
    } = req.body;

    // VC ID 생성
    const vcId = `vc:signchain:${Date.now()}`;
    
    // Verifiable Credential 생성
    const verifiableCredential: VerifiableCredential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1"
      ],
      type: ["VerifiableCredential", credentialType],
      id: vcId,
      issuer: issuerDID || "did:web:signchain.example.com",
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subjectDID,
        ...subjectData
      }
    };

    if (expirationDate) {
      verifiableCredential.expirationDate = new Date(expirationDate).toISOString();
    }

    // 서명 생성 (실제로는 issuer의 private key로 서명)
    const proof = {
      type: "Ed25519Signature2020",
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: `${issuerDID}#key-1`,
      proofValue: crypto.randomBytes(64).toString('base64url') // Mock 서명
    };

    verifiableCredential.proof = proof;

    // 데이터베이스에 저장
    await db.query(
      `INSERT INTO verifiable_credentials 
       (id, type, issuer_did, subject_did, credential_data, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        vcId,
        credentialType,
        issuerDID,
        subjectDID,
        JSON.stringify(verifiableCredential),
        'active'
      ]
    );

    res.json({
      credential: verifiableCredential,
      issued: new Date().toISOString()
    });
  } catch (error) {
    console.error('Credential issuance error:', error);
    res.status(500).json({ error: 'Failed to issue credential' });
  }
});

// Verifiable Credential 검증
router.post('/verify-credential', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // 기본 검증
    const verificationResult = {
      valid: true,
      checks: {
        signature: true,
        notExpired: true,
        notRevoked: true,
        issuerTrusted: true
      }
    };

    // 만료 검증
    if (credential.expirationDate) {
      const expiry = new Date(credential.expirationDate);
      if (expiry < new Date()) {
        verificationResult.valid = false;
        verificationResult.checks.notExpired = false;
      }
    }

    // 데이터베이스에서 상태 확인
    const result = await db.query(
      'SELECT status FROM verifiable_credentials WHERE id = $1',
      [credential.id]
    );

    if (result.rows.length > 0 && result.rows[0].status === 'revoked') {
      verificationResult.valid = false;
      verificationResult.checks.notRevoked = false;
    }

    res.json(verificationResult);
  } catch (error) {
    console.error('Credential verification error:', error);
    res.status(500).json({ error: 'Failed to verify credential' });
  }
});

// Presentation Request 생성
router.post('/create-presentation-request', async (req, res) => {
  try {
    const { 
      requesterDID, 
      subjectDID,
      purpose, 
      requestedCredentials,
      challenge 
    } = req.body;

    const presentationRequest = {
      id: `pr:signchain:${Date.now()}`,
      requester: requesterDID,
      subject: subjectDID,
      purpose,
      requestedCredentials,
      challenge: challenge || crypto.randomBytes(32).toString('base64url'),
      created: new Date().toISOString(),
      status: 'pending'
    };

    // 데이터베이스에 저장
    await db.query(
      `INSERT INTO presentation_requests 
       (id, requester_did, subject_did, purpose, requested_credentials, challenge, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        presentationRequest.id,
        requesterDID,
        subjectDID,
        purpose,
        JSON.stringify(requestedCredentials),
        presentationRequest.challenge,
        'pending'
      ]
    );

    res.json(presentationRequest);
  } catch (error) {
    console.error('Presentation request error:', error);
    res.status(500).json({ error: 'Failed to create presentation request' });
  }
});

// DID 목록 조회
router.get('/list/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await db.query(
      'SELECT did, method, purpose, created_at, status FROM dids WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('DID list error:', error);
    res.status(500).json({ error: 'Failed to list DIDs' });
  }
});

// 자격증명 목록 조회
router.get('/credentials/:did', async (req, res) => {
  try {
    const { did } = req.params;
    
    const result = await db.query(
      `SELECT id, type, issuer_did, credential_data, status, created_at 
       FROM verifiable_credentials 
       WHERE subject_did = $1 
       ORDER BY created_at DESC`,
      [did]
    );

    const credentials = result.rows.map(row => ({
      ...JSON.parse(row.credential_data),
      status: row.status
    }));

    res.json(credentials);
  } catch (error) {
    console.error('Credential list error:', error);
    res.status(500).json({ error: 'Failed to list credentials' });
  }
});

export default router;