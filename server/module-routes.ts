import { Router } from "express";
import { contractModule, approvalModule, didModule } from "./modules";
import { storage } from "./storage";
import multer from "multer";

const router = Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Contract Module Routes
router.post("/contract/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "파일이 필요합니다" });
    }

    const result = await contractModule.uploadContract({
      title: req.body.title,
      description: req.body.description,
      fileContent: req.file.buffer,
      fileType: req.file.mimetype,
      uploadedBy: parseInt(req.body.uploadedBy),
      organizationId: req.body.organizationId ? parseInt(req.body.organizationId) : undefined
    });

    res.json(result);
  } catch (error) {
    console.error("Contract upload error:", error);
    res.status(500).json({ error: "계약서 업로드 실패" });
  }
});

router.post("/contract/signature-request", async (req, res) => {
  try {
    const result = await contractModule.requestContractSignature({
      documentId: parseInt(req.body.documentId),
      signerEmail: req.body.signerEmail,
      signerName: req.body.signerName,
      message: req.body.message,
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      requesterId: parseInt(req.body.requesterId)
    });

    res.json(result);
  } catch (error) {
    console.error("Contract signature request error:", error);
    res.status(500).json({ error: "서명 요청 실패" });
  }
});

router.post("/contract/sign", async (req, res) => {
  try {
    const result = await contractModule.signContract({
      documentId: parseInt(req.body.documentId),
      signerId: parseInt(req.body.signerId),
      signerEmail: req.body.signerEmail,
      signatureData: req.body.signatureData,
      signatureType: req.body.signatureType
    });

    res.json(result);
  } catch (error) {
    console.error("Contract signing error:", error);
    res.status(500).json({ error: "계약서 서명 실패" });
  }
});

router.get("/contract/verify/:documentId", async (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const result = await contractModule.verifyContract(documentId);

    res.json(result);
  } catch (error) {
    console.error("Contract verification error:", error);
    res.status(500).json({ error: "계약서 검증 실패" });
  }
});

// Approval Module Routes
router.post("/approval/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "파일이 필요합니다" });
    }

    const result = await approvalModule.uploadApprovalDocument({
      title: req.body.title,
      description: req.body.description,
      fileContent: req.file.buffer,
      fileType: req.file.mimetype,
      uploadedBy: parseInt(req.body.uploadedBy),
      organizationId: parseInt(req.body.organizationId)
    });

    res.json(result);
  } catch (error) {
    console.error("Approval document upload error:", error);
    res.status(500).json({ error: "승인 문서 업로드 실패" });
  }
});

router.post("/approval/workflow", async (req, res) => {
  try {
    const result = await approvalModule.createApprovalWorkflow({
      documentId: parseInt(req.body.documentId),
      workflowName: req.body.workflowName,
      organizationId: parseInt(req.body.organizationId),
      initiatedBy: parseInt(req.body.initiatedBy),
      steps: req.body.steps
    });

    res.json(result);
  } catch (error) {
    console.error("Approval workflow creation error:", error);
    res.status(500).json({ error: "승인 워크플로우 생성 실패" });
  }
});

router.post("/approval/step/complete", async (req, res) => {
  try {
    const result = await approvalModule.completeWorkflowStep({
      stepId: parseInt(req.body.stepId),
      completedBy: parseInt(req.body.completedBy),
      comments: req.body.comments,
      action: req.body.action,
      signatureData: req.body.signatureData
    });

    res.json(result);
  } catch (error) {
    console.error("Approval step completion error:", error);
    res.status(500).json({ error: "워크플로우 단계 완료 실패" });
  }
});

router.post("/approval/add-approver", async (req, res) => {
  try {
    const result = await approvalModule.addApprover({
      documentId: parseInt(req.body.documentId),
      organizationId: parseInt(req.body.organizationId),
      approverEmail: req.body.approverEmail,
      approverName: req.body.approverName,
      stepType: req.body.stepType,
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined
    });

    res.json(result);
  } catch (error) {
    console.error("Add approver error:", error);
    res.status(500).json({ error: "승인자 추가 실패" });
  }
});

router.get("/approval/final-document/:documentId", async (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const result = await approvalModule.getFinalDocument(documentId);

    res.json(result);
  } catch (error) {
    console.error("Final document retrieval error:", error);
    res.status(500).json({ error: "최종 문서 조회 실패" });
  }
});

// DID Module Routes
router.post("/did/issue-credential", async (req, res) => {
  try {
    const result = await didModule.issueCredential({
      userId: parseInt(req.body.userId),
      credentialType: req.body.credentialType,
      subjectData: req.body.subjectData,
      issuer: req.body.issuer,
      verificationDocuments: req.body.verificationDocuments
    });

    // 보안상 private key는 응답에서 제거
    const { privateKey, ...safeResult } = result;
    
    res.json(safeResult);
  } catch (error) {
    console.error("DID credential issuance error:", error);
    res.status(500).json({ error: "DID 자격증명 발급 실패" });
  }
});

router.post("/did/verify-credential", async (req, res) => {
  try {
    const result = await didModule.verifyCredential({
      credentialId: req.body.credentialId,
      verifierId: parseInt(req.body.verifierId),
      verificationMethod: req.body.verificationMethod,
      challenge: req.body.challenge
    });

    res.json(result);
  } catch (error) {
    console.error("DID credential verification error:", error);
    res.status(500).json({ error: "DID 자격증명 검증 실패" });
  }
});

router.post("/did/authenticate", async (req, res) => {
  try {
    const result = await didModule.authenticateWithDID({
      credentialId: req.body.credentialId,
      userId: parseInt(req.body.userId),
      challenge: req.body.challenge,
      signature: req.body.signature
    });

    res.json(result);
  } catch (error) {
    console.error("DID authentication error:", error);
    res.status(500).json({ error: "DID 인증 실패" });
  }
});

router.post("/did/revoke-credential", async (req, res) => {
  try {
    const result = await didModule.revokeCredential({
      credentialId: req.body.credentialId,
      revokedBy: parseInt(req.body.revokedBy),
      reason: req.body.reason
    });

    res.json(result);
  } catch (error) {
    console.error("DID credential revocation error:", error);
    res.status(500).json({ error: "DID 자격증명 폐기 실패" });
  }
});

router.get("/did/user-credentials/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await didModule.getUserCredentials(userId);

    res.json({ credentials: result });
  } catch (error) {
    console.error("User credentials retrieval error:", error);
    res.status(500).json({ error: "사용자 자격증명 조회 실패" });
  }
});

router.post("/did/generate-shareable", async (req, res) => {
  try {
    const result = await didModule.generateShareableCredential(req.body.credentialId, {
      validUntil: req.body.validUntil ? new Date(req.body.validUntil) : undefined,
      allowedVerifiers: req.body.allowedVerifiers,
      sharedBy: parseInt(req.body.sharedBy)
    });

    res.json(result);
  } catch (error) {
    console.error("Shareable credential generation error:", error);
    res.status(500).json({ error: "공유 가능한 자격증명 생성 실패" });
  }
});

// Health check for modules
router.get("/health", async (req, res) => {
  try {
    const moduleStatuses = {
      contract: "healthy",
      approval: "healthy", 
      did: "healthy"
    };

    res.json({
      status: "healthy",
      modules: moduleStatuses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "모듈 상태 확인 실패" });
  }
});

export default router;