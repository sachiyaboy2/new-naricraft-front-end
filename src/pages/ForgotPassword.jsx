import { API_URL } from "../utils/config.js";
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";

import axios from "axios";

import { toast } from "react-hot-toast";

import { AuroraBackdrop } from "../components/brand/AuroraBackdrop.jsx";
import { Reveal } from "../components/brand/useReveal.jsx";
import { ThemeToggle } from "../components/brand/ThemeToggle.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const navigate = useNavigate();

  // =====================================================
  // STEPS
  // =====================================================

  const [step, setStep] = useState(1);

  // =====================================================
  // FORM
  // =====================================================

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [formError, setFormError] = useState("");

  // =====================================================
  // SEND OTP
  // =====================================================

  async function sendOTP(e) {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrors({ email: "Please enter your email address." });

      toast.error("Please enter your email address");

      return;
    }

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setErrors({ email: "Enter a valid email address." });

      toast.error("Enter a valid email address");

      return;
    }

    setErrors({});

    setFormError("");

    try {
      setLoading(true);

      const response = await axios.post(
        API_URL + "/api/users/forgot-password/send-otp",

        {
          email: cleanEmail,
        },
      );

      toast.success(response.data.message);

      setStep(2);
    } catch (err) {
      console.log("Send OTP Error:", err);

      const message = err.response?.data?.message || "Failed to send OTP";

      setFormError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  async function resetPassword(e) {
    e.preventDefault();

    const nextErrors = {};

    if (otp.trim().length !== 6) {
      nextErrors.otp = "Please enter the 6 digit OTP.";
    }

    if (!newPassword) {
      nextErrors.newPassword = "Password is required.";
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");

      return;
    }

    setFormError("");

    try {
      setLoading(true);

      const response = await axios.post(
        API_URL + "/api/users/forgot-password/reset",

        {
          email: email.trim().toLowerCase(),

          otp: otp.trim(),

          newPassword: newPassword,
        },
      );

      toast.success(response.data.message);

      navigate("/login");
    } catch (err) {
      console.log("Password Reset Error:", err);

      const message = err.response?.data?.message || "Password reset failed";

      setFormError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-canvas text-ink">
      <AuroraBackdrop />

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Link to="/" className="btn btn-ghost gap-2 px-3">
          <ArrowLeft size={16} aria-hidden="true" />

          Back to home
        </Link>

        <ThemeToggle />
      </div>

      {/* =================================================
          SPLIT LAYOUT
      ================================================= */}

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* ===============================================
            VISUAL PANEL
        =============================================== */}

        <Reveal
          immediate
          className="relative overflow-hidden rounded-2xl border border-line bg-canvas-2 p-6 shadow-[var(--shadow-e2)] sm:p-9"
        >
          <AuroraBackdrop />

          <div className="relative z-10 flex h-full flex-col">
            {/* BRAND MARK */}

            <Link to="/" className="inline-flex w-max items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-e1)]">
                <img
                  src="/logo.png"
                  alt="NariCraft logo"
                  className="size-full object-contain"
                />
              </span>

              <span>
                <span className="block font-display text-2xl font-extrabold tracking-tight text-ink">
                  Nari
                  <span className="text-aurora-600 dark:text-aurora-300">
                    Craft
                  </span>
                </span>

                <span className="block text-[10px] font-semibold tracking-[0.3em] text-ink-muted">
                  TAILORED FOR YOU
                </span>
              </span>
            </Link>

            {/* COPY */}

            <div className="mt-8">
              <span className="badge badge-accent">
                <ShieldCheck size={14} aria-hidden="true" />

                Secure Account Recovery
              </span>

              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                Back in.
                <br />
                <span className="shimmer-text">In minutes.</span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-ink-2">
                ඔබේ account එකට ආපසු ගියාගන්න — email එකට verification code එකක්
                ලැබෙනවා, ඉන්පසු අලුත් password එකක් set කරන්න.
              </p>

              <ul className="mt-7 grid gap-3">
                <Feature
                  icon={<Mail size={17} />}
                  title="Email Verification"
                  sub="6 digit OTP එකක්"
                />

                <Feature
                  icon={<LockKeyhole size={17} />}
                  title="Encrypted Reset"
                  sub="ඔබේ details ආරක්ෂිතයි"
                />

                <Feature
                  icon={<CheckCircle2 size={17} />}
                  title="Instant Access"
                  sub="ඔබේ orders එක තැනකින්"
                />
              </ul>
            </div>

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-muted">
              <span className="text-aurora-500">✦</span> Crafted with love in Sri
              Lanka
            </p>
          </div>
        </Reveal>

        {/* ===============================================
            FORM PANEL
        =============================================== */}

        <Reveal
          immediate
          delay={120}
          className="glass rounded-2xl p-6 shadow-[var(--shadow-e4)] sm:p-8"
        >
          {/* HEADER */}

          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-aurora-500 shadow-[var(--shadow-e1)]">
              <ShieldCheck size={26} aria-hidden="true" />
            </span>

            <div>
              <span className="badge badge-accent">
                {step === 1 ? "STEP 1 OF 2" : "STEP 2 OF 2"}
              </span>

              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">
                Forgot Password?
              </h2>

              <p className="mt-2 text-sm text-ink-muted">
                {step === 1
                  ? "Enter your email address to receive a verification code."
                  : "Enter the OTP we sent to your email and choose a new password."}
              </p>
            </div>
          </div>

          {/* STEP PROGRESS */}

          <div className="mt-6 flex items-center gap-2" aria-hidden="true">
            <span className="h-1.5 flex-1 rounded-full bg-aurora-500" />

            <span
              className={`h-1.5 flex-1 rounded-full ${
                step === 2 ? "bg-aurora-500" : "bg-line"
              }`}
            />
          </div>

          {/* SERVER ERROR */}

          {formError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-lg border border-danger/40 bg-danger/10 p-3.5 text-sm text-danger"
            >
              <AlertCircle size={18} aria-hidden="true" className="mt-0.5" />

              <span>{formError}</span>
            </div>
          )}

          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 && (
            <form onSubmit={sendOTP} noValidate className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="forgot-email">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  />

                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={
                      errors.email ? "forgot-email-error" : undefined
                    }
                    className={`field pl-10 ${
                      errors.email ? "field-invalid" : ""
                    }`}
                  />
                </div>

                {errors.email && (
                  <p
                    id="forgot-email-error"
                    className="mt-1.5 text-xs font-semibold text-danger"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3"
              >
                {loading ? (
                  <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                ) : (
                  <Send size={18} aria-hidden="true" />
                )}

                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* =================================================
              STEP 2
          ================================================= */}

          {step === 2 && (
            <form onSubmit={resetPassword} noValidate className="mt-6 space-y-4">
              {/* EMAIL INFO */}

              <div className="rounded-lg border border-line bg-surface-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  OTP sent to
                </p>

                <p className="mt-1 break-all font-mono text-sm font-semibold text-ink">
                  {email}
                </p>
              </div>

              {/* OTP */}

              <div>
                <label className="label" htmlFor="forgot-otp">
                  Verification Code
                </label>

                <div className="relative">
                  <KeyRound
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  />

                  <input
                    id="forgot-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      setOtp(value);
                    }}
                    placeholder="Enter 6 digit OTP"
                    required
                    aria-invalid={errors.otp ? "true" : "false"}
                    aria-describedby={errors.otp ? "forgot-otp-error" : undefined}
                    className={`field pl-10 font-mono tracking-[0.4em] ${
                      errors.otp ? "field-invalid" : ""
                    }`}
                  />
                </div>

                {errors.otp && (
                  <p
                    id="forgot-otp-error"
                    className="mt-1.5 text-xs font-semibold text-danger"
                  >
                    {errors.otp}
                  </p>
                )}
              </div>

              {/* NEW PASSWORD */}

              <div>
                <label className="label" htmlFor="forgot-new-password">
                  New Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  />

                  <input
                    id="forgot-new-password"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    aria-invalid={
                      errors.newPassword ? "true" : "false"
                    }
                    aria-describedby={
                      errors.newPassword ? "forgot-new-password-error" : undefined
                    }
                    className={`field pl-10 ${
                      errors.newPassword ? "field-invalid" : ""
                    }`}
                  />
                </div>

                {errors.newPassword && (
                  <p
                    id="forgot-new-password-error"
                    className="mt-1.5 text-xs font-semibold text-danger"
                  >
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label className="label" htmlFor="forgot-confirm-password">
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  />

                  <input
                    id="forgot-confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    aria-invalid={
                      errors.confirmPassword ? "true" : "false"
                    }
                    aria-describedby={
                      errors.confirmPassword
                        ? "forgot-confirm-password-error"
                        : undefined
                    }
                    className={`field pl-10 ${
                      errors.confirmPassword ? "field-invalid" : ""
                    }`}
                  />
                </div>

                {errors.confirmPassword && (
                  <p
                    id="forgot-confirm-password-error"
                    className="mt-1.5 text-xs font-semibold text-danger"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* RESET */}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3"
              >
                {loading ? (
                  <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                ) : (
                  <LockKeyhole size={18} aria-hidden="true" />
                )}

                {loading ? "Resetting..." : "Reset Password"}
              </button>

              {/* RESEND */}

              <button
                type="button"
                disabled={loading}
                onClick={sendOTP}
                className="btn btn-ghost w-full"
              >
                Didn't receive the code? Resend OTP
              </button>
            </form>
          )}

          {/* BACK LOGIN */}

          <div className="mt-7 flex flex-col items-center gap-3 border-t border-line pt-6 text-sm">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-semibold text-ink-2 transition-colors hover:text-ink"
            >
              <ArrowLeft size={16} aria-hidden="true" />

              Back to Login
            </Link>

            <Link
              to="/register"
              className="text-xs font-semibold text-aurora-600 transition-colors hover:text-aurora-500 dark:text-aurora-300"
            >
              Create a new account
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

function Feature({ icon, title, sub }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-aurora-500 shadow-[var(--shadow-e1)]">
        {icon}
      </span>

      <span>
        <b className="block text-sm font-semibold text-ink">{title}</b>

        <small className="mt-0.5 block text-xs text-ink-muted">{sub}</small>
      </span>
    </li>
  );
}
