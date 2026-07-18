export interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler(response: RazorpayHandlerResponse): void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?(): void;
  };
}

export interface RazorpayInstance {
  open(): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Dynamically injects the Razorpay Checkout script into the page if it isn't
 * already present. Resolves `true` once the script has loaded (or was already
 * loaded), `false` if it fails to load. No-ops (resolves `false`) on the
 * server since `document` is unavailable during SSR.
 */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
  );

  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      // In case it already finished loading before we attached listeners.
      if (window.Razorpay) resolve(true);
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
