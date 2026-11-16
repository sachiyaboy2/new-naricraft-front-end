import { API_URL } from "../utils/config.js";
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Ruler,
  Scissors,
  Sparkles,
  UserRound,
} from "lucide-react";

import axios from "axios";

import { toast } from "react-hot-toast";

import { GoogleLogin } from "@react-oauth/google";

import { AuroraBackdrop } from "../components/brand/AuroraBackdrop.jsx";
import { Reveal } from "../components/brand/useReveal.jsx";
import { ThemeToggle } from "../components/brand/ThemeToggle.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [terms, setTerms] = useState(false);

  const [fullName, setFullName] = useState("");

  const [telephone, setTelephone] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // CLIENT VALIDATION
  // =====================================================

  function validateForm() {
    const nextErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!telephone.trim()) {
      nextErrors.telephone = "Phone number is required.";
    } else if (telephone.replace(/\D/g, "").length < 7) {
      nextErrors.telephone = "Enter a valid phone number.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!terms) {
      nextErrors.terms = "Please agree to the Terms & Privacy Policy.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  // =====================================================
  // NORMAL REGISTER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");

      return;
    }

    setFormError("");

    setLoading(true);

    try {
      await axios.post(
        API_URL + "/api/users",

        {
          fullName: fullName,

          telephone: telephone,

          email: email,

          password: password,
        },
      );

      toast.success("Account created successfully!");

      navigate("/login");
    } catch (error) {
      console.log("Register Error:", error);

      const message = error.response?.data?.message || "Registration failed";

      setFormError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GOOGLE REGISTER / LOGIN
  // =====================================================

  async function handleGoogleRegister(credentialResponse) {
    if (!credentialResponse.credential) {
      toast.error("Google sign up failed");

      return;
    }

    if (!terms) {
      setErrors((current) => ({
        ...current,
        terms: "Please agree to the Terms & Privacy Policy first.",
      }));

      toast.error("Please agree to the Terms & Privacy Policy first");

      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        API_URL + "/api/users/google-login",

        {
          credential: credentialResponse.credential,
        },
      );

      localStorage.setItem("token", response.data.token);

      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Google account connected successfully!");

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log("Google Register Error:", error);

      const message = error.response?.data?.message || "Google sign up failed";

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

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-start gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
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
                <Sparkles size={14} aria-hidden="true" />

                Welcome to NariCraft
              </span>

              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                Create Your.
                <br />
                <span className="shimmer-text">Perfect Fit.</span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-ink-2">
                Account එකක් හදාගෙන ඔබේ designs save කරන්න, orders track කරන්න
                සහ ඔබේ custom measurements පහසුවෙන් manage කරන්න.
              </p>

              <ul className="mt-7 grid gap-3">
                <Feature
                  icon={<Scissors size={17} />}
                  title="Save Your Designs"
                  sub="ඔබේ favourite designs"
                />

                <Feature
                  icon={<Ruler size={17} />}
                  title="Save Measurements"
                  sub="නැවත නැවත enter කරන්න ඕන නෑ"
                />

                <Feature
                  icon={<CheckCircle2 size={17} />}
                  title="Track Orders"
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
            REGISTER PANEL
        =============================================== */}

        <Reveal
          immediate
          delay={120}
          className="glass rounded-2xl p-6 shadow-[var(--shadow-e4)] sm:p-8"
        >
          <div>
            <span className="badge badge-accent">JOIN NARICRAFT</span>

            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink">
              Account එකක් හදමු ✨
            </h2>

            <p className="mt-2 text-sm text-ink-muted">
              විස්තර ටිකක් දීලා ඔබේ NariCraft journey එක පටන් ගන්න.
            </p>
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
              NORMAL REGISTER FORM
          ================================================= */}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {/* NAME + PHONE */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="register-name">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  />

                  <input
                    id="register-name"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    aria-invalid={errors.fullName ? "true" : "false"}
                    aria-describedby={
                      errors.fullName ? "register-name-error" : undefined
                    }
                    className={`field pl-10 ${
                      errors.fullName ? "field-invalid" : ""
                    }`}
                  />
                </div>

                {errors.fullName && (
                  <p
                    id="register-name-error"
                    className="mt-1.5 text-xs font-semibold text-danger"
                  >
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="register-phone">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  />

                  <input
                    id="register-phone"
                    name="telephone"
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="07X XXX XXXX"
                    autoComplete="tel"
                    required
                    aria-invalid={errors.telephone ? "true" : "false"}
                    aria-describedby={
                      errors.telephone ? "register-phone-error" : undefined
                    }
                    className={`field pl-10 ${
                      errors.telephone ? "field-invalid" : ""
                    }`}
                  />
                </div>

                {errors.telephone && (
                  <p
                    id="register-phone-error"
                    className="mt-1.5 text-xs font-semibold text-danger"
                  >
                    {errors.telephone}
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label className="label" htmlFor="register-email">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                />

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={
                    errors.email ? "register-email-error" : undefined
                  }
                  className={`field pl-10 ${
                    errors.email ? "field-invalid" : ""
                  }`}
                />
              </div>

              {errors.email && (
                <p
                  id="register-email-error"
                  className="mt-1.5 text-xs font-semibold text-danger"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORDS */}

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                id="register-password"
                name="password"
                label="Password"
                value={password}
                onChange={setPassword}
                show={showPassword}
                setShow={setShowPassword}
                placeholder="Create password"
                autoComplete="new-password"
                error={errors.password}
                errorId="register-password-error"
              />

              <PasswordField
                id="register-confirm-password"
                name="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                setShow={setShowConfirm}
                placeholder="Repeat password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                errorId="register-confirm-password-error"
              />
            </div>

            {/* TERMS */}

            <div>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-2">
                <input
                  id="register-terms"
                  name="terms"
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  aria-invalid={errors.terms ? "true" : "false"}
                  aria-describedby={errors.terms ? "register-terms-error" : undefined}
                  className="mt-0.5 size-4 shrink-0 rounded border-line-strong accent-aurora-500"
                />

                <span>
                  I agree to the{" "}
                  <b className="font-semibold text-ink">Terms &amp; Conditions</b>{" "}
                  and{" "}
                  <b className="font-semibold text-ink">Privacy Policy</b>.
                </span>
              </label>

              {errors.terms && (
                <p
                  id="register-terms-error"
                  className="mt-1.5 text-xs font-semibold text-danger"
                >
                  {errors.terms}
                </p>
              )}
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? (
                <Loader2 size={18} aria-hidden="true" className="animate-spin" />
              ) : (
                <ArrowRight size={18} aria-hidden="true" />
              )}

              {loading ? "Creating account..." : "Create NariCraft Account"}
            </button>
          </form>

          {/* DIVIDER */}

          <div className="my-5 flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-ink-muted">
            <span className="h-px flex-1 bg-line" />

            OR

            <span className="h-px flex-1 bg-line" />
          </div>

          {/* =================================================
              GOOGLE
          ================================================= */}

          <div className="nari-google btn btn-secondary w-full">
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && <GoogleLogin
              onSuccess={handleGoogleRegister}
              onError={() => {
                toast.error("Google sign up failed");
              }}
              theme="outline"
              size="large"
              shape="pill"
              text="signup_with"
              logo_alignment="left"
              width="350"
            />}
          </div>

          <p className="mt-5 text-center text-sm text-ink-muted">
            දැනටමත් account එකක් තියෙනවද?{" "}
            <Link
              to="/login"
              className="font-semibold text-aurora-600 hover:text-aurora-500 dark:text-aurora-300"
            >
              Login කරන්න
            </Link>
          </p>

          <p className="mt-3 text-center text-xs leading-5 text-ink-muted">
            Your information will be used only to provide NariCraft services.
          </p>
        </Reveal>
      </div>

      {/* Google button inherits the .btn .btn-secondary shell. */}

      <style>{`
        .nari-google {
          display: flex;
          width: 100%;
          justify-content: center;
        }
        .nari-google div {
          background: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
          color: inherit !important;
          font-family: inherit !important;
        }
        .nari-google > div {
          height: auto !important;
          width: 100% !important;
        }
        .nari-google > div > div > div > div {
          width: 100% !important;
          max-width: none !important;
        }
      `}</style>
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

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  show,
  setShow,
  placeholder,
  autoComplete,
  error,
  errorId,
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
        />

        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={6}
          required
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          className={`field pl-10 pr-11 ${error ? "field-invalid" : ""}`}
        />

        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
        >
          {show ? (
            <EyeOff size={17} aria-hidden="true" />
          ) : (
            <Eye size={17} aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
