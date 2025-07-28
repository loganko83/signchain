-- DID 관련 테이블 추가

-- DIDs 테이블
CREATE TABLE IF NOT EXISTS dids (
  id SERIAL PRIMARY KEY,
  did VARCHAR(255) UNIQUE NOT NULL,
  method VARCHAR(50) NOT NULL, -- web, ethr, key, polygon 등
  document JSONB NOT NULL, -- DID Document
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT NOT NULL, -- 암호화된 개인키
  purpose VARCHAR(100), -- personal, business, device, service 등
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, revoked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verifiable Credentials 테이블
CREATE TABLE IF NOT EXISTS verifiable_credentials (
  id VARCHAR(255) PRIMARY KEY, -- VC ID
  type VARCHAR(100) NOT NULL, -- 자격증명 유형
  issuer_did VARCHAR(255) NOT NULL,
  subject_did VARCHAR(255) NOT NULL,
  credential_data JSONB NOT NULL, -- 전체 VC 데이터
  status VARCHAR(50) DEFAULT 'active', -- active, expired, revoked
  revocation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (issuer_did) REFERENCES dids(did) ON DELETE RESTRICT,
  FOREIGN KEY (subject_did) REFERENCES dids(did) ON DELETE RESTRICT
);

-- Presentation Requests 테이블
CREATE TABLE IF NOT EXISTS presentation_requests (
  id VARCHAR(255) PRIMARY KEY,
  requester_did VARCHAR(255) NOT NULL,
  subject_did VARCHAR(255) NOT NULL,
  purpose TEXT NOT NULL,
  requested_credentials JSONB NOT NULL, -- 요청된 자격증명 목록
  challenge VARCHAR(255) NOT NULL, -- 검증용 챌린지
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, expired
  presentation_data JSONB, -- 제출된 프레젠테이션
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (requester_did) REFERENCES dids(did) ON DELETE RESTRICT,
  FOREIGN KEY (subject_did) REFERENCES dids(did) ON DELETE RESTRICT
);

-- DID Services 테이블 (서비스 엔드포인트 관리)
CREATE TABLE IF NOT EXISTS did_services (
  id SERIAL PRIMARY KEY,
  did VARCHAR(255) NOT NULL,
  service_id VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  service_endpoint VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (did) REFERENCES dids(did) ON DELETE CASCADE,
  UNIQUE(did, service_id)
);

-- DID Key Rotations 테이블 (키 회전 이력)
CREATE TABLE IF NOT EXISTS did_key_rotations (
  id SERIAL PRIMARY KEY,
  did VARCHAR(255) NOT NULL,
  old_public_key TEXT NOT NULL,
  new_public_key TEXT NOT NULL,
  rotation_reason TEXT,
  rotated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (did) REFERENCES dids(did) ON DELETE CASCADE
);

-- VC Revocations 테이블 (자격증명 폐기 이력)
CREATE TABLE IF NOT EXISTS vc_revocations (
  id SERIAL PRIMARY KEY,
  credential_id VARCHAR(255) NOT NULL,
  revoked_by VARCHAR(255) NOT NULL, -- Issuer DID
  revocation_reason TEXT NOT NULL,
  revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (credential_id) REFERENCES verifiable_credentials(id) ON DELETE CASCADE,
  FOREIGN KEY (revoked_by) REFERENCES dids(did) ON DELETE RESTRICT
);

-- Trusted Issuers 테이블 (신뢰할 수 있는 발급자 목록)
CREATE TABLE IF NOT EXISTS trusted_issuers (
  id SERIAL PRIMARY KEY,
  issuer_did VARCHAR(255) NOT NULL,
  issuer_name VARCHAR(255) NOT NULL,
  issuer_type VARCHAR(100) NOT NULL, -- government, education, corporate 등
  trust_level INTEGER DEFAULT 1, -- 1-10
  verified BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  added_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issuer_did) REFERENCES dids(did) ON DELETE RESTRICT
);

-- DID 활동 로그
CREATE TABLE IF NOT EXISTS did_activity_logs (
  id SERIAL PRIMARY KEY,
  did VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL, -- created, updated, used, revoked 등
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (did) REFERENCES dids(did) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_dids_user_id ON dids(user_id);
CREATE INDEX idx_dids_method ON dids(method);
CREATE INDEX idx_dids_status ON dids(status);
CREATE INDEX idx_vc_issuer ON verifiable_credentials(issuer_did);
CREATE INDEX idx_vc_subject ON verifiable_credentials(subject_did);
CREATE INDEX idx_vc_type ON verifiable_credentials(type);
CREATE INDEX idx_vc_status ON verifiable_credentials(status);
CREATE INDEX idx_pr_requester ON presentation_requests(requester_did);
CREATE INDEX idx_pr_subject ON presentation_requests(subject_did);
CREATE INDEX idx_pr_status ON presentation_requests(status);
CREATE INDEX idx_did_activity_created ON did_activity_logs(created_at DESC);