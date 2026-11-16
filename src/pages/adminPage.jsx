import { lazy } from "react";
const AdminProductPage = lazy(() => import("./Admin/adminProductPage"));
const AddProductPage = lazy(() => import("./Admin/AdminAddNewProduct"));
const AdminUpdateProduct = lazy(() => import("./Admin/AdminUpdateProduct"));
const AdminOrdersPage = lazy(() => import("./Admin/AddminOrdersPage"));
const AdminCustomOrdersPage = lazy(() => import("./Admin/AdminCustomOrdersPage"));
const AdminUsersPage = lazy(() => import("./Admin/AdminUsersPage"));
const AdminDashboard = lazy(() => import("./Admin/AdminDashboard"));
import { API_URL } from "../utils/config.js";
import { BsBox2HeartFill, BsCartCheckFill } from "react-icons/bs";
import { FaBars, FaTimes, FaUsers } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";


import { IoIosHome } from "react-icons/io";


import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ErrorState, Skeleton } from "../components/StateBlocks";


import { SiEbox } from "react-icons/si";


// =====================================================
// NAVIGATION CONFIG
// =====================================================

const ADMIN_NAV_ITEMS = [
  {
    to: "/admin/",
    label: "Dashboard",
    title: "Dashboard",
    icon: MdDashboard,
    exact: true,
  },
  {
    to: "/admin/orders",
    label: "Web Orders",
    title: "Web Orders",
    icon: BsBox2HeartFill,
  },
  {
    to: "/admin/cutomer-orders",
    label: "Custom Orders",
    title: "Custom Orders",
    icon: SiEbox,
  },
  {
    to: "/admin/products",
    label: "Products",
    title: "Products",
    icon: BsCartCheckFill,
  },
  {
    to: "/admin/users",
    label: "Users",
    title: "Users",
    icon: FaUsers,
  },
];

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "AD";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AdminPage() {
  const navigate = useNavigate();

  const location = useLocation();

  const [userLoaderd, setUserLoaderd] = useState(false);

  const [loadError, setLoadError] = useState(null);

  const [adminUser, setAdminUser] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // =====================================================
  // ADMIN AUTH CHECK
  // =====================================================

  const checkAdmin = useCallback(() => {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("Please Login to access admin pannel");

      navigate("/login");

      return;
    }

    axios
      .get(API_URL + "/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.role !== "admin") {
          toast.error("You are not authorized to access admin pannel");

          navigate("/");

          return;
        }

        setLoadError(null);

        setAdminUser(res.data);

        setUserLoaderd(true);
      })
      .catch((err) => {
        console.log(err);

        const status = err?.response?.status;

        // A sleeping back end must not blank the admin shell.
        if (status === 401 || status === 403) {
          toast.error("Please Login to access admin pannel");

          localStorage.removeItem("token");

          navigate("/login");

          return;
        }

        toast.error("Unable to verify the admin session");

        setLoadError(
          err?.response?.data?.message ||
            "We could not reach the admin service. Please try again.",
        );
      });
  }, [navigate]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  // Retry handler for the error state (runs from a click, not from an effect).
  const retryAdmin = useCallback(() => {
    setLoadError(null);

    setUserLoaderd(false);

    checkAdmin();
  }, [checkAdmin]);

  // =====================================================
  // MOBILE SIDEBAR
  // =====================================================

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen]);

  // =====================================================
  // ACTIVE NAVIGATION
  // =====================================================

  const currentPath = location.pathname;

  function isNavItemActive(item) {
    if (item.exact) {
      return currentPath === item.to || currentPath === "/admin";
    }

    return currentPath.startsWith(item.to);
  }

  const currentTitle =
    ADMIN_NAV_ITEMS.find((item) => isNavItemActive(item))?.title ||
    "Admin Board";

  const adminName = adminUser?.fullName || "Administrator";

  return (
    <div className="relative flex min-h-screen w-full bg-canvas">
      {/* =====================================================
          MOBILE BACKDROP
      ===================================================== */}

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =====================================================
          LEFT SIDEBAR
      ===================================================== */}

      <nav
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[280px]
          shrink-0
          flex-col
          overflow-y-auto
          border-r
          border-line
          bg-surface
          p-5
          shadow-[var(--shadow-e4)]
          transition-transform
          duration-300
          ease-[var(--ease-out-expo)]

          lg:sticky
          lg:top-0
          lg:z-auto
          lg:h-screen
          lg:w-[264px]
          lg:translate-x-0
          lg:shadow-none

          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* =================================================
            ADMIN LOGO
        ================================================= */}

        <div className="flex items-center justify-between gap-3">
          <Link
            to="/admin/"
            className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-3 transition-colors hover:border-aurora-500/50"
          >
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface p-1">
              <img
                src="/logo.png"
                alt="NariCraft logo"
                className="h-full w-full object-contain"
              />
            </span>

            <span className="font-display text-lg font-bold text-ink">
              Admin Panel
            </span>
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close navigation menu"
            className="btn btn-ghost !size-9 !rounded-lg !p-0 lg:hidden"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        {/* =================================================
            NAVIGATION AREA
        ================================================= */}

        <div className="mt-7 flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const NavIcon = item.icon;

            const isActive = isNavItemActive(item);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                aria-current={isActive ? "page" : undefined}
                className={`nav-link flex items-center gap-3 ${
                  isActive ? "nav-link-active bg-surface-2" : ""
                }`}
              >
                <NavIcon aria-hidden="true" />

                {item.label}
              </Link>
            );
          })}
        </div>

        {/* =================================================
            HOME PAGE BUTTON
        ================================================= */}

        <div className="mt-auto pt-8">
          <Link to="/" className="btn btn-primary w-full">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
              <IoIosHome aria-hidden="true" className="text-lg" />
            </span>

            <span>Home Page</span>
          </Link>
        </div>
      </nav>

      {/* =====================================================
          RIGHT SIDE MAIN CONTENT
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="glass sticky top-0 z-30 flex items-center gap-4 border-b border-line px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isSidebarOpen}
            aria-controls="admin-sidebar"
            className="btn btn-secondary !size-10 !p-0 lg:hidden"
          >
            <FaBars aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-aurora-600 dark:text-aurora-300">
              NariCraft Admin
            </p>

            <h1 className="truncate font-display text-xl font-extrabold text-ink md:text-2xl">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-ink">{adminName}</p>

              <p className="text-xs text-ink-muted">Signed in as admin</p>
            </div>

            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-aurora-500/12 font-display text-sm font-extrabold text-aurora-600 dark:text-aurora-300"
            >
              {getInitials(adminName)}
            </span>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="min-w-0 flex-1 p-4 md:p-6">
          {loadError ? (
            <ErrorState
              title="Admin service unavailable"
              message={loadError}
              onRetry={retryAdmin}
            />
          ) : userLoaderd ? (
            <Routes>
              {/* DASHBOARD */}

              <Route
                path="/"
                element={
                  <div className="p-4">
                    <h1 className="font-display text-2xl font-bold text-ink">
                      Admin Board
                    </h1>
                  </div>
                }
              />

              {/* PRODUCTS */}

              <Route path="/products" element={<AdminProductPage />} />

              {/* ORDERS */}

              <Route
                path="/orders"
                element={
                  <div className="p-4 text-ink">
                    <AdminOrdersPage />
                  </div>
                }
              />

              {/* USERS */}

              <Route path="/users" element={<AdminUsersPage />} />

              {/* CUTOMER ORDERS */}

              <Route
                path="/cutomer-orders"
                element={<AdminCustomOrdersPage />}
              />

              {/* ADD PRODUCT */}

              <Route path="/add-product" element={<AddProductPage />} />

              {/* UPDATE PRODUCT */}

              <Route
                path="update-product/:productId"
                element={<AdminUpdateProduct />}
              />
              <Route index element={<AdminDashboard />} />
            </Routes>
          ) : (
            <AdminShellSkeleton />
          )}
        </main>
      </div>
    </div>
  );
}

// =====================================================
// LOADING SHELL
// =====================================================

function AdminShellSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-5">
      <Skeleton className="h-10 w-64" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-36 w-full rounded-xl" />

        <Skeleton className="h-36 w-full rounded-xl" />

        <Skeleton className="h-36 w-full rounded-xl" />

        <Skeleton className="h-36 w-full rounded-xl" />
      </div>

      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
