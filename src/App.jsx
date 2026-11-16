import { lazy, Suspense } from "react";
const AdminPage = lazy(() => import("./pages/adminPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const HomePage = lazy(() => import("./pages/homePage.jsx"));
const TestPage = lazy(() => import("./pages/test.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage.jsx"));
const PaymentCancelledPage = lazy(() => import("./pages/PaymentCancelledPage.jsx"));
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";







import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";



import { ThemeProvider } from "./components/brand/ThemeProvider.jsx";

// =====================================================
// LOGIN REQUIRED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token == null) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function OptionalGoogleProvider({ children }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return clientId ? <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider> : children;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <OptionalGoogleProvider>
          <div className="w-full min-h-screen bg-canvas text-ink">
            {/* Toasts follow the active theme. */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: "!rounded-xl !border !border-line !bg-surface !text-ink !shadow-[var(--shadow-e3)]",
                success: { iconTheme: { primary: "#10b981", secondary: "#111830" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#111830" } },
              }}
            />

            <Suspense fallback={<div role="status" className="p-10 text-center">Loading…</div>}><Routes>
              {/* =========================================
                MAIN WEBSITE
            ========================================= */}

              <Route path="/*" element={<HomePage />} />

              {/* =========================================
                PUBLIC AUTH PAGES
            ========================================= */}

              <Route path="/register" element={<RegisterPage />} />

              <Route path="/login" element={<LoginPage />} />

              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/payment/success" element={<PaymentSuccessPage />} />

              <Route
                path="/payment/cancelled"
                element={<PaymentCancelledPage />}
              />

              {/* =========================================
                ADMIN - LOGIN REQUIRED
            ========================================= */}

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* =========================================
                TEST - LOGIN REQUIRED
            ========================================= */}

              <Route
                path="/test"
                element={
                  <ProtectedRoute>
                    <TestPage />
                  </ProtectedRoute>
                }
              />
            </Routes></Suspense>
          </div>
        </OptionalGoogleProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
