import { useWishlist } from "../utils/useWishlist.js";
import { API_URL } from "../utils/config.js";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";

import PageTransition from "../components/PageTransition";
import ProductCard from "../components/productCard";
import { AuroraBackdrop } from "../components/brand/AuroraBackdrop";
import { CountUp } from "../components/brand/CountUp";
import { Reveal } from "../components/brand/useReveal";
import {
  EmptyState,
  ErrorState,
  ProductCardSkeleton,
} from "../components/StateBlocks";

export function ProductPage() {
  const [products, setProducts] = useState([]);
  const wishlist = useWishlist();
  const [favouritesOnly, setFavouritesOnly] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [hasError, setHasError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  // The request is unchanged — `refetch` only re-runs it.
  useEffect(() => {
    if (isLoading) {
      axios
        .get(API_URL + "/api/products")

        .then((response) => {
          setProducts(response.data);

          setIsLoading(false);
        })

        .catch((error) => {
          console.log(error);

          setHasError(true);

          setIsLoading(false);

          toast.error("Failed to load products");
        });
    }
  }, [isLoading]);

  // Re-runs the exact same request.
  function refetch() {
    setHasError(false);

    setIsLoading(true);
  }

  // =====================================================
  // GET ALL CATEGORIES
  // duplicate categories අයින් කරනවා
  // =====================================================

  // =====================================================
  // CATEGORY DISPLAY ORDER
  // Saree Jackets always at the top.
  // Preschool Uniforms + Association T-Shirts always at the bottom.
  // =====================================================

  const categoryOrder = [
    "Saree Jackets",
    "Blouses",
    "Frocks",
    "Crop Tops",
    "Premium",
    "Traditional",
    "Preschool Uniforms",
    "Association T-Shirts",
  ];

  const availableCategories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  const knownCategories = categoryOrder.filter((category) =>
    availableCategories.includes(category),
  );

  const otherCategories = availableCategories.filter(
    (category) => !categoryOrder.includes(category),
  );

  const categories = [
    ...knownCategories.filter(
      (category) =>
        category !== "Preschool Uniforms" &&
        category !== "Association T-Shirts",
    ),
    ...otherCategories,
    ...knownCategories.filter(
      (category) =>
        category === "Preschool Uniforms" ||
        category === "Association T-Shirts",
    ),
  ];

  // =====================================================
  // CATEGORY DISPLAY LABEL
  // =====================================================

  function getCategoryLabel(category) {
    if (category === "Premium") {
      return "Premium Collection";
    }

    return category;
  }

  // =====================================================
  // SEARCH + CATEGORY FILTER
  // =====================================================

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const searchableText = [
      product.productId,
      product.name,
      Array.isArray(product.altNames)
        ? product.altNames.join(" ")
        : product.altNames,
      product.description,
      product.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedSearch === "" || searchableText.includes(normalizedSearch);

    return matchesCategory && matchesSearch && (!favouritesOnly || wishlist.includes(product.productId));
  });

  const visibleCategories = categories.filter((category) =>
    filteredProducts.some((product) => product.category === category),
  );

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
    setFavouritesOnly(false);
  }

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "All" || favouritesOnly;

  // =====================================================
  // FILTER CHIP STYLES
  // =====================================================

  function getChipClass(isActive) {
    return `
      shrink-0
      rounded-full
      border
      px-4
      py-2.5
      text-sm
      font-bold
      transition-all
      duration-200
      ${
        isActive
          ? "border-aurora-500/50 bg-aurora-500/15 text-aurora-600 shadow-[var(--shadow-e2)] dark:text-aurora-300"
          : "border-line bg-surface-2 text-ink-2 hover:border-aurora-500/40 hover:text-aurora-600 dark:hover:text-aurora-300"
      }
    `;
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
              PAGE HEADER
          ================================================= */}

          <Reveal immediate>
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
                  px-6
                  py-10
                  md:px-12
                  md:py-14
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-10
                    lg:flex-row
                    lg:items-end
                    lg:justify-between
                  "
                >
                  <div className="max-w-2xl">
                    <p
                      className="
                        inline-flex
                        items-center
                        gap-2
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.25em]
                        text-aurora-600
                        dark:text-aurora-300
                      "
                    >
                      <Sparkles aria-hidden="true" className="size-4" />

                      NariCraft Collection
                    </p>

                    <h1
                      className="
                        mt-4
                        font-display
                        text-3xl
                        font-black
                        tracking-tight
                        text-ink
                        md:text-5xl
                      "
                    >
                      Discover Your{" "}
                      <span
                        className="
                          text-aurora-600
                          dark:text-aurora-300
                        "
                      >
                        Style
                      </span>
                    </h1>

                    <p
                      className="
                        mt-4
                        max-w-2xl
                        leading-7
                        text-ink-2
                      "
                    >
                      ඔබට ගැළපෙන NariCraft designs category එක අනුව
                      පහසුවෙන් තෝරාගන්න.
                    </p>

                    <div
                      className="
                        mt-6
                        h-1
                        w-20
                        rounded-full
                        bg-gradient-to-r
                        from-aurora-500
                        via-cyan-glow
                        to-violet-glow
                      "
                    />
                  </div>

                  {/* ================= STATS ================= */}

                  <dl
                    className="
                      grid
                      grid-cols-2
                      gap-4
                    "
                  >
                    <div
                      className="
                        rounded-lg
                        border
                        border-line
                        bg-surface/70
                        px-5
                        py-4
                        backdrop-blur-md
                      "
                    >
                      <dt
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-ink-muted
                        "
                      >
                        Designs
                      </dt>

                      <dd
                        className="
                          mt-1
                          font-display
                          text-2xl
                          font-black
                          text-ink
                        "
                      >
                        <CountUp value={products.length} />
                      </dd>
                    </div>

                    <div
                      className="
                        rounded-lg
                        border
                        border-line
                        bg-surface/70
                        px-5
                        py-4
                        backdrop-blur-md
                      "
                    >
                      <dt
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-ink-muted
                        "
                      >
                        Categories
                      </dt>

                      <dd
                        className="
                          mt-1
                          font-display
                          text-2xl
                          font-black
                          text-ink
                        "
                      >
                        <CountUp value={categories.length} />
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>
          </Reveal>

          {/* =================================================
              SEARCH + CATEGORY FILTER
          ================================================= */}

          <Reveal immediate delay={80}>
            <div
              className="
                mt-8
                rounded-lg
                border
                border-line
                bg-surface
                p-4
                shadow-[var(--shadow-e2)]
                sm:p-5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  lg:flex-row
                  lg:items-end
                  lg:justify-between
                "
              >
                <div
                  className="
                    w-full
                    lg:max-w-xl
                  "
                >
                  <label htmlFor="product-search" className="label">
                    Search designs
                  </label>

                  <div
                    className="
                      relative
                    "
                  >
                    <Search
                      size={18}
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-ink-muted
                      "
                    />

                    <input
                      id="product-search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search designs, product name or category..."
                      className="
                        field
                        pl-11
                        pr-11
                      "
                    />

                    {searchTerm !== "" && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        aria-label="Clear search"
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          flex
                          size-7
                          items-center
                          justify-center
                          rounded-full
                          bg-surface-2
                          text-ink-2
                          transition
                          hover:bg-aurora-500/15
                          hover:text-aurora-600
                          dark:hover:text-aurora-300
                        "
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    lg:justify-end
                  "
                >
                  <p
                    aria-live="polite"
                    className="
                      text-xs
                      font-bold
                      whitespace-nowrap
                      text-ink-muted
                    "
                  >
                    {/* The animated number is decorative for screen
                        readers, so the static copy carries the meaning. */}
                    <span aria-hidden="true">
                      <CountUp value={filteredProducts.length} />{" "}
                      {filteredProducts.length === 1 ? "design" : "designs"}{" "}
                      found
                    </span>

                    <span className="sr-only">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "design" : "designs"}{" "}
                      found
                    </span>
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="
                        btn
                        btn-ghost
                        !px-3
                        !py-1.5
                        !text-xs
                      "
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* CATEGORY FILTERS */}

              <div
                role="group"
                aria-label="Filter designs by category"
                className="
                  mt-5
                  flex
                  gap-2.5
                  overflow-x-auto
                  pb-2
                  hide-scrollbar
                "
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  aria-pressed={selectedCategory === "All"}
                  className={getChipClass(selectedCategory === "All")}
                >
                  All Designs
                </button>

                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={selectedCategory === category}
                    className={getChipClass(selectedCategory === category)}
                  >
                    {getCategoryLabel(category)}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* =================================================
              LOADING
          ================================================= */}

          {isLoading && (
            <div
              role="status"
              aria-live="polite"
              aria-label="Loading designs"
              className="
                mt-12
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {Array.from({ length: 8 }).map((_item, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!isLoading && hasError && (
            <div className="mt-12">
              <ErrorState
                title="We could not load the collection"
                message="The design catalogue is unavailable right now. Check your connection and try again."
                onRetry={refetch}
              />
            </div>
          )}

          {/* =================================================
              NO PRODUCTS AT ALL
          ================================================= */}

          {!isLoading && !hasError && products.length === 0 && (
            <div className="mt-12">
              <EmptyState
                title="No products yet"
                description="New designs will appear here as soon as they are published."
                action={
                  hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="btn btn-secondary"
                    >
                      Clear filters
                    </button>
                  ) : (
                    <Link to="/custom-design" className="btn btn-primary">
                      Create Custom Design
                    </Link>
                  )
                }
              />
            </div>
          )}

          {/* =================================================
              NO MATCHING DESIGNS
          ================================================= */}

          {!isLoading &&
            !hasError &&
            products.length > 0 &&
            filteredProducts.length === 0 && (
              <div className="mt-12">
                <EmptyState
                  title={favouritesOnly ? "No matching favourites" : "No matching designs found"}
                  description="වෙනත් product name එකක් search කරන්න හෝ category filter එක වෙනස් කර බලන්න."
                  action={
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="btn btn-primary"
                    >
                      Show All Designs
                    </button>
                  }
                />
              </div>
            )}

          {/* =================================================
              CATEGORY SECTIONS
          ================================================= */}

          {!isLoading &&
            !hasError &&
            products.length > 0 &&
            filteredProducts.length > 0 &&
            visibleCategories.map((category) => (
              <Reveal key={category} className="mt-12">
                <div
                  className="
                    mb-6
                    flex
                    items-center
                    gap-4
                  "
                >
                  <div
                    className="
                      h-9
                      w-2
                      rounded-full
                      bg-gradient-to-b
                      from-aurora-500
                      to-cyan-glow
                    "
                  />

                  <div>
                    <h2
                      className="
                        font-display
                        text-2xl
                        font-black
                        text-ink
                      "
                    >
                      {getCategoryLabel(category)}
                    </h2>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-ink-muted
                      "
                    >
                      Explore our {getCategoryLabel(category)} collection
                    </p>
                  </div>

                  <span
                    className="
                      badge
                      badge-accent
                      ml-auto
                    "
                  >
                    {
                      filteredProducts.filter(
                        (product) => product.category === category,
                      ).length
                    }
                  </span>
                </div>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-5
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                  "
                >
                  {filteredProducts
                    .filter((product) => product.category === category)
                    .map((product) => (
                      <div
                        key={product.productId}
                        className="
                          h-full
                        "
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                </div>
              </Reveal>
            ))}

          {/* =================================================
              CUSTOM DESIGN SECTION
          ================================================= */}

          <Reveal>
            <section
              className="
                card-glow
                relative
                mt-16
                overflow-hidden
                px-7
                py-12
                shadow-[var(--shadow-e3)]
                md:px-12
                md:py-14
              "
            >
              {/* ================= DECORATION ================= */}

              <AuroraBackdrop />

              <div
                aria-hidden="true"
                className="
                  absolute
                  -right-20
                  -top-20
                  size-64
                  rounded-full
                  border
                  border-aurora-500/20
                "
              />

              <div
                aria-hidden="true"
                className="
                  absolute
                  -left-24
                  -bottom-28
                  size-72
                  rounded-full
                  border
                  border-cyan-glow/20
                "
              />

              {/* ================= CONTENT ================= */}

              <div
                className="
                  relative
                  z-10
                  flex
                  flex-col
                  gap-8
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >
                {/* ================= TEXT ================= */}

                <div className="max-w-2xl">
                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[3px]
                      text-aurora-600
                      dark:text-aurora-300
                    "
                  >
                    Can't Find Your Perfect Design?
                  </p>

                  <h2
                    className="
                      mt-3
                      font-display
                      text-3xl
                      font-black
                      leading-tight
                      text-ink
                      md:text-4xl
                    "
                  >
                    ඔබට හරියන design එකක්{" "}
                    <span
                      className="
                        text-aurora-600
                        dark:text-aurora-300
                      "
                    >
                      හම්බුණේ නැද්ද?
                    </span>
                  </h2>

                  <p
                    className="
                      mt-4
                      text-sm
                      leading-7
                      text-ink-2
                      md:text-base
                    "
                  >
                    ප්‍රශ්නයක් නෑ. ඔබට කැමති design photo එක අපට ලබාදී,
                    ඔබගේ measurements අනුව ඔබටම ගැළපෙන custom outfit එකක්
                    NariCraft වෙතින් නිර්මාණය කරගන්න.
                  </p>
                </div>

                {/* ================= BUTTON ================= */}

                <div
                  className="
                    shrink-0
                  "
                >
                  <Link
                    to="/custom-design"
                    className="
                      btn
                      btn-primary
                      !px-8
                      !py-4
                      !text-base
                    "
                  >
                    Create Custom Design

                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            </section>
          </Reveal>
        </div>
      </div>

      <style>{`

  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

`}</style>
    </PageTransition>
  );
}
