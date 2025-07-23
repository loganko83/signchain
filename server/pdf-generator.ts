import { Document, Signature } from "@shared/schema";

interface PDFGenerationOptions {
  document: Document;
  signatures: Signature[];
  includeSignatures: boolean;
  includeBlockchainInfo: boolean;
}

export async function generateSignedDocumentPDF(options: PDFGenerationOptions): Promise<Buffer> {
  const { document, signatures, includeSignatures, includeBlockchainInfo } = options;
  
  // Mock PDF generation - in a real implementation, you would use a library like PDF-lib or Puppeteer
  const pdfContent = generatePDFContent(options);
  
  // Convert to buffer (mock implementation)
  return Buffer.from(pdfContent, 'utf-8');
}

function generatePDFContent(options: PDFGenerationOptions): string {
  const { document, signatures, includeSignatures, includeBlockchainInfo } = options;
  
  let content = `
SignChain - 전자서명 문서
=========================

문서 정보:
- 제목: ${document.title}
- 업로드일: ${document.createdAt ? new Date(document.createdAt).toLocaleDateString('ko-KR') : 'N/A'}
- 파일 타입: ${document.fileType}
- 파일 크기: ${Math.round(document.fileSize / 1024)} KB
- 파일 해시: ${document.fileHash}
- IPFS 해시: ${document.ipfsHash}

`;

  if (document.description) {
    content += `설명: ${document.description}\n\n`;
  }

  if (includeSignatures && signatures.length > 0) {
    content += `디지털 서명 목록 (${signatures.length}개):\n`;
    content += "=" + "=".repeat(30) + "\n\n";
    
    signatures.forEach((signature, index) => {
      content += `${index + 1}. 서명자: ${signature.signerEmail}\n`;
      content += `   서명일: ${signature.signedAt ? new Date(signature.signedAt).toLocaleString('ko-KR') : 'N/A'}\n`;
      content += `   서명 타입: ${signature.signatureType}\n`;
      if (signature.blockchainTxHash) {
        content += `   블록체인 해시: ${signature.blockchainTxHash}\n`;
      }
      content += `   서명 데이터: ${signature.signatureData.substring(0, 50)}...\n\n`;
    });
  }

  if (includeBlockchainInfo && document.blockchainTxHash) {
    content += `블록체인 검증 정보:\n`;
    content += "=" + "=".repeat(20) + "\n";
    content += `트랜잭션 해시: ${document.blockchainTxHash}\n`;
    content += `상태: ${document.status}\n`;
    content += `네트워크: Xphere 블록체인\n`;
    content += `검증 상태: 검증됨\n\n`;
  }

  content += `이 문서는 SignChain 플랫폼에서 생성되었으며,\n`;
  content += `블록체인 기술을 통해 무결성이 보장됩니다.\n\n`;
  content += `생성일: ${new Date().toLocaleString('ko-KR')}\n`;
  content += `플랫폼: SignChain (https://signchain.app)\n`;

  return content;
}

export interface DocumentDownloadOptions {
  includeSignatures: boolean;
  includeAuditTrail: boolean;
  includeBlockchainProof: boolean;
  format: 'pdf' | 'json' | 'xml';
}

export async function generateDocumentPackage(
  document: Document, 
  signatures: Signature[], 
  options: DocumentDownloadOptions
): Promise<{ filename: string; content: Buffer; mimeType: string }> {
  
  switch (options.format) {
    case 'pdf':
      const pdfBuffer = await generateSignedDocumentPDF({
        document,
        signatures,
        includeSignatures: options.includeSignatures,
        includeBlockchainInfo: options.includeBlockchainProof,
      });
      
      return {
        filename: `${document.title}_signed.pdf`,
        content: pdfBuffer,
        mimeType: 'application/pdf'
      };
      
    case 'json':
      const jsonData = {
        document: {
          ...document,
          createdAt: document.createdAt?.toISOString(),
        },
        signatures: options.includeSignatures ? signatures.map(sig => ({
          ...sig,
          signedAt: sig.signedAt?.toISOString(),
        })) : [],
        metadata: {
          exportedAt: new Date().toISOString(),
          platform: 'SignChain',
          version: '1.0',
          includeSignatures: options.includeSignatures,
          includeBlockchainProof: options.includeBlockchainProof,
        }
      };
      
      return {
        filename: `${document.title}_data.json`,
        content: Buffer.from(JSON.stringify(jsonData, null, 2)),
        mimeType: 'application/json'
      };
      
    case 'xml':
      const xmlContent = generateXMLContent(document, signatures, options);
      return {
        filename: `${document.title}_data.xml`,
        content: Buffer.from(xmlContent),
        mimeType: 'application/xml'
      };
      
    default:
      throw new Error('Unsupported format');
  }
}

function generateXMLContent(
  document: Document, 
  signatures: Signature[], 
  options: DocumentDownloadOptions
): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<signchain-document>\n';
  
  xml += '  <document>\n';
  xml += `    <id>${document.id}</id>\n`;
  xml += `    <title><![CDATA[${document.title}]]></title>\n`;
  xml += `    <fileType>${document.fileType}</fileType>\n`;
  xml += `    <fileSize>${document.fileSize}</fileSize>\n`;
  xml += `    <fileHash>${document.fileHash}</fileHash>\n`;
  xml += `    <ipfsHash>${document.ipfsHash}</ipfsHash>\n`;
  xml += `    <status>${document.status}</status>\n`;
  xml += `    <createdAt>${document.createdAt?.toISOString() || ''}</createdAt>\n`;
  
  if (options.includeBlockchainProof && document.blockchainTxHash) {
    xml += `    <blockchainTxHash>${document.blockchainTxHash}</blockchainTxHash>\n`;
  }
  
  xml += '  </document>\n';
  
  if (options.includeSignatures && signatures.length > 0) {
    xml += '  <signatures>\n';
    signatures.forEach(signature => {
      xml += '    <signature>\n';
      xml += `      <id>${signature.id}</id>\n`;
      xml += `      <signerEmail><![CDATA[${signature.signerEmail}]]></signerEmail>\n`;
      xml += `      <signatureType>${signature.signatureType}</signatureType>\n`;
      xml += `      <signedAt>${signature.signedAt?.toISOString() || ''}</signedAt>\n`;
      if (signature.blockchainTxHash) {
        xml += `      <blockchainTxHash>${signature.blockchainTxHash}</blockchainTxHash>\n`;
      }
      xml += `      <signatureData><![CDATA[${signature.signatureData}]]></signatureData>\n`;
      xml += '    </signature>\n';
    });
    xml += '  </signatures>\n';
  }
  
  xml += '  <metadata>\n';
  xml += `    <exportedAt>${new Date().toISOString()}</exportedAt>\n`;
  xml += `    <platform>SignChain</platform>\n`;
  xml += `    <version>1.0</version>\n`;
  xml += '  </metadata>\n';
  xml += '</signchain-document>\n';
  
  return xml;
}