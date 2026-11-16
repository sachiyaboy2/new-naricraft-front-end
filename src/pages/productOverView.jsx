import { shareProduct } from "../utils/shareProduct.js";
import { API_URL } from "../utils/config.js";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

import { FaCartPlus } from "react-icons/fa";
import { ArrowLeft, ChevronLeft, PackageOpen, Share2 } from "lucide-react";

import PageTransition from "../components/PageTransition";
import ImageSlider from "../components/imageSlider";
import { AuroraBackdrop } from "../components/brand/AuroraBackdrop";
import { Reveal } from "../components/brand/useReveal";
import { ErrorState, Skeleton } from "../components/StateBlocks";

import { addToCart } from "../utils/cart";

export default function ProductOverView() {
  const params = useParams();

  const [status, setStatus] = useState("loading");

  const [product, setProduct] = useState(null);

  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  // The request is unchanged — bumping `attempt` re-runs it for the retry.
  const [attempt, setAttempt] = useState(0);

  const latestAttempt = useRef(0);

  useEffect(() => {
    latestAttempt.current = attempt;

    axios
      .get(API_URL + "/api/products/" + params.id)

      .then((res) => {
        // A response that arrives after a newer attempt started is ignored.
        if (latestAttempt.current !== attempt) return;

        setProduct(res.data);

        setStatus("success");
      })

      .catch((err) => {
        if (latestAttempt.current !== attempt) return;

        console.log(err);

        toast.error("Error loading product");

        const code = err.response?.status ?? err.status;

        if (code === 404) {
          setStatus("notfound");
        } else {
          setStatus("error");
        }
      });
  }, [params.id, attempt]);

  // Re-runs the exact same request.
  function refetch() {
    setStatus("loading");

    setAttempt((current) => current + 1);
  }

  return (
    <PageTransition>
      <div
        className="
          relative
          w-full
          min-h-screen
          bg-canvas
          px-4
          py-10
          md:px-8
          md:py-14
        "
      >
        <AuroraBackdrop />

        <div
          className="
            relative
            mx-auto
            w-full
            max-w-7xl
          "
        >
          {/* =================================================
              BACK TO THE COLLECTION
          ================================================= */}

          <Link
            to="/products"
            className="
              btn
              btn-ghost
              !px-3
              !py-2
              !text-sm
            "
          >
            <ChevronLeft aria-hidden="true" className="size-4" />

            All designs
          </Link>

          {/* =================================================
              LOADING
          ================================================= */}

          {status === "loading" && <ProductSkeleton />}

          {/* =================================================
              NOT FOUND
          ================================================= */}

          {status === "notfound" && <ProductNotFound />}

          {/* =================================================
              ERROR
          ================================================= */}

          {status === "error" && (
            <div className="mt-10">
              <ErrorState
                title="We could not load this product"
                message="Something went wrong while fetching the design. Please try again."
                onRetry={refetch}
              />
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {status === "success" && product && (
            <div
              className="
                mt-8
                grid
                grid-cols-1
                items-start
                gap-10
                lg:grid-cols-2
                lg:gap-14
              "
            >
              {/* ================= LEFT SIDE ================= */}

              <Reveal immediate>
                <ProductGallery
                  images={product.images}
                  name={product.name}
                />
              </Reveal>

              {/* ================= RIGHT SIDE ================= */}

              <Reveal immediate delay={120}>
                <ProductDetails product={product} />
              </Reveal>
            </div>
          )}
        </div>
      </div>

      <style>{`

  /* The main product image tilts toward the pointer. The gallery keeps its
     own behaviour; only the big frame reacts to the pointer. */
  .nari-gallery > div > div:first-child {
    transform:
      perspective(1100px)
      rotateX(var(--rx, 0deg))
      rotateY(var(--ry, 0deg))
      scale(1.02);
    transform-style: preserve-3d;
    transition:
      transform 320ms var(--ease-out-expo),
      box-shadow 320ms var(--ease-out-expo);
    will-change: transform;
  }

  .nari-gallery.is-tilting > div > div:first-child {
    transition:
      transform 80ms linear,
      box-shadow 320ms var(--ease-out-expo);
  }

  .nari-gallery > div > div:first-child:hover {
    box-shadow: var(--shadow-e4);
  }

`}</style>
    </PageTransition>
  );
}

// =====================================================
// 3D GALLERY
// The main image tilts toward the pointer, the same technique the
// TiltCard uses: --rx / --ry are written on the element.
// =====================================================

function ProductGallery(props) {
  const galleryRef = useRef(null);

  const onPointerMove = useCallback((event) => {
    const node = galleryRef.current;

    if (!node) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const rect = node.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    node.style.setProperty("--ry", `${(x * 6 * 2).toFixed(2)}deg`);
    node.style.setProperty("--rx", `${(-y * 6 * 2).toFixed(2)}deg`);

    node.classList.add("is-tilting");
  }, []);

  const onPointerLeave = useCallback(() => {
    const node = galleryRef.current;

    if (!node) return;

    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");

    node.classList.remove("is-tilting");
  }, []);

  return (
    <div
      ref={galleryRef}
      className="nari-gallery"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <ImageSlider images={props.images} />
    </div>
  );
}

// =====================================================
// LOADING PLACEHOLDER
// =====================================================

function ProductSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading product"
      className="
        mt-8
        grid
        grid-cols-1
        items-start
        gap-10
        lg:grid-cols-2
        lg:gap-14
      "
    >
      {/* IMAGE */}

      <div>
        <Skeleton className="h-[420px] w-full rounded-[28px] lg:h-[520px]" />

        <div className="mt-4 flex items-center gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_item, index) => (
            <Skeleton key={index} className="size-[82px] shrink-0 rounded-xl" />
          ))}
        </div>
      </div>

      {/* SPEC PANEL */}

      <div
        className="
          rounded-2xl
          border
          border-line
          bg-surface
          p-7
          shadow-[var(--shadow-e2)]
          md:p-9
        "
      >
        <Skeleton className="h-6 w-32" />

        <Skeleton className="mt-5 h-10 w-3/4" />

        <Skeleton className="mt-3 h-4 w-1/2" />

        <Skeleton className="mt-6 h-20 w-full" />

        <div className="mt-7 grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>

        <Skeleton className="mt-8 h-12 w-full" />
      </div>
    </div>
  );
}

// =====================================================
// PRODUCT NOT FOUND
// =====================================================

function ProductNotFound() {
  return (
    <div
      className="
        surface
        mx-auto
        mt-16
        max-w-xl
        px-6
        py-16
        text-center
      "
    >
      <span
        className="
          mx-auto
          flex
          size-14
          items-center
          justify-center
          rounded-2xl
          bg-surface-2
          text-ink-muted
        "
      >
        <PackageOpen aria-hidden="true" className="size-7" />
      </span>

      <h1
        className="
          mt-5
          font-display
          text-2xl
          font-black
          text-ink
        "
      >
        Product not found
      </h1>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-ink-muted
        "
      >
        This design may have been removed from the collection, or the link is
        out of date. Browse the catalogue to find something you love.
      </p>

      <Link to="/products" className="btn btn-primary mt-7">
        <ArrowLeft aria-hidden="true" className="size-4" />

        Back to products
      </Link>
    </div>
  );
}

// =====================================================
// RIGHT SIDE PRODUCT DETAILS
// =====================================================

function ProductDetails(props) {
  const product = props.product;

  const navigate = useNavigate();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [manualShareUrl, setManualShareUrl] = useState("");
  async function handleShare() {
    setIsSharing(true);
    try {
      const result = await shareProduct(product);
      setManualShareUrl(result.status === "manual" ? result.url : "");
      if (result.status === "copied") toast.success("Product link copied. Paste it to share.");
    } catch { toast.error("Unable to share this product"); }
    finally { setIsSharing(false); }
  }

  // =====================================================
  // ADD TO CART
  // =====================================================

  async function handleAddToCart() {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("Please login to add products to your cart");
      navigate("/login");
      return;
    }

    if (product.labelNo < 1) {
      toast.error("This product is out of stock");
      return;
    }

    try {
      setIsAddingToCart(true);

      await addToCart(product, 1);

      toast.success("Product added to cart 🛒");
    } catch (error) {
      console.log("Add To Cart Error:", error);

      toast.error(error.response?.data?.message || "Unable to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  }

  // =====================================================
  // ORDER NOW
  // =====================================================

  function handleOrderNow() {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    if (product.labelNo < 1) {
      toast.error("This product is out of stock");
      return;
    }

    navigate("/checkout", {
      state: {
        buyNow: true,
        product: {
          productId: product.productId,
          name: product.name,
          price: product.price,
          labelNo: product.labelNo,
          quantity: 1,
          image: product.images?.[0],
        },
      },
    });
  }

  const isOutOfStock = product.labelNo < 1;

  return (
    /* =====================================================
        The specification panel is glass, so the aurora blobs
        drifting behind it show through.
    ===================================================== */

    <section
      className="
        relative
        overflow-hidden
      "
    >
      <AuroraBackdrop />

      <div
        className="
          glass
          relative
          rounded-2xl
          p-7
          md:p-9
        "
      >
        {/* =================================================
            CATEGORY + SHARE BUTTON
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-5
          "
        >
          {/* CATEGORY */}

          <div
            className="
              inline-block
              rounded-full
              bg-aurora-500/15
              px-4
              py-2
              text-xs
              font-bold
              tracking-wider
              text-aurora-600
              dark:text-aurora-300
            "
          >
            {product.category}
          </div>

          {/* =================================================
              ADD TO CART
          ================================================= */}

          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            title="Share product"
            aria-label="Share product"
            className="
              btn
              btn-secondary
              !size-12
              !p-0
            "
          >
            <Share2
              aria-hidden="true"
              size={18}
              className="
                transition-transform
              "
            />
          </button>
        </div>

        {manualShareUrl && <div className="mt-4" role="status">
          <label className="label" htmlFor="share-product-link">Copy this link to share the product</label>
          <input id="share-product-link" className="field" readOnly value={manualShareUrl} onFocus={event => event.target.select()} />
        </div>}

        {/* =================================================
            PRODUCT NAME
        ================================================= */}

        <h1
          className="
            mt-5
            font-display
            text-3xl
            font-black
            text-ink
            md:text-4xl
          "
        >
          {product.name}
        </h1>

        {/* =================================================
            ALT NAMES
        ================================================= */}

        {product.altNames?.length > 0 && (
          <p
            className="
              mt-2
              text-sm
              text-ink-muted
            "
          >
            {product.altNames.join(", ")}
          </p>
        )}

        {/* =================================================
            PRODUCT ID
        ================================================= */}

        <p
          className="
            mt-4
            font-mono
            text-xs
            font-bold
            tracking-[0.15em]
            text-ink-muted
          "
        >
          PRODUCT ID : {product.productId}
        </p>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div
          className="
            my-6
            h-px
            w-full
            bg-line
          "
        />

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div>
          <h3
            className="
              mb-2
              font-display
              text-sm
              font-bold
              text-ink
            "
          >
            Description
          </h3>

          <p
            className="
              leading-7
              text-ink-2
            "
          >
            {product.description}
          </p>
        </div>

        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <div
          className="
            mt-7
            grid
            grid-cols-2
            gap-4
          "
        >
          {/* STOCK */}

          <div
            className="
              rounded-2xl
              border
              border-line
              bg-surface-2/60
              p-4
            "
          >
            <p
              className="
                text-xs
                font-bold
                text-ink-muted
              "
            >
              Stocks
            </p>

            <p
              className="
                mt-1
                font-display
                text-xl
                font-black
                text-ink
              "
            >
              {product.labelNo}
            </p>

            <span
              className={`
                badge
                mt-2
                ${isOutOfStock ? "badge-danger" : "badge-success"}
              `}
            >
              {isOutOfStock ? "Out of stock" : "In stock"}
            </span>
          </div>

          {/* CATEGORY */}

          <div
            className="
              rounded-2xl
              border
              border-line
              bg-surface-2/60
              p-4
            "
          >
            <p
              className="
                text-xs
                font-bold
                text-ink-muted
              "
            >
              Category
            </p>

            <p
              className="
                mt-1
                font-display
                text-xl
                font-black
                text-ink
              "
            >
              {product.category}
            </p>
          </div>
        </div>

        {/* =================================================
            PRICE + BUTTONS
        ================================================= */}

        <div
          className="
            mt-8
            flex
            flex-col
            justify-between
            gap-5
            sm:flex-row
            sm:items-end
          "
        >
          {/* PRICE */}

          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                text-ink-muted
              "
            >
              Price
            </p>

            <p
              className="
                mt-1
                font-display
                text-3xl
                font-black
                text-ink
              "
            >
              <span
                className="
                  mr-1
                  text-sm
                  text-ink-muted
                "
              >
                LKR
              </span>

              {product.price?.toLocaleString()}
            </p>
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            {/* ================= CANCEL ================= */}

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                btn
                btn-ghost
              "
            >
              ← Cancel
            </button>

            {/* ================= ADD TO CART ================= */}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart || isOutOfStock}
              className="
                btn
                btn-secondary
              "
            >
              <FaCartPlus aria-hidden="true" size={15} />

              {isAddingToCart ? "Adding…" : "Add to Cart"}
            </button>

            {/* ================= ORDER NOW ================= */}

            <button
              type="button"
              onClick={handleOrderNow}
              disabled={isOutOfStock}
              className="
                btn
                btn-primary
              "
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
