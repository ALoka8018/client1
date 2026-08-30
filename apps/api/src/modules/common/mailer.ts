import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS must be set to send email",
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail({ to, subject, html, text }: SendMailInput) {
  const from = process.env.MAIL_FROM ?? process.env.SMTP_USER;

  return getTransporter().sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}
