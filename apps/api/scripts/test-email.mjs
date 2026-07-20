// Quick standalone test: sends one email via the app's SMTP config using nodemailer.
// Reads SMTP_HOST/PORT/USER/PASS/MAIL_FROM from apps/api/.env (not committed).
// Usage: node apps/api/scripts/test-email.mjs [recipient@example.com]

import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

function loadEnv() {
  const envPath = path.resolve(import.meta.dirname, "../.env");
  const contents = fs.readFileSync(envPath, "utf8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.error("Missing SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in apps/api/.env");
  process.exit(1);
}

const to = process.argv[2];
if (!to) {
  console.error("Usage: node apps/api/scripts/test-email.mjs <recipient@example.com>");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const info = await transporter.sendMail({
  from: MAIL_FROM || SMTP_USER,
  to,
  subject: "Nodemailer test email",
  text: "This is a test email sent via nodemailer + SMTP.",
  html: "<p>This is a test email sent via <strong>nodemailer</strong> + SMTP.</p>",
});

console.log("Message sent:", info.messageId);
