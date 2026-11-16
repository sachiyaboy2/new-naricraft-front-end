import { API_URL } from "../utils/config.js";
import { useEffect, useRef, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import axios from "axios";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Lock,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import { clearCart } from "../utils/cart";

import { AuroraBackdrop } from "../components/brand/AuroraBackdrop.jsx";
import { ThemeToggle } from "../components/brand/ThemeToggle.jsx";

// =====================================================
// PENDING PAYMENT CONTEXT
// =====================================================

function getPendingPaymentContext() {
  try {
    const pendingString = sessionStorage.getItem("naricraftPendingPayment");

    if (!pendingString) {
      return null;
    }

    return JSON.parse(pendingString);
  } catch {
    return null;
  }
}

// =====================================================
// CLEAR DATABASE CART
// =====================================================

async function clearPurchasedCart(cartClearedRef, pending) {
  if (cartClearedRef.current) {
    return;
  }

  if (pending?.clearCart !== true) {
    return;
  }

  cartClearedRef.current = true;

  try {
    await clearCart();
  } catch (error) {
    console.error("Cart Clear Error:", error.message);

    // IMPORTANT:
    // Payment already succeeded.
    // Cart clear failure must not
    // change payment status.
  }
}

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("checking");

  const [payment, setPayment] = useState(null);

  const cartClearedRef = useRef(false);

  const verifyRef = useRef(null);

  // =====================================================
  // PAYMENT REFERENCE
  // =====================================================

  const paymentReference = searchParams.get("payment_ref");

  const token = localStorage.getItem("token");

  // A missing reference or a missing token can never be verified.
  const hasContext = Boolean(paymentReference && token);

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  useEffect(() => {
    if (!hasContext) {
      return undefined;
    }

    let stopped = false;

    let timer = null;

    async function verifyPayment(attempt = 0) {
      if (stopped) {
        return;
      }

      try {
        const response = await axios.get(
          API_URL +
            "/api/payments/status/" +
            encodeURIComponent(paymentReference),

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (stopped) {
          return;
        }

        const data = response.data;

        setPayment(data);

        // =======================================
        // VERIFIED SUCCESS
        // =======================================

        if (
          data.paymentAttemptStatus === "Success" &&
          (data.paymentStatus === "Paid" ||
            data.paymentStatus === "Partially Paid")
        ) {
          const pending = getPendingPaymentContext();

          if (pending?.paymentReference === paymentReference) {
            await clearPurchasedCart(cartClearedRef, pending);
          }

          sessionStorage.removeItem("naricraftPendingPayment");

          setStatus("success");

          return;
        }

        // =======================================
        // FAILED / CANCELLED / CHARGEDBACK
        // =======================================

        if (
          ["Failed", "Cancelled", "Chargedback"].includes(
            data.paymentAttemptStatus,
          )
        ) {
          setStatus("failed");

          sessionStorage.removeItem("naricraftPendingPayment");

          return;
        }

        // =======================================
        // CALLBACK MAY TAKE A MOMENT
        //
        // 15 checks × 2 sec ≈ 30 sec
        // =======================================

        if (attempt >= 14) {
          setStatus("pending");

          return;
        }

        timer = setTimeout(() => {
          verifyPayment(attempt + 1);
        }, 2000);
      } catch (error) {
        console.error("Payment Verification Error:", error.message);

        if (stopped) {
          return;
        }

        if (error.response?.status === 401) {
          setStatus("error");

          return;
        }

        if (attempt >= 14) {
          setStatus("error");

          return;
        }

        timer = setTimeout(() => {
          verifyPayment(attempt + 1);
        }, 2000);
      }
    }

    verifyRef.current = () => {
      verifyPayment(0);
    };

    verifyPayment();

    return () => {
      stopped = true;

      verifyRef.current = null;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [hasContext, paymentReference, token]);

  // =====================================================
  // MY ORDERS LINK
  // =====================================================

  const ordersLinkState = {
    tab: payment?.orderType === "custom" ? "custom" : "products",
  };

  const currentStatus = hasContext ? status : "error";

  // =====================================================
  // RETRY
  // =====================================================

  const handleRetry = () => {
    setPayment(null);

    setStatus("checking");

    verifyRef.current?.();
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-canvas text-ink">
      <AuroraBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12">
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
          {/* =========================================
              CHECKING
          ========================================= */}

          {currentStatus === "checking" && (
            <>
              <span className="pulse-dot mx-auto flex size-20 items-center justify-center rounded-full border border-line bg-surface text-warning shadow-[var(--shadow-e2)]">
                <Loader2
                  size={36}
                  aria-hidden="true"
                  className="animate-spin"
                />
              </span>

              <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink">
                Verifying Payment
              </h1>

              <p className="mt-3 text-sm leading-6 text-ink-muted">
                Please wait while we securely confirm your payment.
              </p>

              <div className="mx-auto mt-6 flex max-w-xs items-center gap-3">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <span className="block h-full w-1/2 animate-pulse rounded-full bg-aurora-500" />
                </span>

                <span className="text-xs font-semibold text-ink-muted">
                  Checking
                </span>
              </div>
            </>
          )}

          {/* =========================================
              SUCCESS
          ========================================= */}

          {currentStatus === "success" && (
            <>
              <span className="pulse-dot mx-auto flex size-20 items-center justify-center rounded-full border border-success/40 bg-success/12 text-success">
                <CheckCircle2 size={38} aria-hidden="true" />
              </span>

              <span className="badge badge-success mt-6">
                <CheckCircle2 size={14} aria-hidden="true" />

                Payment confirmed
              </span>

              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {payment?.paymentStatus === "Partially Paid"
                  ? "Advance Payment Successful"
                  : "Payment Successful"}
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-muted">
                Your NariCraft payment has been securely verified.
              </p>

              {payment && (
                <div className="surface mt-7 space-y-3 p-5 text-left">
                  <Row label="Order" value={payment.orderId} />

                  <Row
                    label="Order Type"
                    value={
                      payment.orderType === "custom"
                        ? "Custom Order"
                        : "Product Order"
                    }
                  />

                  <Row label="Payment Plan" value={payment.paymentPlan} />

                  <Row label="Payment Status" value={payment.paymentStatus} />

                  <Row
                    label="Paid"
                    value={`LKR ${Number(
                      payment.paidAmount || 0,
                    ).toLocaleString()}`}
                  />

                  <Row
                    label="Remaining"
                    value={`LKR ${Number(
                      payment.remainingAmount || 0,
                    ).toLocaleString()}`}
                  />

                  <Row label="Balance Status" value={payment.balanceStatus} />
                </div>
              )}

              {/* HALF PAYMENT NOTICE */}

              {payment?.paymentStatus === "Partially Paid" && (
                <div className="mt-5 rounded-lg border border-info/40 bg-info/10 p-5 text-left">
                  <p className="font-display text-sm font-bold text-info">
                    50% Advance Paid ✅
                  </p>

                  <p className="mt-2 text-sm leading-6 text-ink-2">
                    Remaining balance:{" "}
                    <strong className="font-semibold text-ink">
                      LKR {Number(payment.remainingAmount || 0).toLocaleString()}
                    </strong>
                    . This amount can be collected on delivery.
                  </p>
                </div>
              )}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/orders"
                  state={ordersLinkState}
                  className="btn btn-primary py-3"
                >
                  <ShoppingBag size={18} aria-hidden="true" />

                  View My Orders
                </Link>

                <Link to="/products" className="btn btn-secondary py-3">
                  Continue Shopping
                </Link>
              </div>
            </>
          )}

          {/* =========================================
              PENDING
          ========================================= */}

          {currentStatus === "pending" && (
            <>
              <span className="pulse-dot mx-auto flex size-20 items-center justify-center rounded-full border border-warning/40 bg-warning/12 text-warning">
                <Clock3 size={38} aria-hidden="true" />
              </span>

              <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink">
                Payment Verification Pending
              </h1>

              <p className="mt-3 text-sm leading-6 text-ink-muted">
                The gateway response is taking longer than expected. Do not make
                another payment yet.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/orders"
                  state={ordersLinkState}
                  className="btn btn-primary py-3"
                >
                  <ShoppingBag size={18} aria-hidden="true" />

                  Check My Orders
                </Link>

                <Link to="/" className="btn btn-secondary py-3">
                  Back to Home
                </Link>
              </div>
            </>
          )}

          {/* =========================================
              FAILED / ERROR
          ========================================= */}

          {(currentStatus === "failed" || currentStatus === "error") && (
            <>
              <span className="pulse-dot mx-auto flex size-20 items-center justify-center rounded-full border border-danger/40 bg-danger/12 text-danger">
                <AlertTriangle size={38} aria-hidden="true" />
              </span>

              <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink">
                Payment Not Verified
              </h1>

              <p className="mt-3 text-sm leading-6 text-ink-muted">
                We could not confirm this payment. Please check your order before
                trying again.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/orders"
                  state={ordersLinkState}
                  className="btn btn-primary py-3"
                >
                  <ShoppingBag size={18} aria-hidden="true" />

                  View My Orders
                </Link>

                {hasContext ? (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="btn btn-secondary py-3"
                  >
                    <RefreshCw size={18} aria-hidden="true" />

                    Try again
                  </button>
                ) : (
                  <Link to="/" className="btn btn-secondary py-3">
                    Back to Home
                  </Link>
                )}
              </div>
            </>
          )}

          {/* =========================================
              SECURITY MESSAGE
          ========================================= */}

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-muted">
            <Lock size={13} aria-hidden="true" />

            Secure payment verification
          </p>
        </section>
      </div>
    </main>
  );
}

// =====================================================
// ROW
// =====================================================

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-ink-muted">{label}</span>

      <span className="text-right font-display font-semibold text-ink">
        {value || "-"}
      </span>
    </div>
  );
}
