import type { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

let transporter: Promise<Transporter> | null = null;

/** nodemailer loads on the first email rather than at cold start. Null when SMTP isn't configured. */
function getTransporter(): Promise<Transporter> | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  transporter ??= import('nodemailer').then(({ default: nodemailer }) =>
    nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    }),
  );
  // A failed load must not stay cached for the life of the instance.
  transporter.catch(() => {
    transporter = null;
  });
  return transporter;
}

interface MailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail(input: MailInput): Promise<void> {
  const pending = getTransporter();
  if (!pending) {
    logger.info({ to: input.to, subject: input.subject }, `Mail transport not configured. Message:\n${input.text}`);
    return;
  }
  try {
    await (await pending).sendMail({ from: env.MAIL_FROM ?? env.SMTP_USER, ...input });
  } catch (error) {
    logger.error({ err: error, to: input.to }, 'Failed to send mail');
  }
}
