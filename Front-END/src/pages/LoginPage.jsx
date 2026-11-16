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
  Scissors,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import axios from "axios";

import { toast } from "react-hot-toast";

import { GoogleLogin } from "@react-oauth/google";

import { AuroraBackdrop } from "../components/brand/AuroraBackdrop.jsx";
import { Reveal } from "../components/brand/useReveal.jsx";
import { ThemeToggle } from "../components/brand/ThemeToggle.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});

  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // CLIENT VALIDATION
  // =====================================================

  function validateForm() {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  // =====================================================
  // NORMAL LOGIN
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
      const response = await axios.post(
        API_URL + "/api/users/login",

        {
          email: email,

          password: password,
        },
      );

      console.log("Backend Response:", response.data);

      localStorage.setItem("token", response.data.token);

      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Login successful!");

      const user = response.data.user;

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login Error:", error);

      const message =
        error.response?.data?.message || "Login failed. Please try again.";

      setFormError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  async function handleGoogleLogin(credentialResponse) {
    if (!credentialResponse.credential) {
      toast.error("Google login failed");

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

      toast.success("Google login successful!");

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Google Login Error:", error);

      const message = error.response?.data?.message || "Google login failed";

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
                <Sparkles size={14} aria-hidden="true" />

                Custom Tailoring Studio
              </span>

              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                Your Design.
                <br />
                <span className="shimmer-text">Our Craft.</span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-ink-2">
                ඔබේම style එකට ගැළපෙන, ඔබේම මිනුම්වලට නිමවන NariCraft
                experience එකට නැවතත් සාදරයෙන් පිළිගනිමු.
              </p>

              <ul className="mt-7 grid gap-3">
                <Feature
                  icon={<Scissors size={17} />}
                  title="Personalized Designs"
                  sub="ඔබේ style එකටම"
                />

                <Feature
                  icon={<ShieldCheck size={17} />}
                  title="Secure Account"
                  sub="ඔබේ details ආරක්ෂිතයි"
                />

                <Feature
                  icon={<CheckCircle2 size={17} />}
                  title="Perfect Fit"
                  sub="ඔබේ මිනුම් අනුව"
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
          <div>
            <span className="badge badge-accent">WELCOME BACK</span>

            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink">
              Login කරන්න 👋
            </h2>

            <p className="mt-2 text-sm text-ink-muted">
              ඔබගේ NariCraft account එකට sign in වෙන්න.
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
              NORMAL LOGIN FORM
          ================================================= */}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {/* EMAIL */}

            <div>
              <label className="label" htmlFor="login-email">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                />

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "login-email-error" : undefined}
                  className={`field pl-10 ${errors.email ? "field-invalid" : ""}`}
                />
              </div>

              {errors.email && (
                <p
                  id="login-email-error"
                  className="mt-1.5 text-xs font-semibold text-danger"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}

            <div>
              <label className="label" htmlFor="login-password">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                />

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                  className={`field pl-10 pr-11 ${
                    errors.password ? "field-invalid" : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff size={17} aria-hidden="true" />
                  ) : (
                    <Eye size={17} aria-hidden="true" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  id="login-password-error"
                  className="mt-1.5 text-xs font-semibold text-danger"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* OPTIONS */}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
                <input
                  type="checkbox"
                  name="remember"
                  className="size-4 rounded border-line-strong accent-aurora-500"
                />

                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-aurora-600 transition-colors hover:text-aurora-500 dark:text-aurora-300"
              >
                Forgot Password?
              </Link>
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

              {loading ? "Signing in..." : "Login to NariCraft"}
            </button>
          </form>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="my-5 flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-ink-muted">
            <span className="h-px flex-1 bg-line" />

            OR

            <span className="h-px flex-1 bg-line" />
          </div>

          {/* =================================================
              GOOGLE LOGIN
          ================================================= */}

          <div className="nari-google btn btn-secondary w-full">
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                toast.error("Google login failed");
              }}
              theme="outline"
              size="large"
              shape="pill"
              text="signin_with"
              logo_alignment="left"
              width="350"
            />}
          </div>

          <p className="mt-5 text-center text-sm text-ink-muted">
            Account එකක් නැද්ද?{" "}
            <Link
              to="/register"
              className="font-semibold text-aurora-600 hover:text-aurora-500 dark:text-aurora-300"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-3 text-center text-xs leading-5 text-ink-muted">
            Login කිරීමෙන් NariCraft හි Terms &amp; Privacy Policy වලට එකඟ වේ.
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
