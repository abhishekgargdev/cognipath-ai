import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = (process.env.SMTP_HOST || '').trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  } else {
    // Development fallback: stream / json transport that logs email payload to console cleanly
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: 'roadmap-start' | 'roadmap-complete' | 'content-generation-complete' | 'daily-questions';
  data: Record<string, any>;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { to, subject, templateName, data } = options;

    const templatesDir = path.join(process.cwd(), 'src', 'lib', 'email', 'templates');
    const templatePath = path.join(templatesDir, `${templateName}.ejs`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template ${templateName}.ejs not found at ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Inject app metadata into template data
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const html = ejs.render(templateContent, {
      ...data,
      appUrl,
      currentYear: new Date().getFullYear(),
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"CogniPath AI" <no-reply@cognipath.ai>',
      to,
      subject,
      html,
    };

    const mailer = getTransporter();
    const info = await mailer.sendMail(mailOptions);

    console.log(`[Email Service] Successfully sent email '${templateName}' to ${to}. MessageId: ${info.messageId || 'json-mode'}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error(`[Email Service Error] Failed to send email '${options.templateName}' to ${options.to}:`, error);
    return {
      success: false,
      error: error?.message || 'Email dispatch failed',
    };
  }
}
