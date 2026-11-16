import { FaCut, FaHeart, FaStar, FaUsers, FaWhatsapp } from "react-icons/fa";

import { AuroraBackdrop } from "../components/brand/AuroraBackdrop.jsx";
import { Reveal } from "../components/brand/useReveal.jsx";
import { TiltCard } from "../components/brand/TiltCard.jsx";

const VALUES = [
  {
    icon: <FaHeart aria-hidden="true" />,
    title: "Customer First",
    text: "Customerගේ අවශ්‍යතාවයට ගැළපෙන experience එකක් ලබාදීම.",
  },
  {
    icon: <FaCut aria-hidden="true" />,
    title: "Custom Design",
    text: "ඔබගේම style එක measurements අනුව නිර්මාණය කිරීම.",
  },
  {
    icon: <FaStar aria-hidden="true" />,
    title: "Quality",
    text: "Products වල quality සහ finishing පිළිබඳ අවධානය.",
  },
  {
    icon: <FaUsers aria-hidden="true" />,
    title: "Trust",
    text: "Customers සහ NariCraft අතර විශ්වාසදායක service එකක්.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-canvas text-ink">
      {/* =====================================================
          ABOUT HERO
      ===================================================== */}

      <section className="relative overflow-hidden px-6 py-16 md:px-12 lg:px-20 lg:py-20">
        <AuroraBackdrop />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-aurora-600 dark:text-aurora-300">
              About NariCraft
            </p>

            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Fashion Made
              <br />
              <span className="shimmer-text">Personal.</span>
            </h1>

            <p className="mt-6 text-base leading-8 text-ink-2">
              NariCraft කියන්නේ customer එකට තමන් කැමති විදිහට ඇඳුමක් තෝරාගන්න
              සහ නිර්මාණය කරගන්න පහසු කරන fashion platform එකක්.
            </p>

            <p className="mt-4 text-base leading-8 text-ink-2">
              Ready-made designs මිලදී ගැනීමටත්, customerගේම design image එකක්
              upload කරලා measurements අනුව custom tailoring service එකක්
              ලබාගඐනීමටත් NariCraft හරහා හැකියාව ලබාදීම අපේ ප්‍රධාන අරමුණයි.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="badge badge-accent">Tailored for you</span>

              <span className="badge">Custom measurements</span>

              <span className="badge">Island wide delivery</span>
            </div>
          </Reveal>

          {/* =================================================
              RIGHT SIDE IMAGE
          ================================================= */}

          <Reveal delay={120}>
            <div className="group relative min-h-[380px] w-full overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-e4)] sm:min-h-[420px] lg:min-h-[430px]">
              <img
                src="/ab2.png"
                alt="NariCraft Tailoring"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* SMALL DARK OVERLAY */}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />

              <div className="glass absolute bottom-5 left-5 right-5 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-aurora-600 dark:text-aurora-300">
                  NariCraft Studio
                </p>

                <p className="mt-1 text-sm font-semibold text-ink">
                  Made to measure, made to last.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          OUR VALUES
      ===================================================== */}

      <section className="bg-canvas-2 px-6 py-16 md:px-12 lg:px-20 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* TITLE */}

          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-aurora-600 dark:text-aurora-300">
              What We Believe
            </p>

            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Our Values
            </h2>
          </Reveal>

          {/* VALUES CARDS */}

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <Reveal key={value.title} delay={index * 80} className="h-full">
                <TiltCard className="card-3d card-glow h-full p-6">
                  <span className="flex size-12 items-center justify-center rounded-xl border border-line bg-surface-2 text-xl text-aurora-500">
                    {value.icon}
                  </span>

                  <h3 className="mt-5 font-display text-lg font-bold text-ink">
                    {value.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-7 text-ink-muted">
                    {value.text}
                  </p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}

      <section className="relative overflow-hidden px-6 py-16 md:px-12 lg:px-20 lg:py-20">
        <AuroraBackdrop />

        <Reveal className="relative z-10 mx-auto max-w-5xl">
          <div className="glass rounded-2xl p-10 text-center shadow-[var(--shadow-e4)] sm:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-aurora-600 dark:text-aurora-300">
              Our Mission
            </p>

            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Making Every Design Feel Personal
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-ink-2">
              Modern technology සහ tailoring එක එකතු කරලා, customer කෙනෙකුට තමන්ගේ
              style එකට ගැළපෙන outfit එකක් පහසුවෙන් order කරන්න පුළුවන් platform
              එකක් නිර්මාණය කිරීම NariCraft හි අරමුණයි.
            </p>
          </div>
        </Reveal>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-canvas-2 px-4 py-7 text-center">
        <p className="text-sm text-ink-muted">
          © 2026 NariCraft • Tailored for you • Crafted with love
        </p>
      </footer>

      {/* =====================================================
          WHATSAPP FIXED FLOATING BUTTON
      ===================================================== */}

      <a
        href="https://wa.me/94725521272"
        target="_blank"
        rel="noopener noreferrer"
        title="Contact us on WhatsApp"
        aria-label="Contact us on WhatsApp"
        className="group fixed bottom-6 right-6 z-[60] flex items-center no-underline sm:bottom-8 sm:right-8"
      >
        {/* PULSE RINGS */}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-success/25"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-success/25 [animation-delay:1.1s]"
        />

        {/* MAIN BUTTON */}

        <span className="relative flex items-center gap-3 rounded-full border border-line bg-surface/95 py-2.5 pl-3 pr-5 shadow-[var(--shadow-e3)] backdrop-blur transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
          <span className="flex size-10 items-center justify-center rounded-full bg-success/15 text-lg text-success">
            <FaWhatsapp aria-hidden="true" />
          </span>

          {/* TEXT - DESKTOP */}

          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Need Help?
            </span>

            <span className="text-sm font-extrabold text-ink">
              Chat with us
            </span>
          </span>
        </span>

        {/* ONLINE DOT */}

        <span
          aria-hidden="true"
          className="absolute right-2.5 top-1.5 size-3 animate-pulse rounded-full border-2 border-success bg-surface"
        />
      </a>
    </div>
  );
}
