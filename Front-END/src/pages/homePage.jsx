import { lazy } from "react";
const AboutPage = lazy(() => import("./AboutPage"));
const ProductOverView = lazy(() => import("./productOverView"));
const CartPage = lazy(() => import("./cart"));
const CheckOutPage = lazy(() => import("./checkOut"));
const UserData = lazy(() => import("../components/userData"));
const CustomDesign = lazy(() => import("./customDesign"));
const MyOrders = lazy(() => import("./MyOrders"));
const ProductPage = lazy(() => import("./productPage").then(module => ({ default: module.ProductPage })));
import { Link, Route, Routes, Navigate } from "react-router-dom";

import Header from "../components/header";




import { FaArrowRight, FaShoppingBag, FaStar, FaTruck } from "react-icons/fa";

import { GiLargeDress } from "react-icons/gi";

import { FiUploadCloud, FiScissors, FiCheckCircle } from "react-icons/fi";

import { TbRulerMeasure } from "react-icons/tb";






import { AuroraBackdrop } from "../components/brand/AuroraBackdrop";
import { Reveal } from "../components/brand/useReveal";
import { TiltCard } from "../components/brand/TiltCard";
import { PageTransition } from "../components/PageTransition";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token == null) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-canvas text-ink">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header />

      {/* =====================================================
          PAGES
      ===================================================== */}

      <Routes>
        {/* HOME */}

        <Route index element={<HomeContent />} />

        {/* PRODUCTS */}

        <Route path="products" element={<ProductPage />} />

        {/* ABOUT */}

        <Route path="about" element={<AboutPage />} />

        {/* CART */}

        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        {/* ORDERS */}

        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* PRODUCT OVERVIEW */}

        <Route
          path="overview/:id"
          element={
            <ProtectedRoute>
              <ProductOverView />
            </ProtectedRoute>
          }
        />

        {/* CHECKOUT */}

        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckOutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <UserData />
            </ProtectedRoute>
          }
        />
        <Route
          path="custom-design"
          element={
            <ProtectedRoute>
              <CustomDesign />
            </ProtectedRoute>
          }
        />

        {/* 404 */}

        <Route
          path="*"
          element={
            <div className="nari-section flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
              <h1 className="font-display text-5xl font-extrabold text-ink">404</h1>
              <p className="mt-3 text-sm text-ink-muted">
                That page does not exist. Let&apos;s get you back to the collection.
              </p>
              <Link to="/products" className="btn btn-primary mt-6">
                Browse products
              </Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

// ============================================================================
// HOME CONTENT
// ============================================================================

function HomeContent() {
  const steps = [
    {
      number: "01",
      icon: FiUploadCloud,
      title: "Design එක තෝරන්න",
      body: "අපගේ collection එකෙන් ඔබට කැමති design එකක් තෝරාගන්න, නැත්නම් ඔබගේම design photo එකක් ලබාදෙන්න.",
    },
    {
      number: "02",
      icon: TbRulerMeasure,
      title: "මිනුම් ලබාදෙන්න",
      body: "Standard size එකක් තෝරාගන්න හෝ ඔබගේම body measurements ලබාදී custom fitting එකක් සකස් කරගන්න.",
    },
    {
      number: "03",
      icon: FiScissors,
      title: "අපි නිමකරමු",
      body: "ඔබ තෝරාගත් design එක සහ measurements අනුව NariCraft ඔබේ outfit එක අලංකාරව නිමකරයි.",
    },
  ];

  const reasons = [
    {
      icon: FiCheckCircle,
      title: "Perfect Fitting",
      body: "ඔබගේ measurements අනුව ඔබට ගැලපෙන comfortable සහ beautiful fitting එකක්.",
    },
    {
      icon: FiScissors,
      title: "Quality Craftsmanship",
      body: "සෑම design එකක්ම attention to detail සහ quality finish එකක් සමණ නිමකරයි.",
    },
    {
      icon: FaTruck,
      title: "Islandwide Delivery",
      body: "ඔබගේ order එක ශ්‍රී ලංකාව පුරා ආරක්ෂිතව ඔබේ නිවසටම ලබාගන්න.",
    },
  ];

  return (
    <PageTransition>
      <main className="w-full overflow-hidden">
        {/* =====================================================================
            HERO SECTION
        ===================================================================== */}

        <section
          className="
            relative
            isolate
            overflow-hidden
          "
        >
          <AuroraBackdrop />

          <div
            className="
              nari-section
              relative
              z-10
              min-h-[640px]
              py-16
              grid
              lg:grid-cols-2
              gap-14
              items-center
            "
          >
            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="relative z-10">
              {/* WELCOME BADGE */}

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-full
                  glass
                  text-[10px]
                  font-bold
                  tracking-[0.22em]
                  uppercase
                  text-aurora-600
                  dark:text-aurora-300
                  mb-6
                "
              >
                <FaStar aria-hidden="true" className="text-amber-glow" />

                Welcome to NariCraft
              </span>

              {/* MAIN TITLE */}

              <h1
                className="
                  text-4xl
                  sm:text-5xl
                  lg:text-6xl
                  font-display
                  font-extrabold
                  leading-[1.05]
                  text-ink
                "
              >
                Your Fashion.
                <br />
                Your Design.
                <br />
                <span className="shimmer-text">Your Story.</span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-6
                  max-w-xl
                  text-base
                  md:text-lg
                  leading-8
                  text-ink-2
                "
              >
                ඔබට කැමති NariCraft design එකක් තෝරාගන්න. නැත්නම් ඔබගේම design
                එක upload කරලා, measurements වලට ගැලපෙන custom outfit එකක් නිර්මාණය
                කරගන්න.
              </p>

              {/* BUTTONS */}

              <div
                className="
                  flex
                  flex-wrap
                  gap-4
                  mt-8
                "
              >
                <Link
                  to="/products"
                  className="btn btn-primary group !px-7 !py-4 !text-base"
                >
                  <FaShoppingBag aria-hidden="true" />
                  Explore Products
                  <FaArrowRight
                    aria-hidden="true"
                    className="
                      group-hover:translate-x-1
                      transition-transform
                    "
                  />
                </Link>

                <Link to="/about" className="btn btn-secondary !px-7 !py-4 !text-base">
                  About Us
                </Link>
              </div>

              {/* STATS */}

              <dl
                className="
                  mt-12
                  grid
                  grid-cols-3
                  gap-4
                  max-w-lg
                "
              >
                {[
                  { label: "Hand made", value: "100%" },
                  { label: "Fit guarantee", value: "3 sizes" },
                  { label: "Delivery", value: "Islandwide" },
                ].map((stat) => (
                  <div key={stat.label} className="glass px-4 py-3">
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 font-display text-lg font-bold text-ink">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* =================================================
                RIGHT SIDE - 3D CARD STACK
            ================================================= */}

            <div
              className="
                relative
                h-[470px]
                flex
                items-center
                justify-center
              "
            >
              {/* BACK CARDS */}

              <div
                aria-hidden="true"
                className="
                  absolute
                  w-[260px]
                  h-[340px]
                  rounded-[32px]
                  bg-aurora-500/25
                  blur-2xl
                  rotate-[12deg]
                  translate-x-12
                "
              />

              <div
                aria-hidden="true"
                className="
                  absolute
                  w-[260px]
                  h-[340px]
                  rounded-[32px]
                  bg-cyan-glow/20
                  blur-2xl
                  -rotate-[12deg]
                  -translate-x-12
                "
              />

              {/* MAIN CARD */}

              <TiltCard
                max={7}
                className="
                  relative
                  z-20
                  w-[290px]
                  h-[390px]
                  rounded-[32px]
                  card-glow
                  bg-surface
                  border
                  border-line
                  shadow-[var(--shadow-e4)]
                  p-6
                "
              >
                <div className="flex items-center justify-between">
                  <span
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-surface-2
                      border
                      border-line
                      overflow-hidden
                      p-1
                    "
                  >
                    <img src="/logo.png" alt="NariCraft logo" className="h-full w-full object-contain" />
                  </span>

                  <span
                    className="
                      text-[10px]
                      tracking-[0.25em]
                      font-bold
                      text-aurora-600
                      dark:text-aurora-300
                    "
                  >
                    NARICRAFT
                  </span>
                </div>

                <div
                  className="
                    depth-1
                    mt-5
                    h-[215px]
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-line
                    bg-surface-2
                  "
                >
                  <img
                    src="/sarii.png"
                    alt="A NariCraft custom saree"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-[10px]
                    tracking-[0.18em]
                    font-bold
                    text-ink-muted
                  "
                >
                  CUSTOM COLLECTION
                </p>

                <h2 className="mt-1 font-display text-xl font-bold text-ink">
                  Made Just For You
                </h2>
              </TiltCard>

              {/* FLOATING CUSTOM CARD */}

              <div
                className="
                  absolute
                  z-30
                  left-0
                  lg:left-3
                  top-16
                  glass
                  rounded-2xl
                  p-4
                  flex
                  items-center
                  gap-3
                  float
                "
              >
                <span
                  className="
                    flex
                    size-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-aurora-500/15
                    text-aurora-600
                    dark:text-aurora-300
                  "
                >
                  <GiLargeDress aria-hidden="true" />
                </span>

                <div>
                  <p className="text-xs font-bold text-ink">Custom Fit</p>

                  <p className="text-[10px] text-ink-muted">Made to measure</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SIMPLE STEPS
        ===================================================================== */}

        <section
          className="
            relative
            py-24
            border-t
            border-line
          "
        >
          <div className="nari-section relative z-10">
            {/* SECTION TITLE */}

            <Reveal className="text-center max-w-2xl mx-auto">
              <span
                className="
                  inline-block
                  px-4
                  py-2
                  rounded-full
                  bg-surface-2
                  border
                  border-line
                  text-[10px]
                  font-bold
                  tracking-[3px]
                  text-aurora-600
                  dark:text-aurora-300
                "
              >
                SIMPLE STEPS
              </span>

              <h2
                className="
                  mt-5
                  text-3xl
                  sm:text-4xl
                  font-display
                  font-extrabold
                  text-ink
                "
              >
                NariCraft වෙතින් මසා ගන්නේ කෙසේද?
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  md:text-base
                  text-ink-2
                  leading-7
                "
              >
                ඔබේ design එක තෝරාගනීමේ සිට නිමවූ ඇඳුම ඔබේ අතට ලැබෙන තෙක් සරල
                පියවර තුනක්.
              </p>
            </Reveal>

            {/* STEP CARDS */}

            <div className="grid md:grid-cols-3 gap-7 mt-14">
              {steps.map((step, index) => {
                const StepIcon = step.icon;

                return (
                  <Reveal key={step.number} delay={index * 120}>
                    <TiltCard max={6} className="card-3d card-glow h-full p-7 !bg-surface">
                      <span
                        aria-hidden="true"
                        className="
                          absolute
                          -right-2
                          -top-6
                          text-[95px]
                          font-display
                          font-extrabold
                          text-aurora-500/10
                          select-none
                        "
                      >
                        {step.number}
                      </span>

                      <span
                        className="
                          relative
                          flex
                          size-14
                          items-center
                          justify-center
                          rounded-2xl
                          bg-aurora-500/12
                          text-aurora-600
                          dark:text-aurora-300
                          transition-transform
                          duration-300
                          group-hover:rotate-6
                        "
                      >
                        <StepIcon size={26} aria-hidden="true" />
                      </span>

                      <p
                        className="
                          relative
                          mt-7
                          text-[10px]
                          tracking-[3px]
                          font-bold
                          text-aurora-600
                          dark:text-aurora-300
                        "
                      >
                        STEP {step.number}
                      </p>

                      <h3 className="relative mt-2 font-display text-xl font-bold text-ink">
                        {step.title}
                      </h3>

                      <p className="relative mt-3 text-sm text-ink-2 leading-7">
                        {step.body}
                      </p>
                    </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            WHY CHOOSE NARICRAFT
        ===================================================================== */}

        <section
          className="
            relative
            py-20
            overflow-hidden
          "
        >
          <AuroraBackdrop />

          <div className="nari-section relative z-10">
            {/* TITLE */}

            <Reveal className="text-center mb-12">
              <p
                className="
                  text-[10px]
                  font-bold
                  tracking-[3px]
                  text-aurora-600
                  dark:text-aurora-300
                "
              >
                WHY NARICRAFT
              </p>

              <h2 className="mt-3 font-display text-3xl font-extrabold text-ink">
                Crafted Around You
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {reasons.map((reason, index) => {
                const ReasonIcon = reason.icon;

                return (
                  <Reveal key={reason.title} delay={index * 120}>
                    <TiltCard max={6} className="glass h-full p-7">
                      <span
                        className="
                          flex
                          size-14
                          items-center
                          justify-center
                          rounded-2xl
                          bg-aurora-500/12
                          text-aurora-600
                          dark:text-aurora-300
                        "
                      >
                        <ReasonIcon size={26} aria-hidden="true" />
                      </span>

                      <h3 className="mt-5 font-display text-lg font-bold text-ink">
                        {reason.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-ink-2">{reason.body}</p>
                    </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            CUSTOM DESIGN CTA
        ===================================================================== */}

        <section className="py-24">
          <div className="nari-section">
            <Reveal>
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[36px]
                  bg-gradient-to-br
                  from-aurora-600
                  via-aurora-700
                  to-[#1b1233]
                  p-8
                  sm:p-12
                  lg:p-16
                  shadow-[var(--shadow-e4)]
                  border
                  border-line
                "
              >
                {/* DECORATIONS */}

                <span aria-hidden="true" className="aurora-ring -right-16 -top-16 opacity-40" />

                <span
                  aria-hidden="true"
                  className="
                    absolute
                    -left-24
                    -bottom-32
                    size-96
                    rounded-full
                    border
                    border-white/10
                  "
                />

                <div
                  className="
                    relative
                    z-10
                    grid
                    lg:grid-cols-2
                    gap-10
                    items-center
                  "
                >
                  {/* LEFT */}

                  <div>
                    <span
                      className="
                        text-[10px]
                        tracking-[3px]
                        font-bold
                        text-cyan-glow
                      "
                    >
                      HAVE YOUR OWN DESIGN?
                    </span>

                    <h2
                      className="
                        mt-4
                        text-4xl
                        sm:text-5xl
                        font-display
                        font-extrabold
                        text-white
                        leading-tight
                      "
                    >
                      Turn Your Idea
                      <br />
                      <span className="shimmer-text">Into Reality.</span>
                    </h2>

                    <p
                      className="
                        mt-5
                        text-white/80
                        text-sm
                        md:text-base
                        leading-7
                        max-w-lg
                      "
                    >
                      ඔබගේ phone එකේ තියෙන design photo එක ලබාදී, measurements සහ අවශ්‍ය
                      විස්තර අපට ලබාදෙන්න. NariCraft එය ඔබ වෙනුවෙන් නිමකරයි.
                    </p>
                  </div>

                  {/* RIGHT BUTTON */}

                  <div className="lg:flex lg:justify-end">
                    <Link
                      to="/products"
                      className="btn btn-primary group !px-8 !py-4 !text-base"
                    >
                      <FiUploadCloud size={20} aria-hidden="true" />
                      Explore Designs
                      <FaArrowRight
                        aria-hidden="true"
                        className="
                          group-hover:translate-x-1
                          transition-transform
                        "
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
