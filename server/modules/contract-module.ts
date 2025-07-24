import { storage } from "../storage";
import { BlockchainService } from "../blockchain";
import { generateDocumentHash } from "../crypto";

// Contract Module - 기존 계약 기능 유지
export class ContractModule {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  // 계약서 업로드 및 블록체인 등록
  async uploadContract(contractData: {
    title: string;
    description?: string;
    fileContent: Buffer;
    fileType: string;
    uploadedBy: number;
    organizationId?: number;
  }) {
    try {
      // 파일 해시 생성
      const fileHash = generateDocumentHash(contractData.fileContent);
      
      // IPFS 업로드 시뮬레이션
      const ipfsHash = this.generateIPFSHash();

      // 블록체인 트랜잭션 생성
      const blockchainTx = await this.blockchainService.registerDocument({
        documentHash: fileHash,
        documentType: "contract",
        uploader: contractData.uploadedBy
      });

      // 문서 데이터베이스 저장
      const document = await storage.createDocument({
        title: contractData.title,
        description: contractData.description || "",
        moduleType: "contract",
        category: "계약",
        priority: "높음",
        originalFilename: `${contractData.title}.${contractData.fileType.split('/')[1]}`,
        fileType: contractData.fileType,
        fileSize: contractData.fileContent.length,
        fileHash,
        ipfsHash,
        blockchainTxHash: blockchainTx.transactionHash,
        uploadedBy: contractData.uploadedBy,
        organizationId: contractData.organizationId
      });

      // 감사 로그 생성
      await storage.createAuditLog({
        userId: contractData.uploadedBy,
        action: "CONTRACT_UPLOADED",
        resource: "document",
        resourceId: document.id.toString(),
        details: JSON.stringify({
          title: contractData.title,
          fileHash,
          blockchainTxHash: blockchainTx.transactionHash
        })
      });

      return {
        document,
        blockchainTransaction: blockchainTx,
        success: true
      };
    } catch (error) {
      console.error("Contract upload error:", error);
      throw new Error("계약서 업로드 실패");
    }
  }

  // 계약서 서명 요청
  async requestContractSignature(requestData: {
    documentId: number;
    signerEmail: string;
    signerName?: string;
    message?: string;
    deadline?: Date;
    requesterId: number;
  }) {
    try {
      // 문서 확인
      const document = await storage.getDocument(requestData.documentId);
      if (!document || document.moduleType !== "contract") {
        throw new Error("계약서를 찾을 수 없습니다");
      }

      // 서명 요청 생성
      const signatureRequest = await storage.createSignatureRequest({
        documentId: requestData.documentId,
        requesterId: requestData.requesterId,
        signerEmail: requestData.signerEmail,
        signerName: requestData.signerName,
        message: requestData.message,
        deadline: requestData.deadline,
        shareToken: this.generateShareToken()
      });

      // 블록체인에 서명 요청 등록
      const blockchainTx = await this.blockchainService.registerSignatureRequest({
        documentId: requestData.documentId,
        requester: requestData.requesterId,
        signer: requestData.signerEmail
      });

      // 이메일 발송 (기존 기능 유지)
      // await sendSignatureRequestEmail(...)

      return {
        signatureRequest,
        blockchainTransaction: blockchainTx,
        success: true
      };
    } catch (error) {
      console.error("Contract signature request error:", error);
      throw new Error("서명 요청 실패");
    }
  }

  // 계약서 서명 처리
  async signContract(signData: {
    documentId: number;
    signerId: number;
    signerEmail: string;
    signatureData: string;
    signatureType: string;
  }) {
    try {
      // 서명 데이터 해시 생성
      const signatureHash = generateDocumentHash(Buffer.from(signData.signatureData));

      // 블록체인에 서명 등록
      const blockchainTx = await this.blockchainService.registerSignature({
        documentId: signData.documentId,
        signer: signData.signerId,
        signatureHash,
        signatureType: signData.signatureType
      });

      // 서명 저장
      const signature = await storage.createSignature({
        documentId: signData.documentId,
        signerId: signData.signerId,
        signerEmail: signData.signerEmail,
        signatureData: signData.signatureData,
        signatureType: signData.signatureType,
        blockchainTxHash: blockchainTx.transactionHash
      });

      // 감사 로그
      await storage.createAuditLog({
        userId: signData.signerId,
        action: "CONTRACT_SIGNED",
        resource: "signature",
        resourceId: signature.id.toString(),
        details: JSON.stringify({
          documentId: signData.documentId,
          signatureHash,
          blockchainTxHash: blockchainTx.transactionHash
        })
      });

      return {
        signature,
        blockchainTransaction: blockchainTx,
        success: true
      };
    } catch (error) {
      console.error("Contract signing error:", error);
      throw new Error("계약서 서명 실패");
    }
  }

  // 계약서 검증
  async verifyContract(documentId: number) {
    try {
      const document = await storage.getDocument(documentId);
      if (!document || document.moduleType !== "contract") {
        throw new Error("계약서를 찾을 수 없습니다");
      }

      // 블록체인 검증
      const verification = await this.blockchainService.verifyDocument({
        documentHash: document.fileHash,
        transactionHash: document.blockchainTxHash
      });

      // 서명들 검증
      const signatures = await storage.getSignaturesByDocument(documentId);
      const signatureVerifications = await Promise.all(
        signatures.map(async (sig) => {
          return await this.blockchainService.verifySignature({
            signatureHash: generateDocumentHash(Buffer.from(sig.signatureData)),
            transactionHash: sig.blockchainTxHash
          });
        })
      );

      return {
        documentVerification: verification,
        signatureVerifications,
        isValid: verification.isValid && signatureVerifications.every(v => v.isValid),
        signatures: signatures.length
      };
    } catch (error) {
      console.error("Contract verification error:", error);
      throw new Error("계약서 검증 실패");
    }
  }

  private generateIPFSHash(): string {
    return 'Qm' + require('crypto').randomBytes(22).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 44);
  }

  private generateShareToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}