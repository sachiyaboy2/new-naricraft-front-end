import { Link, useSearchParams } from "react-router-dom";

import { ArrowLeft, ShoppingBag, XCircle } from "lucide-react";

import { AuroraBackdrop } from "../components/brand/AuroraBackdrop.jsx";
import { ThemeToggle } from "../components/brand/ThemeToggle.jsx";

export default function PaymentCancelledPage() {
  const [searchParams] = useSearchParams();

  // =====================================================
  // PAYMENT REFERENCE
  // =====================================================

  const paymentReference = searchParams.get("payment_ref");

  // =====================================================
  // PAYMENT CONTEXT
  // =====================================================

  let paymentContext = null;

  try {
    const pendingString = sessionStorage.getItem("naricraftPendingPayment");

    if (pendingString) {
      paymentContext = JSON.parse(pendingString);
    }
  } catch {
    paymentContext = null;
  }

  // =====================================================
  // ORDER TAB
  // =====================================================

  const ordersLinkState = {
    tab: paymentContext?.orderType === "custom" ? "custom" : "products",
  };

  // IMPORTANT
  //
  // Do NOT clear the database cart here.
  //
  // Payment has NOT been verified as successful.
  // =====================================================

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-canvas text-ink">
      <AuroraBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col px-4 py-8 sm:px-6 sm:py-12">
        {/* =========================================
            TOP BAR
        ========================================= */}

        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/" className="btn btn-ghost gap-2 px-3">
            <ArrowLeft size={16} aria-hidden="true" />

            Back to home
          </Link>

          <ThemeToggle />
        </div>

        {/* =========================================
            PANEL
        ========================================= */}

        <section className="glass pop-in rounded-2xl p-6 text-center shadow-[var(--shadow-e4)] sm:p-10">
          <span className="pulse-dot mx-auto flex size-20 items-center justify-center rounded-full border border-danger/40 bg-danger/12 text-danger">
            <XCircle size={38} aria-hidden="true" />
          </span>

          <span className="badge badge-danger mt-6">Payment cancelled</span>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Payment Cancelled
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-muted">
            Your payment was not completed. No successful payment has been
            recorded.
          </p>

          {/* =========================================
              INFO
          ========================================= */}

          <div className="mt-6 rounded-lg border border-warning/40 bg-warning/10 p-5 text-left">
            <p className="font-display text-sm font-bold text-warning">
              Your order is still safe.
            </p>

            <p className="mt-2 text-sm leading-6 text-ink-2">
              You can return to My Orders and try the payment again. Your
              shopping cart has not been cleared.
            </p>
          </div>

          {/* =========================================
              PAYMENT REFERENCE
          ========================================= */}

          {paymentReference && (
            <div className="mt-5 rounded-lg border border-line bg-surface-2 p-4 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                Payment Reference
              </p>

              <p className="mt-2 break-all font-mono text-xs font-semibold text-aurora-600 dark:text-aurora-300">
                {paymentReference}
              </p>
            </div>
          )}

          {/* =========================================
              BUTTONS
          ========================================= */}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              to="/orders"
              state={ordersLinkState}
              onClick={() => {
                sessionStorage.removeItem("naricraftPendingPayment");
              }}
              className="btn btn-primary py-3"
            >
              <ShoppingBag size={18} aria-hidden="true" />

              View My Orders
            </Link>

            <Link to="/products" className="btn btn-secondary py-3">
              Continue Shopping
            </Link>
          </div>

          <Link
            to="/"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-ink-2 transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft size={16} aria-hidden="true" />

            Back to Home
          </Link>
        </section>
      </div>
    </main>
  );
}
