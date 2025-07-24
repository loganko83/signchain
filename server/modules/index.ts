import { ContractModule } from "./contract-module";
import { ApprovalModule } from "./approval-module";
import { DIDModule } from "./did-module";

// 모듈 인스턴스 생성 및 내보내기
export const contractModule = new ContractModule();
export const approvalModule = new ApprovalModule();
export const didModule = new DIDModule();

// 모듈 타입 정의
export type ModuleType = "contract" | "approval" | "did";

// 모듈 라우터 함수
export function getModuleByType(moduleType: ModuleType) {
  switch (moduleType) {
    case "contract":
      return contractModule;
    case "approval":
      return approvalModule;
    case "did":
      return didModule;
    default:
      throw new Error(`Unknown module type: ${moduleType}`);
  }
}

// 모듈별 기능 확인
export function getModuleCapabilities(moduleType: ModuleType) {
  const capabilities = {
    contract: {
      features: ["계약서 업로드", "서명 요청", "계약서 서명", "계약서 검증"],
      blockchain: true,
      multiSignature: true,
      notifications: true
    },
    approval: {
      features: ["승인 워크플로우", "순차 승인", "다중 승인자", "이메일 초대", "최종 문서 다운로드"],
      blockchain: true,
      workflows: true,
      enterpriseIntegration: true
    },
    did: {
      features: ["신원 증명서 발급", "DID 검증", "QR 코드", "블록체인 등록", "자격증명 관리"],
      blockchain: true,
      cryptographicProof: true,
      decentralizedIdentity: true
    }
  };

  return capabilities[moduleType] || null;
}

export {
  ContractModule,
  ApprovalModule,
  DIDModule
};