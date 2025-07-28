import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not found. Email notifications will be disabled.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface SignatureRequestEmailData {
  to: string;
  signerName?: string;
  requesterName: string;
  documentTitle: string;
  signatureUrl: string;
  deadline?: Date;
  message?: string;
}

export async function sendSignatureRequestEmail(data: SignatureRequestEmailData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Mock email sent to ${data.to}: Signature request for ${data.documentTitle}`);
    return true;
  }

  try {
    const msg = {
      to: data.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@signchain.app', // 검증된 발신자 이메일 필요
      subject: `서명 요청: ${data.documentTitle}`,
      html: generateSignatureRequestHtml(data),
    };

    await sgMail.send(msg);
    console.log(`Signature request email sent to ${data.to}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

interface ReminderEmailData {
  to: string;
  signerName?: string;
  documentTitle: string;
  signatureUrl: string;
  deadline?: Date;
  daysRemaining: number;
}

export async function sendReminderEmail(data: ReminderEmailData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Mock reminder email sent to ${data.to}`);
    return true;
  }

  try {
    const msg = {
      to: data.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@signchain.app',
      subject: `서명 요청 리마인더: ${data.documentTitle}`,
      html: generateReminderHtml(data),
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Reminder email sending failed:', error);
    return false;
  }
}

interface CompletionEmailData {
  to: string;
  documentTitle: string;
  blockchainTxHash: string;
}

export async function sendCompletionEmail(data: CompletionEmailData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Mock completion email sent to ${data.to}`);
    return true;
  }

  try {
    const msg = {
      to: data.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@signchain.app',
      subject: `서명 완료: ${data.documentTitle}`,
      html: generateCompletionHtml(data),
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Completion email sending failed:', error);
    return false;
  }
}

function generateSignatureRequestHtml(data: SignatureRequestEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; padding: 20px; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 SignChain</h1>
          <h2>서명 요청</h2>
        </div>
        <div class="content">
          <p>안녕하세요${data.signerName ? ` ${data.signerName}님` : ''},</p>
          
          <p><strong>${data.requesterName}</strong>님이 다음 문서에 대한 디지털 서명을 요청했습니다:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0; color: #333;">📄 ${data.documentTitle}</h3>
            ${data.deadline ? `<p style="margin: 10px 0 0 0; color: #666;">⏰ 서명 마감일: ${data.deadline.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
          </div>
          
          ${data.message ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>메시지:</strong><br>
              ${data.message}
            </div>
          ` : ''}
          
          <div class="warning">
            <strong>⚠️ 보안 안내</strong><br>
            이 서명은 Xphere 블록체인에 영구적으로 기록되며 변조가 불가능합니다.
          </div>
          
          <div style="text-align: center;">
            <a href="${data.signatureUrl}" class="button">📝 문서 서명하기</a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            이 링크는 보안을 위해 제한된 시간 동안만 유효합니다. 서명 후 블록체인 트랜잭션 해시를 받게 됩니다.
          </p>
        </div>
        <div class="footer">
          <p>SignChain - 블록체인 기반 전자서명 플랫폼</p>
          <p>이 메일은 자동으로 발송되었습니다.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateReminderHtml(data: ReminderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 15px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .urgent { background: #ffebee; border: 1px solid #f5576c; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 SignChain</h1>
          <h2>서명 요청 리마인더</h2>
        </div>
        <div class="content">
          <p>안녕하세요${data.signerName ? ` ${data.signerName}님` : ''},</p>
          
          <div class="urgent">
            <strong>⏰ 서명 요청이 아직 완료되지 않았습니다</strong><br>
            문서: <strong>${data.documentTitle}</strong><br>
            ${data.deadline ? `마감까지 <strong>${data.daysRemaining}일</strong> 남았습니다.` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${data.signatureUrl}" class="button">지금 서명하기</a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            서명이 완료되지 않으면 요청이 만료될 수 있습니다.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateCompletionHtml(data: CompletionEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .success { background: #e8f5e8; border: 1px solid #4caf50; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .hash { background: #f5f5f5; padding: 10px; border-radius: 3px; font-family: monospace; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ SignChain</h1>
          <h2>서명 완료</h2>
        </div>
        <div class="content">
          <div class="success">
            <h3 style="margin: 0; color: #2e7d32;">🎉 서명이 성공적으로 완료되었습니다!</h3>
            <p style="margin: 10px 0 0 0;">문서: <strong>${data.documentTitle}</strong></p>
          </div>
          
          <p><strong>블록체인 트랜잭션 해시:</strong></p>
          <div class="hash">${data.blockchainTxHash}</div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            이 해시를 사용하여 언제든지 서명의 진위를 확인할 수 있습니다. 
            서명은 Xphere 블록체인에 영구적으로 기록되어 변조가 불가능합니다.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}