import { useState } from "react";

export default function ImageSlider(props) {
  const images = props.images || [];

  const [activeImage, setActiveImage] = useState(0);

  // Clamp during render instead of syncing with an effect.
  const current = Math.min(activeImage, Math.max(images.length - 1, 0));

  if (images.length === 0) {
    return (
      <div className="surface flex h-[420px] w-full max-w-[430px] items-center justify-center text-sm text-ink-muted">
        No images for this product yet.
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        max-w-[430px]
        flex
        flex-col
        gap-4
      "
    >
      {/* ================= MAIN IMAGE ================= */}

      <div
        className="
          relative
          w-full
          h-[520px]
          bg-surface-2
          rounded-[28px]
          overflow-hidden
          border
          border-line
          shadow-[var(--shadow-e3)]
          group
        "
      >
        {/* Every image is stacked; only the active one is visible, so the
            change is a crossfade instead of a jump. */}
        {images.map((image, index) => (
          <img
            key={image + index}
            src={image}
            alt={`Product image ${index + 1} of ${images.length}`}
            aria-hidden={index !== current}
            className={`
              absolute
              inset-0
              w-full
              h-full
              object-cover
              transition-all
              duration-700
              ease-[var(--ease-out-expo)]
              group-hover:scale-105
              ${index === current ? "opacity-100" : "opacity-0"}
            `}
          />
        ))}

        {/* IMAGE NUMBER */}

        <div
          className="
            absolute
            bottom-4
            right-4
            px-3
            py-1.5
            rounded-full
            bg-ink/70
            text-ink-invert
            text-xs
            font-bold
            backdrop-blur-md
          "
        >
          {current + 1} / {images.length}
        </div>
      </div>

      {/* ================= THUMBNAILS ================= */}

      <div
        className="
          w-full
          flex
          items-center
          gap-3
          overflow-x-auto
          pb-2
        "
      >
        {images.map((image, index) => (
          <button
            key={image + index}
            type="button"
            onClick={() => setActiveImage(index)}
            aria-label={`Show product image ${index + 1}`}
            aria-current={current === index}
            className={`
              w-[82px]
              h-[82px]
              shrink-0
              overflow-hidden
              rounded-xl
              cursor-pointer
              border-2
              transition-all
              duration-300

              ${
                current === index
                  ? "border-aurora-500 scale-105 shadow-[var(--shadow-glow)]"
                  : "border-line opacity-70 hover:opacity-100 hover:border-aurora-400"
              }
            `}
          >
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
