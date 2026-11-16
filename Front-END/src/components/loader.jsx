export function Loader() {
  return (
    <div
      className="
        w-full
        h-full
        min-h-[400px]
        flex
        flex-col
        justify-center
        items-center
        gap-5
      "
      role="status"
      aria-live="polite"
    >
      {/* LOADER */}
      <div className="relative size-20">
        {/* OUTER RING */}
        <div
          className="
            absolute
            inset-0
            rounded-full
            border-4
            border-line
          "
        />

        {/* SPINNING RING */}
        <div
          className="
            absolute
            inset-0
            rounded-full
            border-4
            border-transparent
            border-t-aurora-500
            border-r-cyan-glow
            animate-spin
          "
        />

        {/* CENTER */}
        <div
          className="
            absolute
            inset-[12px]
            rounded-full
            bg-aurora-500/12
            flex
            items-center
            justify-center
            shadow-[var(--shadow-e2)]
          "
        >
          <span
            className="
              block
              size-10
              overflow-hidden
              rounded-full
            "
          >
            <img src="/logo.png" alt="NariCraft logo" className="size-full object-contain" />
          </span>
        </div>
      </div>

      {/* TEXT */}
      <div className="text-center">
        <h2 className="font-display text-lg font-bold text-ink">
          NariCraft
        </h2>

        <p className="mt-1 text-sm text-ink-muted">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default Loader;
