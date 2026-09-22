import { useCallback, useState } from "react";
import { site } from "@/data/site";

/**
 * Carries over the "Make a Payment" form from the previous site.
 *
 * It talks to the same three endpoints server.py has always exposed —
 * /api/config, /api/create-order and /api/verify-payment — so the Razorpay
 * flow, the order creation and the signature check are unchanged. The secret
 * key stays on the server; the browser only ever sees the public key id.
 */

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; message: string }
  | { kind: "failed"; message: string };

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: { error: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Load Razorpay's script the first time someone actually wants to pay. */
function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay")));
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay"));
    document.body.appendChild(script);
  });
}

export function PaymentForm() {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const pay = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const rupees = Number(amount);
      const paise = Math.round(rupees * 100);
      if (!Number.isFinite(rupees) || paise < 100) {
        setStatus({ kind: "failed", message: "Please enter an amount of at least ₹1." });
        return;
      }

      setStatus({ kind: "working" });
      try {
        await loadCheckout();
        const [configResponse, orderResponse] = await Promise.all([
          fetch("/api/config"),
          fetch("/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: paise }),
          }),
        ]);
        const config = await configResponse.json();
        const order = await orderResponse.json();
        if (!configResponse.ok || !orderResponse.ok) {
          throw new Error(order?.error ?? "Unable to start the payment.");
        }
        if (!window.Razorpay) throw new Error("Could not load Razorpay.");

        const checkout = new window.Razorpay({
          key: config.key_id,
          amount: order.amount,
          currency: order.currency,
          name: site.name,
          description: reference.trim() || "Artwork payment",
          order_id: order.order_id,
          prefill: {},
          notes: reference.trim() ? { reference: reference.trim() } : {},
          handler: async (response: RazorpayResponse) => {
            const verification = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verification.json();
            if (!verification.ok || !result.success) {
              setStatus({
                kind: "failed",
                message:
                  result?.error ??
                  "The payment went through but could not be verified. Please write to me.",
              });
              return;
            }
            setStatus({
              kind: "done",
              message: "Payment received and verified. Thank you — I'll be in touch.",
            });
            setAmount("");
            setReference("");
          },
          modal: {
            ondismiss: () => setStatus({ kind: "idle" }),
          },
          theme: { color: "#8a5a44" },
        });

        checkout.on("payment.failed", (response) =>
          setStatus({
            kind: "failed",
            message: response.error?.description ?? "The payment failed. Please try again.",
          }),
        );
        checkout.open();
      } catch (error) {
        setStatus({
          kind: "failed",
          message:
            error instanceof Error ? error.message : "Unable to start the payment.",
        });
      }
    },
    [amount, reference],
  );

  if (status.kind === "done") {
    return (
      <div className="mt-6 border-t border-line pt-6">
        <p className="font-display text-xl text-ink">Thank you.</p>
        <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-stone">{status.message}</p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-5 text-sm text-ink transition-colors hover:text-clay"
        >
          Make another payment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="mt-6 border-t border-line pt-6">
      <p className="eyebrow">Make a payment</p>
      <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-pretty text-stone">
        Once we've agreed on a piece and a price, you can pay here. Card, UPI and
        net banking are all accepted.
      </p>

      <div className="mt-5 grid gap-4 sm:max-w-sm">
        <label className="block">
          <span className="text-xs tracking-[0.12em] text-stone uppercase">Amount (₹)</span>
          <input
            type="number"
            min="1"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Amount in rupees"
            className="mt-2 w-full border-b border-line bg-transparent py-2.5 text-ink outline-none placeholder:text-stone/60 focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="text-xs tracking-[0.12em] text-stone uppercase">
            Which piece <span className="normal-case">(optional)</span>
          </span>
          <input
            type="text"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="e.g. The Midnight Tide"
            className="mt-2 w-full border-b border-line bg-transparent py-2.5 text-ink outline-none placeholder:text-stone/60 focus:border-ink"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status.kind === "working"}
        className="mt-6 inline-flex items-center rounded-xs bg-clay px-7 py-2.5 text-sm text-paper ring-1 ring-clay/20 transition-colors hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.kind === "working" ? "Preparing…" : "Pay securely"}
      </button>

      {status.kind === "failed" && (
        <p className="mt-4 max-w-[42ch] text-sm text-clay" role="alert">
          {status.message} You can always write to{" "}
          <a href={`mailto:${site.email}`} className="underline underline-offset-2">
            {site.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
