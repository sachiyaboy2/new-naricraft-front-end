import toast from "react-hot-toast";
import { useWishlist } from "../utils/useWishlist.js";
import { toggleWishlist } from "../utils/wishlistStore.js";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

import { TiltCard } from "./brand/TiltCard";

export default function ProductCard(props) {
  const product = props.product;
  const wishlist = useWishlist();
  const saved = wishlist.includes(product.productId);
  function handleFavourite() {
    try {
      const nowSaved = toggleWishlist(product.productId);
      toast.success(nowSaved ? "Saved to favourites" : "Removed from favourites");
    } catch { toast.error("Your browser could not save favourites. Check storage permissions."); }
  }

  return (
    /* =====================================================
        The card tilts in 3D with the pointer and lifts its
        image on a separate depth layer.
    ===================================================== */

    <TiltCard className="card-3d card-glow group w-full overflow-hidden !p-0 transition-shadow duration-300 hover:shadow-[var(--shadow-e4)]">
      {/* =================================================
          PRODUCT IMAGE
      ================================================= */}

      <div
        className="
          relative
          w-full
          h-[270px]
          overflow-hidden
          bg-surface-2
        "
      >
        <div className="depth-1 h-full w-full transition-transform duration-500 group-hover:scale-[1.06]">
          <img
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
            "
          />
        </div>

        {/* CATEGORY */}

        <span
          className="
            absolute
            top-4
            left-4
            px-3
            py-1.5
            rounded-full
            bg-ink/70
            backdrop-blur-md
            text-[10px]
            font-bold
            tracking-wide
            text-ink-invert
          "
        >
          {product.category}
        </span>

        {/* HEART */}

        <button
          type="button"
          aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} favourites`}
          aria-pressed={saved}
          onClick={handleFavourite}
          className="
            absolute
            top-4
            right-4
            w-9
            h-9
            rounded-full
            bg-surface/90
            text-ink
            flex
            items-center
            justify-center
            shadow-[var(--shadow-e2)]
            hover:bg-aurora-500
            hover:text-white
            hover:scale-110
            transition-all
          "
        >
          {saved ? <MdFavorite size={18} className="text-rose-500" aria-hidden="true" /> : <MdFavoriteBorder size={18} aria-hidden="true" />}
        </button>

        {/* IMAGE GRADIENT */}

        <div
          className="
            absolute
            bottom-0
            left-0
            w-full
            h-16
            bg-gradient-to-t
            from-ink/25
            to-transparent
            pointer-events-none
          "
        />
      </div>

      {/* =================================================
          PRODUCT DETAILS
      ================================================= */}

      <div
        className="
          p-5
        "
      >
        {/* PRODUCT ID */}

        <p
          className="
            text-[10px]
            font-bold
            text-aurora-600
            dark:text-aurora-300
            tracking-[0.18em]
            uppercase
            font-mono
          "
        >
          {product.productId}
        </p>

        {/* NAME */}

        <h2
          className="
            text-lg
            font-display
            font-bold
            text-ink
            mt-2
            truncate
          "
        >
          {product.name}
        </h2>

        {/* ALT NAME */}

        {product.altNames?.length > 0 && (
          <p
            className="
              text-xs
              text-ink-muted
              mt-1
              truncate
            "
          >
            {product.altNames.join(", ")}
          </p>
        )}

        {/* PRICE + BUTTON */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            mt-5
          "
        >
          <div>
            <p
              className="
                text-[10px]
                text-ink-muted
                uppercase
                font-bold
              "
            >
              Price
            </p>

            <p
              className="
                text-xl
                font-display
                font-bold
                text-ink
              "
            >
              <span
                className="
                  text-xs
                  mr-1
                  text-ink-muted
                "
              >
                LKR
              </span>

              {product.price?.toLocaleString()}
            </p>
          </div>

          {/* VIEW BUTTON */}

          <Link
            to={"/overview/" + product.productId}
            aria-label={`View ${product.name}`}
            className="btn btn-primary group/button !size-11 !p-0"
          >
            <FaArrowRight
              aria-hidden="true"
              className="group-hover/button:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}
