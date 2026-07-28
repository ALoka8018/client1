"use client";

import { useState } from "react";
import { Button, type ButtonSize } from "@repo/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { loadRazorpayScript } from "@/lib/razorpay";

interface PayNowButtonProps {
  invoiceId: string;
  /** Decimal string, rupees (e.g. "450.00") */
  amount: string;
  label?: string;
  size?: ButtonSize;
  className?: string;
  onPaid?: (invoice: unknown) => void;
}

type OrderResponse = {
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
  invoiceNumber: string;
};

export function PayNowButton({
  invoiceId,
  amount,
  label,
  size = "md",
  className,
  onPaid,
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const handleClick = async () => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Your session expired. Please sign in again.");
        setLoading(false);
        return;
      }

      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/payments/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ invoiceId }),
        },
      );

      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => null);
        setError(body?.error ?? "Could not start payment. Please try again.");
        setLoading(false);
        return;
      }

      const order = (await orderRes.json()) as OrderResponse;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setError("Could not load the payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Seepage Leakage All Solutions",
        description: `Invoice ${order.invoiceNumber}`,
        order_id: order.orderId,
        prefill: {
          email: session.user?.email ?? undefined,
        },
        theme: {
          color: "#240046",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/v1/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              },
            );

            if (!verifyRes.ok) {
              const body = await verifyRes.json().catch(() => null);
              setError(
                body?.error ?? "Payment verification failed. Please contact support.",
              );
              setLoading(false);
              return;
            }

            const updatedInvoice = await verifyRes.json();
            setPaid(true);
            onPaid?.(updatedInvoice);
          } catch {
            setError("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
      });

      razorpay.open();
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
        <span className="material-icon text-sm">check_circle</span>
        Paid
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="accent"
        size={size}
        className={className}
        disabled={loading}
        onClick={handleClick}
      >
        {loading ? "Processing…" : (label ?? `Pay ₹${amount}`)}
      </Button>
      {error && (
        <p className="font-sans text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
