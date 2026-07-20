import puppeteer, { type Browser } from "puppeteer";
import { prisma, type Invoice } from "@repo/database";
import { createStorageDriver } from "@repo/storage";
import { logger } from "@repo/logger";

type InvoiceWithDetails = Invoice & {
  user: { name: string; email: string };
  booking: {
    code: string;
    scheduledAt: Date;
    problemDescription: string;
    property: { addressLine: string; city: string };
    service: { title: string } | null;
  };
};

function invoiceStorageKey(number: string) {
  return `invoices/${number}.pdf`;
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { dateStyle: "long" });
}

function renderInvoiceHtml(invoice: InvoiceWithDetails): string {
  const serviceTitle = invoice.booking.service?.title ?? "Service charge";
  const amount = formatCurrency(Number(invoice.amount));
  const address = `${invoice.booking.property.addressLine}, ${invoice.booking.property.city}`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1a1a1a;
    padding: 56px;
    font-size: 14px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #0f766e;
    padding-bottom: 20px;
    margin-bottom: 32px;
  }
  .brand { font-size: 20px; font-weight: 700; color: #0f766e; }
  .brand-sub { font-size: 12px; color: #555; margin-top: 4px; }
  .invoice-meta { text-align: right; }
  .invoice-meta h1 { font-size: 22px; margin: 0 0 6px; }
  .status {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    background: #dcfce7;
    color: #15803d;
  }
  .grid { display: flex; justify-content: space-between; margin-bottom: 32px; }
  .grid h3 { font-size: 12px; text-transform: uppercase; color: #888; margin: 0 0 8px; }
  .grid p { margin: 0; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e5e5e5; }
  th { font-size: 12px; text-transform: uppercase; color: #888; }
  .amount-col { text-align: right; }
  .total-row td { border-bottom: none; border-top: 2px solid #1a1a1a; font-weight: 700; font-size: 16px; }
  .footer { margin-top: 48px; font-size: 12px; color: #888; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Seepage Leakage All Solutions</div>
      <div class="brand-sub">Bhubaneswar &middot; Cuttack &middot; Puri &middot; Rourkela</div>
    </div>
    <div class="invoice-meta">
      <h1>Invoice</h1>
      <div>${invoice.number}</div>
      <div class="status">PAID</div>
    </div>
  </div>

  <div class="grid">
    <div>
      <h3>Billed to</h3>
      <p>${invoice.user.name}</p>
      <p>${invoice.user.email}</p>
      <p>${address}</p>
    </div>
    <div>
      <h3>Booking</h3>
      <p>Code: ${invoice.booking.code}</p>
      <p>Scheduled: ${formatDate(invoice.booking.scheduledAt)}</p>
      <p>Issued: ${formatDate(invoice.issuedAt)}</p>
      <p>Paid: ${invoice.paidAt ? formatDate(invoice.paidAt) : "—"}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="amount-col">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          ${serviceTitle}
          <div style="color:#888;font-size:12px;margin-top:4px;">${invoice.booking.problemDescription}</div>
        </td>
        <td class="amount-col">${amount}</td>
      </tr>
      <tr class="total-row">
        <td>Total paid</td>
        <td class="amount-col">${amount}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">Thank you for choosing Seepage Leakage All Solutions.</div>
</body>
</html>`;
}

let browserPromise: Promise<Browser> | undefined;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
}

async function renderPdfBuffer(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

export async function generateAndStoreInvoicePdf(invoiceId: string): Promise<string> {
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: {
      user: { select: { name: true, email: true } },
      booking: {
        select: {
          code: true,
          scheduledAt: true,
          problemDescription: true,
          property: { select: { addressLine: true, city: true } },
          service: { select: { title: true } },
        },
      },
    },
  });

  const html = renderInvoiceHtml(invoice);
  const pdf = await renderPdfBuffer(html);
  const key = invoiceStorageKey(invoice.number);

  await createStorageDriver().upload(key, pdf, { contentType: "application/pdf" });
  await prisma.invoice.update({ where: { id: invoice.id }, data: { pdfKey: key } });

  logger.info(`Generated invoice PDF for ${invoice.number}`);
  return key;
}

export async function closePdfBrowser(): Promise<void> {
  if (!browserPromise) return;
  const browser = await browserPromise;
  await browser.close();
  browserPromise = undefined;
}
