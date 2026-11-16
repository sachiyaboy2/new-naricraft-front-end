import { API_URL } from "../utils/config.js";
import { useEffect, useRef, useState } from "react";

import axios from "axios";

import { NavLink, Link, useNavigate } from "react-router-dom";

import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";

import { ThemeToggle } from "./brand/ThemeToggle";

/** Read the cached user so the header can render before the request returns. */
function readStoredUser() {
  try {
    const raw = window.localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [user, setUser] = useState(readStoredUser);

  const navigate = useNavigate();
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);

  // =====================================================
  // TOKEN
  // =====================================================

  const token = localStorage.getItem("token");

  // =====================================================
  // GET LOGGED USER
  // =====================================================

  useEffect(() => {
    if (token == null) {
      return undefined;
    }

    let cancelled = false;

    axios
      .get(
        API_URL + "/api/users/me",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      .then((res) => {
        if (cancelled) return;

        setUser(res.data);

        localStorage.setItem("user", JSON.stringify(res.data));
      })

      .catch((err) => {
        if (cancelled) return;

        console.log("Get User Error:", err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");

          localStorage.removeItem("user");

          setUser(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // =====================================================
  // GLASS HEADER ON SCROLL
  // =====================================================

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // =====================================================
  // ESCAPE CLOSES THE MOBILE DRAWER
  // =====================================================

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  // =====================================================
  // FIRST NAME
  // =====================================================

  const firstName = (user?.fullName || user?.name || user?.firstName || "User")
    .trim()
    .split(" ")[0];

  // =====================================================
  // ADMIN CHECK
  // =====================================================

  const isAdmin =
    user?.role?.toLowerCase() === "admin" || user?.isAdmin === true;

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

    setIsMenuOpen(false);

    navigate("/login");
  };

  // =====================================================
  // NAVIGATION ITEMS
  // =====================================================

  const navItems = [
    {
      name: "Home",
      path: "/",
    },

    {
      name: "Products",
      path: "/products",
    },

    ...(token
      ? [
          {
            name: "My Orders",
            path: "/orders",
          },
        ]
      : []),

    {
      name: "About",
      path: "/about",
    },
  ];

  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`;

  return (
    <header
      className={`
        sticky
        top-0
        z-50
        w-full
        transition-all
        duration-300
        ${isScrolled ? "glass rounded-b-xl" : "bg-transparent"}
      `}
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-3
          sm:px-4
        "
      >
        {/* =================================================
            HEADER ROW
        ================================================= */}

        <div
          className="
            flex
            items-stretch
            gap-3
          "
        >
          {/* =================================================
              MAIN HEADER CONTAINER
          ================================================= */}

          <nav
            aria-label="Main navigation"
            className="
              relative
              flex-1
              min-w-0
              flex
              items-center
              justify-between
              gap-3
              rounded-2xl
              px-3
              sm:px-5
              py-3
              border
              border-line
              bg-surface
              shadow-[var(--shadow-e1)]
              transition-all
              duration-300
            "
          >
            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              to="/"
              className="
                flex
                items-center
                gap-2
                sm:gap-3
                cursor-pointer
                shrink-0
              "
            >
              <span
                className="
                  flex
                  h-10
                  w-10
                  sm:h-11
                  sm:w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-surface-2
                  border
                  border-line
                  overflow-hidden
                  p-1
                  transition-transform
                  duration-300
                  hover:scale-105
                "
              >
                <img
                  src="/logo.png"
                  alt="NariCraft logo"
                  className="
                    h-full
                    w-full
                    object-contain
                  "
                />
              </span>

              <span
                className="
                  text-xl
                  sm:text-2xl
                  font-display
                  font-extrabold
                  tracking-tight
                  whitespace-nowrap
                  text-ink
                "
              >
                නාරී
                <span
                  className="
                    text-base
                    sm:text-lg
                    text-aurora-600
                    dark:text-aurora-300
                  "
                >
                  {" "}
                  CRAFT
                </span>
              </span>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}

            <ul
              className="
                hidden
                lg:flex
                items-center
                gap-1
              "
            >
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink to={item.path} className={linkClass} end={item.path === "/"}>
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* =================================================
                DESKTOP ACCOUNT AREA
            ================================================= */}

            <div
              className="
                hidden
                lg:flex
                items-center
                gap-2
                shrink-0
              "
            >
              {token ? (
                <>
                  <Link to="/profile" className="nav-link whitespace-nowrap">
                    Hi, {firstName} 👋
                  </Link>

                  {isAdmin ? (
                    <Link to="/admin" className="btn btn-secondary !py-2 whitespace-nowrap">
                      Admin Panel
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-ghost !py-2 whitespace-nowrap"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost whitespace-nowrap">
                    Log In
                  </Link>

                  <Link to="/register" className="btn btn-primary whitespace-nowrap">
                    Sign Up
                  </Link>
                </>
              )}

              {/* Theme switch, next to the account controls. */}
              <ThemeToggle />
            </div>

            {/* =================================================
                MOBILE / TABLET HAMBURGER
            ================================================= */}

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              className="
                lg:hidden
                flex
                size-10
                items-center
                justify-center
                rounded-xl
                bg-surface-2
                border
                border-line
                text-ink
                shrink-0
                transition-transform
                duration-200
                hover:scale-105
                active:scale-95
              "
            >
              <FaBars aria-hidden="true" className="text-base" />
            </button>
          </nav>

          {/* =================================================
              CART BUTTON
              LOGIN USER ONLY
          ================================================= */}

          {token && (
            <NavLink
              to="/cart"
              title="Shopping Cart"
              aria-label="Shopping cart"
              className={({ isActive }) =>
                `
                  shrink-0
                  h-[58px]
                  w-[58px]
                  rounded-xl
                  border
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? "btn btn-primary"
                      : "surface text-ink hover:-translate-y-0.5 hover:shadow-[var(--shadow-e2)]"
                  }
                `
              }
            >
              <FaShoppingCart className="text-base" aria-hidden="true" />
            </NavLink>
          )}
        </div>
      </div>

      {/* =================================================
          MOBILE DRAWER
      ================================================= */}

      <div
        className={`
          fixed
          inset-0
          z-[60]
          lg:hidden
          ${isMenuOpen ? "" : "pointer-events-none"}
        `}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
      >
        {/* Scrim */}
        <button
          type="button"
          tabIndex={isMenuOpen ? 0 : -1}
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu"
          className={`
            absolute
            inset-0
            bg-ink/40
            backdrop-blur-sm
            transition-opacity
            duration-300
            ${isMenuOpen ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* Panel */}
        <nav
          id="mobile-navigation"
          ref={drawerRef}
          aria-label="Mobile navigation"
          className={`
            absolute
            right-0
            top-0
            h-full
            w-[min(20rem,85vw)]
            overflow-y-auto
            bg-surface
            border-l
            border-line
            shadow-[var(--shadow-e4)]
            transition-transform
            duration-300
            ease-[var(--ease-out-expo)]
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-4">
            <span className="font-display text-lg font-bold text-ink">Menu</span>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              aria-label="Close menu"
              className="btn btn-ghost !px-2.5 !py-2"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <ul className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setIsMenuOpen(false)}
                  className={linkClass}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="border-t border-line p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-2">Appearance</span>
              <ThemeToggle />
            </div>

            <div className="flex flex-col gap-2">
              {token ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn btn-secondary w-full"
                  >
                    Hi, {firstName} 👋
                  </Link>

                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn btn-secondary w-full"
                    >
                      Admin Panel
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-ghost w-full"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn btn-ghost w-full"
                  >
                    Log In
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn btn-primary w-full"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
