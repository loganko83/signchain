import { storage } from "../storage";
import { BlockchainService } from "../blockchain";
import { generateDocumentHash } from "../crypto";

// Approval Module - Adobe Sign 같은 승인 워크플로우
export class ApprovalModule {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  // 승인 문서 업로드
  async uploadApprovalDocument(documentData: {
    title: string;
    description?: string;
    fileContent: Buffer;
    fileType: string;
    uploadedBy: number;
    organizationId: number;
  }) {
    try {
      // 파일 해시 생성
      const fileHash = generateDocumentHash(documentData.fileContent);
      
      // IPFS 업로드 시뮬레이션
      const ipfsHash = this.generateIPFSHash();

      // 블록체인 트랜잭션 생성
      const blockchainTx = await this.blockchainService.registerDocument({
        documentHash: fileHash,
        documentType: "approval",
        uploader: documentData.uploadedBy
      });

      // 문서 저장
      const document = await storage.createDocument({
        title: documentData.title,
        description: documentData.description || "",
        moduleType: "approval",
        category: "승인",
        priority: "보통",
        originalFilename: `${documentData.title}.${documentData.fileType.split('/')[1]}`,
        fileType: documentData.fileType,
        fileSize: documentData.fileContent.length,
        fileHash,
        ipfsHash,
        blockchainTxHash: blockchainTx.transactionHash,
        uploadedBy: documentData.uploadedBy,
        organizationId: documentData.organizationId
      });

      return {
        document,
        blockchainTransaction: blockchainTx,
        success: true
      };
    } catch (error) {
      console.error("Approval document upload error:", error);
      throw new Error("승인 문서 업로드 실패");
    }
  }

  // 승인 워크플로우 생성
  async createApprovalWorkflow(workflowData: {
    documentId: number;
    workflowName: string;
    organizationId: number;
    initiatedBy: number;
    steps: Array<{
      assignedTo?: number;
      assignedRole?: string;
      stepType: string; // 서명, 검토, 승인
      deadline?: Date;
    }>;
  }) {
    try {
      // 블록체인에 워크플로우 등록
      const blockchainTx = await this.blockchainService.registerWorkflow({
        documentId: workflowData.documentId,
        initiator: workflowData.initiatedBy,
        organizationId: workflowData.organizationId,
        stepsCount: workflowData.steps.length
      });

      // 워크플로우 생성
      const workflow = await storage.createApprovalWorkflow({
        documentId: workflowData.documentId,
        workflowName: workflowData.workflowName,
        organizationId: workflowData.organizationId,
        initiatedBy: workflowData.initiatedBy,
        totalSteps: workflowData.steps.length,
        blockchainTxHash: blockchainTx.transactionHash,
        metadata: JSON.stringify({ steps: workflowData.steps })
      });

      // 워크플로우 단계들 생성
      const steps = [];
      for (let i = 0; i < workflowData.steps.length; i++) {
        const stepData = workflowData.steps[i];
        const step = await storage.createApprovalStep({
          workflowId: workflow.id,
          stepNumber: i + 1,
          assignedTo: stepData.assignedTo,
          assignedRole: stepData.assignedRole,
          stepType: stepData.stepType,
          deadline: stepData.deadline
        });
        steps.push(step);
      }

      // 첫 번째 단계 활성화 알림
      if (steps.length > 0) {
        await this.notifyStepAssignee(steps[0]);
      }

      return {
        workflow,
        steps,
        blockchainTransaction: blockchainTx,
        success: true
      };
    } catch (error) {
      console.error("Approval workflow creation error:", error);
      throw new Error("승인 워크플로우 생성 실패");
    }
  }

  // 워크플로우 단계 완료 처리
  async completeWorkflowStep(stepData: {
    stepId: number;
    completedBy: number;
    comments?: string;
    action: "승인" | "거부" | "서명" | "검토완료";
    signatureData?: string;
  }) {
    try {
      const step = await storage.getApprovalStep(stepData.stepId);
      if (!step) {
        throw new Error("워크플로우 단계를 찾을 수 없습니다");
      }

      const workflow = await storage.getApprovalWorkflow(step.workflowId);
      if (!workflow) {
        throw new Error("워크플로우를 찾을 수 없습니다");
      }

      // 블록체인에 단계 완료 등록
      const blockchainTx = await this.blockchainService.registerStepCompletion({
        workflowId: step.workflowId,
        stepNumber: step.stepNumber,
        completedBy: stepData.completedBy,
        action: stepData.action
      });

      // 단계 업데이트
      await storage.updateApprovalStep(stepData.stepId, {
        status: stepData.action === "거부" ? "거부" : "완료",
        completedBy: stepData.completedBy,
        completedAt: new Date(),
        comments: stepData.comments,
        blockchainTxHash: blockchainTx.transactionHash
      });

      // 서명 데이터가 있는 경우 서명 테이블에도 저장
      if (stepData.signatureData && step.stepType === "서명") {
        await storage.createSignature({
          documentId: workflow.documentId,
          signerId: stepData.completedBy,
          signerEmail: "", // 사용자 이메일 조회 필요
          signatureData: stepData.signatureData,
          signatureType: "approval_signature",
          blockchainTxHash: blockchainTx.transactionHash
        });
      }

      // 워크플로우 진행 상태 확인 및 업데이트
      await this.updateWorkflowProgress(workflow.id, stepData.action === "거부");

      return {
        step,
        blockchainTransaction: blockchainTx,
        success: true
      };
    } catch (error) {
      console.error("Workflow step completion error:", error);
      throw new Error("워크플로우 단계 완료 실패");
    }
  }

  // 사용자/이메일로 승인자 추가
  async addApprover(workflowData: {
    documentId: number;
    organizationId: number;
    approverEmail: string;
    approverName?: string;
    stepType: string;
    deadline?: Date;
  }) {
    try {
      // 기존 워크플로우 찾기 또는 새로 생성
      let workflow = await storage.getApprovalWorkflowByDocument(workflowData.documentId);
      
      if (!workflow) {
        // 새 워크플로우 생성
        const newWorkflowData = {
          documentId: workflowData.documentId,
          workflowName: `Document ${workflowData.documentId} Approval`,
          organizationId: workflowData.organizationId,
          initiatedBy: 1, // 현재 사용자
          steps: [{
            stepType: workflowData.stepType,
            deadline: workflowData.deadline
          }]
        };
        const result = await this.createApprovalWorkflow(newWorkflowData);
        workflow = result.workflow;
      }

      // 새 단계 추가
      const nextStepNumber = workflow.totalSteps + 1;
      const step = await storage.createApprovalStep({
        workflowId: workflow.id,
        stepNumber: nextStepNumber,
        assignedTo: null, // 이메일로 초대된 외부 사용자
        assignedRole: workflowData.approverEmail,
        stepType: workflowData.stepType,
        deadline: workflowData.deadline
      });

      // 워크플로우 총 단계 수 업데이트
      await storage.updateApprovalWorkflow(workflow.id, {
        totalSteps: nextStepNumber
      });

      // 이메일 알림 발송
      await this.sendApprovalEmail({
        email: workflowData.approverEmail,
        name: workflowData.approverName,
        documentTitle: "", // 문서 제목 조회 필요
        stepType: workflowData.stepType,
        deadline: workflowData.deadline
      });

      return {
        workflow,
        step,
        success: true
      };
    } catch (error) {
      console.error("Add approver error:", error);
      throw new Error("승인자 추가 실패");
    }
  }

  // 최종 문서 다운로드 및 공람
  async getFinalDocument(documentId: number) {
    try {
      const document = await storage.getDocument(documentId);
      if (!document || document.moduleType !== "approval") {
        throw new Error("승인 문서를 찾을 수 없습니다");
      }

      const workflow = await storage.getApprovalWorkflowByDocument(documentId);
      if (!workflow || workflow.status !== "완료") {
        throw new Error("승인 프로세스가 완료되지 않았습니다");
      }

      const steps = await storage.getApprovalStepsByWorkflow(workflow.id);
      const signatures = await storage.getSignaturesByDocument(documentId);

      // 블록체인 검증
      const verification = await this.blockchainService.verifyDocument({
        documentHash: document.fileHash,
        transactionHash: document.blockchainTxHash
      });

      return {
        document,
        workflow,
        steps,
        signatures,
        verification,
        downloadUrl: `/api/documents/${documentId}/download?format=signed`,
        isComplete: true
      };
    } catch (error) {
      console.error("Final document retrieval error:", error);
      throw new Error("최종 문서 조회 실패");
    }
  }

  // 워크플로우 진행 상태 업데이트
  private async updateWorkflowProgress(workflowId: number, isRejected: boolean) {
    try {
      const workflow = await storage.getApprovalWorkflow(workflowId);
      const steps = await storage.getApprovalStepsByWorkflow(workflowId);
      
      if (isRejected) {
        await storage.updateApprovalWorkflow(workflowId, {
          status: "거부",
          completedAt: new Date()
        });
        return;
      }

      const completedSteps = steps.filter(step => step.status === "완료").length;
      const currentStep = Math.min(completedSteps + 1, workflow.totalSteps);

      if (completedSteps >= workflow.totalSteps) {
        // 워크플로우 완료
        await storage.updateApprovalWorkflow(workflowId, {
          status: "완료",
          completedAt: new Date(),
          currentStep: workflow.totalSteps
        });
      } else {
        // 다음 단계로 진행
        await storage.updateApprovalWorkflow(workflowId, {
          currentStep
        });

        // 다음 단계 담당자에게 알림
        const nextStep = steps.find(step => step.stepNumber === currentStep);
        if (nextStep) {
          await this.notifyStepAssignee(nextStep);
        }
      }
    } catch (error) {
      console.error("Workflow progress update error:", error);
    }
  }

  private async notifyStepAssignee(step: any) {
    // 단계 담당자에게 알림 발송
    try {
      if (step.assignedTo) {
        // 내부 사용자 알림
        // await sendInternalNotification(step.assignedTo, step);
      } else if (step.assignedRole) {
        // 이메일 알림
        // await sendEmailNotification(step.assignedRole, step);
      }
    } catch (error) {
      console.error("Step assignee notification error:", error);
    }
  }

  private async sendApprovalEmail(emailData: {
    email: string;
    name?: string;
    documentTitle: string;
    stepType: string;
    deadline?: Date;
  }) {
    // 승인 요청 이메일 발송
    try {
      // SendGrid 이메일 발송 로직
      console.log(`Sending approval email to ${emailData.email}`);
    } catch (error) {
      console.error("Approval email sending error:", error);
    }
  }

  private generateIPFSHash(): string {
    return 'Qm' + require('crypto').randomBytes(22).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 44);
  }
}