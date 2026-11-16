import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  FaArrowRight,
  FaMinus,
  FaPlus,
  FaShoppingBag,
  FaTrash,
} from "react-icons/fa";

import { addToCart, loadCart, removeFromCart } from "../utils/cart";

import { PageTransition } from "../components/PageTransition";
import { AuroraBackdrop } from "../components/brand/AuroraBackdrop";
import { CountUp } from "../components/brand/CountUp";
import { TiltCard } from "../components/brand/TiltCard";
import { EmptyState, ErrorState, Skeleton } from "../components/StateBlocks";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingProductId, setUpdatingProductId] = useState(null);

  // Which line item is waiting for the "really remove it?" confirmation.
  const [pendingRemoveId, setPendingRemoveId] = useState(null);

  const navigate = useNavigate();

  // =====================================================
  // REFRESH CART
  // =====================================================

  // Applies a successful cart response.
  const applyCart = useCallback((items) => {
    setCart(items);

    setLoadError("");
  }, []);

  // Applies a failed cart response.
  const applyCartError = useCallback(
    (error) => {
      console.log("Load Cart Error:", error);

      if (error.response?.status === 401 || error.code === "LOGIN_REQUIRED") {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      const message = error.response?.data?.message || "Unable to load cart";

      setLoadError(message);

      toast.error(message);
    },
    [navigate],
  );

  // Re-runs the exact same request (used by the retry button).
  async function refreshCart() {
    try {
      const items = await loadCart();

      applyCart(items);
    } catch (error) {
      applyCartError(error);
    } finally {
      setIsLoading(false);
    }
  }

  // =====================================================
  // RETRY HANDLER
  // Runs from the ErrorState button, so the loading state
  // can be raised here instead of inside the effect.
  // =====================================================

  function handleRetry() {
    setIsLoading(true);
    setLoadError("");

    refreshCart();
  }

  // =====================================================
  // LOAD CART FROM DATABASE
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("Please login to view your cart");
      navigate("/login");
      return undefined;
    }

    let active = true;

    loadCart()
      .then((items) => {
        if (!active) return;

        applyCart(items);
      })

      .catch((error) => {
        if (!active) return;

        applyCartError(error);
      })

      .finally(() => {
        if (!active) return;

        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applyCart, applyCartError, navigate]);

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  async function increaseQuantity(product) {
    if (product.quantity >= product.labelNo) {
      toast.error(`Only ${product.labelNo} item(s) available in stock`);
      return;
    }

    try {
      setUpdatingProductId(product.productId);

      const items = await addToCart(product, 1);

      setCart(items);
    } catch (error) {
      console.log("Increase Cart Error:", error);

      toast.error(error.response?.data?.message || "Unable to update cart");
    } finally {
      setUpdatingProductId(null);
    }
  }

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  async function decreaseQuantity(product) {
    try {
      setUpdatingProductId(product.productId);

      const items = await addToCart(product, -1);

      setCart(items);
    } catch (error) {
      console.log("Decrease Cart Error:", error);

      toast.error(error.response?.data?.message || "Unable to update cart");
    } finally {
      setUpdatingProductId(null);
    }
  }

  // =====================================================
  // REMOVE PRODUCT
  // =====================================================

  async function removeProduct(product) {
    try {
      setUpdatingProductId(product.productId);

      const items = await removeFromCart(product.productId);

      setCart(items);

      setPendingRemoveId(null);

      toast.success("Product removed from cart");
    } catch (error) {
      console.log("Remove Cart Error:", error);

      toast.error(error.response?.data?.message || "Unable to remove product");
    } finally {
      setUpdatingProductId(null);
    }
  }

  // =====================================================
  // TOTAL PRICE
  // =====================================================

  const totalPrice = cart.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);

  // =====================================================
  // TOTAL QUANTITY
  // =====================================================

  const totalQuantity = cart.reduce((total, product) => {
    return total + product.quantity;
  }, 0);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <PageTransition>
      <div
        className="
          relative
          w-full
          min-h-screen
          bg-canvas
          px-4
          md:px-8
          py-10
          overflow-hidden
        "
      >
        {/* Ambient aurora backdrop. */}
        <AuroraBackdrop />

        <div
          className="
            relative
            z-10
            max-w-7xl
            mx-auto
          "
        >
          {/* =================================================
              PAGE TITLE
          ================================================= */}

          <div className="mb-10">
            <div className="flex items-center gap-3">
              <span
                className="
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-md
                  bg-aurora-500/12
                  text-aurora-600
                  dark:text-aurora-300
                  shadow-[var(--shadow-e1)]
                "
              >
                <FaShoppingBag aria-hidden="true" className="size-4" />
              </span>

              <span className="badge badge-accent">Your Selection</span>
            </div>

            <h1
              className="
                mt-5
                text-3xl
                md:text-4xl
                font-display
                font-bold
                tracking-tight
                text-ink
              "
            >
              Shopping <span className="shimmer-text">Cart</span>
            </h1>

            <p
              className="
                mt-3
                max-w-xl
                text-ink-muted
              "
            >
              ඔබ තෝරාගත් NariCraft products මෙතනින් manage කරන්න.
            </p>

            <div
              className="
                mt-6
                h-1
                w-24
                rounded-full
                bg-gradient-to-r
                from-aurora-500
                via-cyan-glow
                to-violet-glow
              "
            />
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {isLoading && (
            <div
              className="
                grid
                lg:grid-cols-[1fr_360px]
                gap-8
                items-start
              "
            >
              <div className="flex flex-col gap-5">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="
                      surface
                      flex
                      flex-col
                      sm:flex-row
                      gap-5
                      p-4
                      md:p-5
                    "
                  >
                    <Skeleton className="h-[190px] w-full sm:w-[150px] shrink-0" />

                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-9 w-40" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-6">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-4 h-6 w-40" />
                <Skeleton className="mt-6 h-px w-full" />
                <Skeleton className="mt-6 h-4 w-full" />
                <Skeleton className="mt-4 h-4 w-2/3" />
                <Skeleton className="mt-8 h-12 w-full" />
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!isLoading && loadError && (
            <ErrorState
              title="We couldn't load your cart"
              message={loadError}
              onRetry={handleRetry}
            />
          )}

          {/* =================================================
              EMPTY CART
          ================================================= */}

          {!isLoading && !loadError && cart.length === 0 && (
            <div className="flex min-h-[420px] items-center justify-center">
              <EmptyState
                title="Your cart is empty"
                description="ඔබට කැමති NariCraft design එකක් තෝරාගෙන cart එකට add කරන්න."
                action={
                  <Link to="/products" className="btn btn-primary">
                    Explore Products
                    <FaArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                }
                className="w-full max-w-[480px]"
              />
            </div>
          )}

          {/* =================================================
              CART CONTENT
          ================================================= */}

          {!isLoading && !loadError && cart.length > 0 && (
            <div
              className="
                grid
                lg:grid-cols-[1fr_360px]
                gap-8
                items-start
              "
            >
              {/* =================================================
                  LEFT SIDE - CART PRODUCTS
              ================================================= */}

              <div className="flex flex-col gap-5">
                {cart.map((product) => {
                  const isUpdating = updatingProductId === product.productId;

                  const isPendingRemove = pendingRemoveId === product.productId;

                  return (
                    <TiltCard
                      key={product.productId}
                      onClick={() => {
                        navigate(`/overview/${product.productId}`);
                      }}
                      className="
                        card-3d
                        card-glow
                        group
                        flex
                        flex-col
                        sm:flex-row
                        gap-5
                        p-4
                        md:p-5
                        cursor-pointer
                      "
                    >
                      {/* ================= IMAGE ================= */}

                      <div
                        className="
                          relative
                          w-full
                          sm:w-[150px]
                          h-[190px]
                          shrink-0
                          overflow-hidden
                          rounded-md
                          bg-surface-2
                          border
                          border-line
                        "
                      >
                        <div
                          className="
                            depth-1
                            h-full
                            w-full
                            transition-transform
                            duration-500
                            group-hover:scale-[1.06]
                          "
                        >
                          <img
                            src={product.image || "/placeholder.png"}
                            alt={product.name}
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        </div>
                      </div>

                      {/* ================= DETAILS ================= */}

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p
                            className="
                              font-mono
                              text-[10px]
                              font-bold
                              tracking-[0.18em]
                              uppercase
                              text-aurora-600
                              dark:text-aurora-300
                            "
                          >
                            {product.productId}
                          </p>

                          <h2
                            className="
                              mt-2
                              text-xl
                              md:text-2xl
                              font-display
                              font-bold
                              text-ink
                            "
                          >
                            <Link
                              to={`/overview/${product.productId}`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="
                                rounded-sm
                                transition-colors
                                duration-200
                                hover:text-aurora-600
                                dark:hover:text-aurora-300
                              "
                            >
                              {product.name}
                            </Link>
                          </h2>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="badge badge-info">
                              Stock: {product.labelNo}
                            </span>

                            <span className="badge">
                              Qty: {product.quantity}
                            </span>
                          </div>
                        </div>

                        {/* ================= BOTTOM ================= */}

                        <div
                          className="
                            mt-6
                            flex
                            flex-col
                            md:flex-row
                            md:items-end
                            justify-between
                            gap-5
                          "
                        >
                          {/* ================= PRICE ================= */}

                          <div>
                            <p
                              className="
                                text-[10px]
                                uppercase
                                font-bold
                                tracking-wide
                                text-ink-muted
                              "
                            >
                              Price
                            </p>

                            <p
                              className="
                                mt-1
                                text-2xl
                                font-display
                                font-bold
                                text-ink
                              "
                            >
                              <span className="text-xs mr-1 text-ink-muted">
                                LKR
                              </span>

                              {product.price?.toLocaleString()}
                            </p>
                          </div>

                          {/* ================= QUANTITY + DELETE ================= */}

                          <div className="flex items-center gap-3">
                            {/* ================= QUANTITY ================= */}

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                rounded-md
                                border
                                border-line
                                bg-surface-2
                                p-1.5
                              "
                            >
                              {/* MINUS */}

                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                disabled={isUpdating}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  decreaseQuantity(product);
                                }}
                                className="
                                  btn
                                  btn-secondary
                                  !size-8
                                  !p-0
                                  !rounded-sm
                                "
                              >
                                <FaMinus size={10} aria-hidden="true" />
                              </button>

                              {/* QUANTITY NUMBER */}

                              <span
                                aria-live="polite"
                                className="
                                  min-w-[28px]
                                  text-center
                                  font-display
                                  font-bold
                                  text-ink
                                "
                              >
                                {product.quantity}
                              </span>

                              {/* PLUS */}

                              <button
                                type="button"
                                aria-label="Increase quantity"
                                disabled={
                                  isUpdating ||
                                  product.quantity >= product.labelNo
                                }
                                onClick={(e) => {
                                  e.stopPropagation();

                                  increaseQuantity(product);
                                }}
                                className="
                                  btn
                                  btn-primary
                                  !size-8
                                  !p-0
                                  !rounded-sm
                                "
                              >
                                <FaPlus size={10} aria-hidden="true" />
                              </button>
                            </div>

                            {/* ================= DELETE ================= */}

                            <button
                              type="button"
                              aria-label={`Remove ${product.name} from cart`}
                              disabled={isUpdating}
                              onClick={(e) => {
                                e.stopPropagation();

                                setPendingRemoveId(
                                  isPendingRemove ? null : product.productId,
                                );
                              }}
                              className="
                                btn
                                btn-danger
                                !size-11
                                !p-0
                              "
                            >
                              <FaTrash size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        {/* ================= REMOVE CONFIRMATION ================= */}

                        {isPendingRemove && (
                          <div
                            className="
                              pop-in
                              mt-4
                              rounded-md
                              border
                              border-danger/30
                              bg-danger/5
                              p-4
                            "
                          >
                            <p className="text-sm text-ink">
                              Remove{" "}
                              <span className="font-semibold">
                                {product.name}
                              </span>{" "}
                              from your cart?
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  removeProduct(product);
                                }}
                                className="btn btn-danger"
                              >
                                Yes, remove it
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setPendingRemoveId(null);
                                }}
                                className="btn btn-secondary"
                              >
                                Keep it
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </TiltCard>
                  );
                })}
              </div>

              {/* =================================================
                  RIGHT SIDE - ORDER SUMMARY
              ================================================= */}

              <aside
                className="
                  glass
                  pop-in
                  rounded-xl
                  p-6
                  lg:sticky
                  lg:top-24
                  shadow-[var(--shadow-e3)]
                "
              >
                <p
                  className="
                    font-mono
                    text-[10px]
                    font-bold
                    tracking-[0.3em]
                    uppercase
                    text-aurora-600
                    dark:text-aurora-300
                  "
                >
                  NARICRAFT
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-display
                    font-bold
                    text-ink
                  "
                >
                  Order Summary
                </h2>

                <div className="my-6 h-px w-full bg-line" />

                {/* ================= PRODUCTS ================= */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    text-sm
                  "
                >
                  <span className="text-ink-muted">Products</span>

                  <span className="font-display font-bold text-ink">
                    {cart.length}
                  </span>
                </div>

                {/* ================= TOTAL QUANTITY ================= */}

                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-between
                    text-sm
                  "
                >
                  <span className="text-ink-muted">Total Quantity</span>

                  <span className="font-display font-bold text-ink">
                    {totalQuantity}
                  </span>
                </div>

                <div className="my-6 h-px w-full bg-line" />

                {/* ================= TOTAL ================= */}

                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        uppercase
                        font-bold
                        tracking-wide
                        text-ink-muted
                      "
                    >
                      Total
                    </p>

                    <p className="mt-1 text-xs text-ink-muted">
                      Delivery excluded
                    </p>
                  </div>

                  <p
                    className="
                      text-right
                      text-2xl
                      font-display
                      font-bold
                      text-ink
                    "
                  >
                    <CountUp
                      value={totalPrice}
                      decimals={2}
                      prefix="LKR "
                    />
                  </p>
                </div>

                {/* =================================================
                    PROCEED TO CHECKOUT
                ================================================= */}

                <Link
                  to="/checkout"
                  className="btn btn-primary mt-7 w-full !py-4"
                >
                  Proceed to Checkout
                  <FaArrowRight aria-hidden="true" className="size-4" />
                </Link>

                {/* ================= CONTINUE SHOPPING ================= */}

                <Link
                  to="/products"
                  className="btn btn-ghost mt-3 w-full"
                >
                  Continue Shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
