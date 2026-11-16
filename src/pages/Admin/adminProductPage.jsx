import { API_URL } from "../../utils/config.js";
import axios from "axios";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toast } from "react-hot-toast";

import { FaRegEdit } from "react-icons/fa";
import { FiImage, FiPlusCircle } from "react-icons/fi";
import { IoCloseCircleSharp } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";

import { Link } from "react-router-dom";

import { AuroraBackdrop } from "../../components/brand/AuroraBackdrop";
import { CountUp } from "../../components/brand/CountUp";
import { Reveal } from "../../components/brand/useReveal";
import { PageTransition } from "../../components/PageTransition";
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "../../components/StateBlocks";

// =====================================================
// SMALL HELPERS
// =====================================================

/**
 * Rounded thumbnail for a product. Falls back to a neutral placeholder
 * when the product has no image or the image cannot be loaded.
 */
function ProductThumb({ product }) {
  const [failed, setFailed] = useState(false);

  const source = product.images?.[0];

  if (!source || failed) {
    return (
      <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
        <FiImage aria-hidden="true" className="size-5" />
      </span>
    );
  }

  return (
    <img
      src={source}
      alt={product.name ? `${product.name} product image` : "Product image"}
      onError={() => setFailed(true)}
      className="h-14 w-14 rounded-lg border border-line object-cover shadow-[var(--shadow-e1)]"
    />
  );
}

/** Stock pill: success while healthy, warning when low, danger when empty. */
function StockBadge({ stock }) {
  const value = Number(stock);

  if (!Number.isFinite(value) || value <= 0) {
    return <span className="badge badge-danger">Out of stock</span>;
  }

  if (value <= 5) {
    return (
      <span className="badge badge-warning">
        Low stock &middot; {value}
      </span>
    );
  }

  return (
    <span className="badge badge-success">
      In stock &middot; {value}
    </span>
  );
}

// =====================================================
// DELETE CONFIRM POPUP
// =====================================================

function ProductDeleteConform(props) {
  const close = props.close;

  const productId = props.productId;

  const refresh = props.refresh;

  const dialogRef = useRef(null);

  const cancelRef = useRef(null);

  const [isDeleting, setIsDeleting] = useState(false);

  // =====================================================
  // FOCUS TRAP + ESCAPE TO CLOSE
  // =====================================================

  useEffect(() => {
    const previouslyFocused = document.activeElement;

    cancelRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();

        close();

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const node = dialogRef.current;

      if (!node) {
        return;
      }

      const focusables = node.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];

      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();

        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();

        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [close]);

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  function deleteProduct() {
    const token = localStorage.getItem("token");

    setIsDeleting(true);

    axios
      .delete(API_URL + "/api/products/" + productId, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      .then((res) => {
        console.log(res.data);

        close();

        toast.success("Product deleted successfully");

        refresh();
      })

      .catch((err) => {
        console.log(err);

        toast.error("Failed to delete product");

        setIsDeleting(false);
      });
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        p-4
        bg-ink/40
        backdrop-blur-sm
      "
      onClick={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          close();
        }
      }}
    >
      {/* ================= MODAL ================= */}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        className="
          pop-in
          w-full
          max-w-[460px]
          surface-elevated
          card-glow
          overflow-hidden
        "
      >
        {/* ================= CLOSE BUTTON ================= */}

        <button
          type="button"
          onClick={close}
          aria-label="Close delete confirmation"
          className="
            btn
            btn-ghost
            absolute
            top-4
            right-4
            z-10
            !rounded-full
            !p-2
            hover:rotate-90
          "
        >
          <IoCloseCircleSharp aria-hidden="true" className="size-5" />
        </button>

        {/* ================= CONTENT ================= */}

        <div className="flex flex-col items-center px-7 pt-10 pb-7">
          {/* DELETE ICON */}

          <div
            className="
              relative
              mb-5
              flex
              h-[82px]
              w-[82px]
              items-center
              justify-center
              rounded-full
              border
              border-danger/30
              bg-danger/10
            "
          >
            <span
              aria-hidden="true"
              className="
                absolute
                inset-2
                rounded-full
                bg-danger/10
                animate-pulse
              "
            />

            <MdDeleteOutline
              aria-hidden="true"
              className="relative z-10 size-10 text-danger"
            />
          </div>

          {/* TITLE */}

          <h2
            id="delete-product-title"
            className="text-center font-display text-2xl font-extrabold text-ink"
          >
            Delete Product?
          </h2>

          {/* DESCRIPTION */}

          <p className="mt-3 max-w-[350px] text-center text-sm leading-6 text-ink-muted">
            Are you sure you want to delete this product from your NariCraft
            collection?
          </p>

          {/* PRODUCT ID BOX */}

          <div
            className="
              mt-5
              flex
              w-full
              items-center
              justify-between
              gap-3
              rounded-xl
              border
              border-line
              bg-surface-2
              px-5
              py-4
            "
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                Product ID
              </p>

              <p className="mt-1 font-mono text-lg font-bold text-ink">
                {productId}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-danger/10
                text-danger
              "
            >
              <MdDeleteOutline className="size-5" />
            </span>
          </div>

          {/* WARNING */}

          <div
            className="
              mt-4
              w-full
              rounded-xl
              border
              border-warning/30
              bg-warning/10
              px-4
              py-3
            "
          >
            <p className="text-center text-xs font-semibold text-warning">
              This action cannot be undone.
            </p>
          </div>

          {/* ================= BUTTONS ================= */}

          <div className="mt-7 grid w-full grid-cols-2 gap-3">
            {/* CANCEL */}

            <button
              ref={cancelRef}
              type="button"
              onClick={close}
              disabled={isDeleting}
              className="btn btn-secondary !py-3"
            >
              Cancel
            </button>

            {/* DELETE */}

            <button
              type="button"
              onClick={deleteProduct}
              disabled={isDeleting}
              className="btn btn-danger !py-3"
            >
              <MdDeleteOutline aria-hidden="true" className="size-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// ADMIN PRODUCT PAGE
// =====================================================

export default function AdminProductPage() {
  const [products, setProducts] = useState([]);

  const [isDeleteConformeVisible, setIsDeleteConformeVisible] = useState(false);

  const [productToDelete, setProductToDelete] = useState(null);

  const [reloadToken, setReloadToken] = useState(0);

  // The result of the request that belongs to `reloadToken`. While the token
  // does not match, the page is still loading — this keeps the loading state
  // derivable instead of forcing a render from inside the effect.
  const [result, setResult] = useState({
    token: -1,
    status: "loading",
    error: "",
  });

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    axios
      .get(API_URL + "/api/products")

      .then((res) => {
        if (cancelled) {
          return;
        }

        console.log(res.data);

        setProducts(Array.isArray(res.data) ? res.data : []);

        setResult({ token: reloadToken, status: "ready", error: "" });
      })

      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.log(err);

        setResult({
          token: reloadToken,
          status: "error",
          error:
            "We could not reach the product service. Make sure the server is running and try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const status = result.token === reloadToken ? result.status : "loading";

  const errorMessage = result.token === reloadToken ? result.error : "";

  // =====================================================
  // ACTIONS
  // =====================================================

  const refreshProducts = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteConformeVisible(false);
  }, []);

  const openDeleteModal = useCallback((id) => {
    setProductToDelete(id);

    setIsDeleteConformeVisible(true);
  }, []);

  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {
    let inStock = 0;

    let lowStock = 0;

    let outOfStock = 0;

    products.forEach((product) => {
      const stock = Number(product.labelNo);

      if (!Number.isFinite(stock) || stock <= 0) {
        outOfStock += 1;
      } else if (stock <= 5) {
        lowStock += 1;
      } else {
        inStock += 1;
      }
    });

    return {
      total: products.length,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const statTiles = [
    {
      key: "total",
      label: "Total products",
      value: stats.total,
      tone: "text-aurora-600 dark:text-aurora-300",
      chip: "bg-aurora-500/12",
    },
    {
      key: "inStock",
      label: "Healthy stock",
      value: stats.inStock,
      tone: "text-success",
      chip: "bg-success/12",
    },
    {
      key: "outOfStock",
      label: "Needs attention",
      value: stats.lowStock + stats.outOfStock,
      tone: "text-warning",
      chip: "bg-warning/12",
    },
  ];

  return (
    <PageTransition>
      <div className="relative min-h-full w-full overflow-hidden bg-canvas p-4 sm:p-6">
        <AuroraBackdrop />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          {/* =================================================
              HEADER
          ================================================= */}

          <Reveal immediate>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="badge badge-accent">
                  NariCraft Admin
                </span>

                <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
                  Product Management
                </h1>

                <p className="mt-2 max-w-xl text-sm text-ink-muted">
                  Every product in your NariCraft collection — imagery, pricing,
                  stock levels and categories in one place.
                </p>
              </div>

              <Link to="/admin/add-product" className="btn btn-primary w-fit">
                <FiPlusCircle aria-hidden="true" className="size-4" />
                Add Product
              </Link>
            </div>
          </Reveal>

          {/* =================================================
              STATS
          ================================================= */}

          <Reveal delay={90}>
            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              {statTiles.map((tile) => (
                <div
                  key={tile.key}
                  className="glass flex items-center gap-4 px-5 py-4"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${tile.chip}`}
                  >
                    <span className={`size-2.5 rounded-full ${tile.tone}`} />
                  </span>

                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                      {tile.label}
                    </dt>

                    <dd className="mt-0.5 font-display text-2xl font-extrabold text-ink">
                      <CountUp value={tile.value} />
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* =================================================
              TABLE / STATES
          ================================================= */}

          <Reveal delay={150} className="mt-6">
            {/* ---------- LOADING ---------- */}

            {status === "loading" && (
              <div className="table-shell">
                <TableSkeleton rows={6} columns={6} />
              </div>
            )}

            {/* ---------- ERROR ---------- */}

            {status === "error" && (
              <ErrorState
                title="Could not load products"
                message={errorMessage}
                onRetry={refreshProducts}
              />
            )}

            {/* ---------- EMPTY ---------- */}

            {status === "ready" && products.length === 0 && (
              <EmptyState
                title="No products yet"
                description="Your collection is empty. Add the first product and it will appear here straight away."
                action={
                  <Link to="/admin/add-product" className="btn btn-primary">
                    <FiPlusCircle aria-hidden="true" className="size-4" />
                    Add your first product
                  </Link>
                }
              />
            )}

            {/* ---------- TABLE ---------- */}

            {status === "ready" && products.length > 0 && (
              <div className="table-shell">
                <div className="overflow-x-auto">
                  <table className="nari-table">
                    <caption className="sr-only">
                      Products in the NariCraft catalogue
                    </caption>

                    {/* ================= TABLE HEADER ================= */}

                    <thead>
                      <tr>
                        <th scope="col" className="text-center">
                          Image
                        </th>

                        <th scope="col">Product ID</th>

                        <th scope="col">Name</th>

                        <th scope="col">Alt Name</th>

                        <th scope="col">Description</th>

                        <th scope="col">Price</th>

                        <th scope="col" className="text-center">
                          Stocks
                        </th>

                        <th scope="col">Category</th>

                        <th scope="col" className="text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* ================= TABLE BODY ================= */}

                    <tbody>
                      {products.map((product) => {
                        const productName =
                          product.name || `Product ${product.productId}`;

                        return (
                          <tr key={product.productId}>
                            {/* IMAGE */}

                            <td data-label="Image" className="text-center">
                              <div className="flex justify-center">
                                <ProductThumb product={product} />
                              </div>
                            </td>

                            {/* PRODUCT ID */}

                            <td
                              data-label="Product ID"
                              className="font-mono text-xs font-semibold text-ink-2"
                            >
                              {product.productId}
                            </td>

                            {/* NAME */}

                            <td data-label="Name" className="font-semibold text-ink">
                              {product.name}
                            </td>

                            {/* ALT NAMES */}

                            <td data-label="Alt Name" className="text-ink-2">
                              {Array.isArray(product.altNames)
                                ? product.altNames.join(", ")
                                : product.altNames}
                            </td>

                            {/* DESCRIPTION */}

                            <td
                              data-label="Description"
                              className="max-w-xs truncate text-ink-2"
                              title={product.description}
                            >
                              {product.description}
                            </td>

                            {/* PRICE */}

                            <td
                              data-label="Price"
                              className="font-display font-bold text-ink"
                            >
                              LKR {product.price?.toLocaleString()}
                            </td>

                            {/* STOCK */}

                            <td data-label="Stocks" className="text-center">
                              <StockBadge stock={product.labelNo} />
                            </td>

                            {/* CATEGORY */}

                            <td data-label="Category">
                              <span className="badge">{product.category}</span>
                            </td>

                            {/* ================= ACTIONS ================= */}

                            <td data-label="Actions">
                              <div className="flex items-center justify-center gap-2">
                                {/* EDIT */}

                                <Link
                                  to={`/admin/update-product/${product.productId}`}
                                  state={product}
                                  title="Edit"
                                  aria-label={`Edit ${productName}`}
                                  className="btn btn-secondary !rounded-md !px-2.5 !py-2"
                                >
                                  <FaRegEdit
                                    aria-hidden="true"
                                    className="size-4"
                                  />
                                </Link>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  title="Delete"
                                  aria-label={`Delete ${productName}`}
                                  className="btn btn-danger !rounded-md !px-2.5 !py-2"
                                  onClick={() => {
                                    openDeleteModal(product.productId);
                                  }}
                                >
                                  <MdDeleteOutline
                                    aria-hidden="true"
                                    className="size-4"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Reveal>
        </div>

        {/* =================================================
            FLOATING ADD BUTTON
        ================================================= */}

        <Link
          to="/admin/add-product"
          aria-label="Add new product"
          title="Add new product"
          className="
            btn
            btn-primary
            fixed
            bottom-6
            right-6
            z-30
            !rounded-full
            !p-4
            shadow-[var(--shadow-glow)]
          "
        >
          <FiPlusCircle aria-hidden="true" className="size-6" />
        </Link>

        {/* =================================================
            DELETE POPUP
        ================================================= */}

        {isDeleteConformeVisible && (
          <ProductDeleteConform
            refresh={refreshProducts}
            productId={productToDelete}
            close={closeDeleteModal}
          />
        )}
      </div>
    </PageTransition>
  );
}
