import { prisma, InvoiceStatus, type User } from "@repo/database";

export interface DocumentInvoice {
  id: string;
  number: string;
  bookingCode: string;
  amount: string;
  issuedAt: Date;
  paidAt: Date | null;
}

export interface DocumentAttachment {
  id: string;
  bookingCode: string;
  fileName: string;
  mimeType: string;
  url: string;
  createdAt: Date;
}

export async function listDocuments(
  user: User,
): Promise<{ invoices: DocumentInvoice[]; attachments: DocumentAttachment[] }> {
  const [invoices, attachments] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId: user.id, status: InvoiceStatus.PAID },
      include: { booking: { select: { code: true } } },
      orderBy: { paidAt: "desc" },
    }),
    prisma.bookingAttachment.findMany({
      where: { booking: { userId: user.id } },
      include: { booking: { select: { code: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      bookingCode: invoice.booking.code,
      amount: invoice.amount.toString(),
      issuedAt: invoice.issuedAt,
      paidAt: invoice.paidAt,
    })),
    attachments: attachments.map((attachment) => ({
      id: attachment.id,
      bookingCode: attachment.booking.code,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      url: attachment.fileUrl,
      createdAt: attachment.createdAt,
    })),
  };
}
