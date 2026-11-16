import { API_URL } from "../../utils/config.js";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  ArrowLeft,
  ImagePlus,
  PackagePlus,
  Tag,
  DollarSign,
  Hash,
  Layers3,
  FileText,
  X,
  Save,
  Sparkles,
  LoaderCircle,
  ImageOff,
} from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { toast } from "react-hot-toast";

import MediaUploader from "../../utils/mediaUpload";
import { CiBoxes } from "react-icons/ci";
import { FiAlertCircle } from "react-icons/fi";

import { AuroraBackdrop } from "../../components/brand/AuroraBackdrop";
import { Reveal } from "../../components/brand/useReveal";
import { PageTransition } from "../../components/PageTransition";
import { ErrorState, Skeleton } from "../../components/StateBlocks";

// =====================================================
// FORM HELPERS
// =====================================================

/**
 * Field level validation. Returns a map of field name -> message.
 */
function validateProduct(values) {
  const errors = {};

  if (values.productId.trim() === "") {
    errors.productId = "Product ID is required.";
  }

  if (values.name.trim() === "") {
    errors.name = "Product name is required.";
  }

  if (values.description.trim() === "") {
    errors.description = "A short description is required.";
  }

  if (values.price === "") {
    errors.price = "Price is required.";
  } else if (
    !Number.isFinite(Number(values.price)) ||
    Number(values.price) < 0
  ) {
    errors.price = "Enter a price of 0 or more.";
  }

  if (values.labelNo === "") {
    errors.labelNo = "Stock count is required.";
  } else if (
    !Number.isFinite(Number(values.labelNo)) ||
    Number(values.labelNo) < 0
  ) {
    errors.labelNo = "Enter a stock count of 0 or more.";
  }

  if (values.category === "") {
    errors.category = "Choose a category.";
  }

  return errors;
}

/** Inline validation message, wired to the input with aria-describedby. */
function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger"
    >
      <FiAlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}

export default function AdminUpdateProduct() {
  // =====================================================
  // ROUTER
  // =====================================================

  const location = useLocation();

  const navigate = useNavigate();

  const { productId: routeProductId } = useParams();

  // =====================================================
  // PRODUCT FROM ADMIN PRODUCT PAGE
  // =====================================================

  const product = location.state;

  // The router state carries the whole product when the admin opens the
  // form from the catalogue. It is used as an instant fallback so the form
  // is never empty while (or if) the request is in flight.
  const locationProduct =
    product && product.productId ? product : null;

  // =====================================================
  // PRODUCT DATA
  // Sir ගේ style එකට වෙන වෙනම useState
  // =====================================================

  const [productId, setProductId] = useState(
    product?.productId || routeProductId || "",
  );

  const [name, setName] = useState(product?.name || "");

  const [altNames, setAltNames] = useState(
    Array.isArray(product?.altNames) ? product.altNames.join(", ") : "",
  );

  const [description, setDescription] = useState(product?.description || "");

  const [price, setPrice] = useState(product?.price ?? "");

  const [labelNo, setLabelNo] = useState(product?.labelNo ?? "");

  const [category, setCategory] = useState(product?.category || "");

  // =====================================================
  // EXISTING IMAGES
  // Database එකේ දැනට තියෙන images
  // =====================================================

  const [oldImages, setOldImages] = useState(
    Array.isArray(product?.images) ? product.images : [],
  );

  // =====================================================
  // NEW IMAGES
  // User අලුතින් select කරන images
  // =====================================================

  const [images, setImages] = useState([]);

  const [preview, setPreview] = useState([]);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD STATE
  // =====================================================

  const [loadToken, setLoadToken] = useState(0);

  // The result of the request that belongs to `loadToken`. While the token
  // does not match, the form is still loading — this keeps the loading state
  // derivable instead of forcing a render from inside the effect.
  const [loadResult, setLoadResult] = useState({
    token: -1,
    status: "loading",
    error: "",
  });

  // =====================================================
  // VALIDATION STATE
  // =====================================================

  const [touched, setTouched] = useState({});

  const [imageError, setImageError] = useState("");

  // =====================================================
  // LOAD THE PRODUCT
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const requestedId = routeProductId || locationProduct?.productId || "";

    if (!requestedId) {
      return undefined;
    }

    axios
      .get(API_URL + "/api/products/" + requestedId)

      .then((res) => {
        if (cancelled) {
          return;
        }

        const loaded = res.data;

        if (!loaded) {
          setLoadResult({
            token: loadToken,
            status: "error",
            error: "That product could not be found on the server.",
          });

          return;
        }

        setProductId(loaded.productId || requestedId);

        setName(loaded.name || "");

        setAltNames(
          Array.isArray(loaded.altNames)
            ? loaded.altNames.join(", ")
            : loaded.altNames || "",
        );

        setDescription(loaded.description || "");

        setPrice(loaded.price ?? "");

        setLabelNo(loaded.labelNo ?? "");

        setCategory(loaded.category || "");

        setOldImages(Array.isArray(loaded.images) ? loaded.images : []);

        setLoadResult({ token: loadToken, status: "ready", error: "" });
      })

      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.log(err);

        // The router state already holds the product, so the form can still
        // be used even when the server cannot be reached.
        if (locationProduct) {
          setLoadResult({ token: loadToken, status: "ready", error: "" });

          return;
        }

        setLoadResult({
          token: loadToken,
          status: "error",
          error:
            "We could not load this product. Make sure the server is running and try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [routeProductId, loadToken, locationProduct]);

  // =====================================================
  // DERIVED LOAD STATE
  // =====================================================

  const requestedId = routeProductId || locationProduct?.productId || "";

  const loadStatus = !requestedId
    ? "error"
    : loadResult.token === loadToken
      ? loadResult.status
      : "loading";

  const loadError = !requestedId
    ? "No product id was provided, so there is nothing to update."
    : loadResult.token === loadToken
      ? loadResult.error
      : "";

  // =====================================================
  // SELECT NEW IMAGES
  // =====================================================

  function handleImageChange(e) {
    const selectedImages = Array.from(e.target.files || []);

    if (selectedImages.length === 0) {
      return;
    }

    // New files add කරනවා

    setImages((oldImages) => [...oldImages, ...selectedImages]);

    // Preview URLs හදනවා

    const newPreview = selectedImages.map((file) => URL.createObjectURL(file));

    setPreview((oldPreview) => [...oldPreview, ...newPreview]);

    setImageError("");

    // Same image එක නැවත select කරන්න පුළුවන්

    e.target.value = "";
  }

  // =====================================================
  // REMOVE OLD IMAGE
  // =====================================================

  function removeOldImage(index) {
    const newOldImages = oldImages.filter((item, i) => i !== index);

    setOldImages(newOldImages);

    if (newOldImages.length === 0 && images.length === 0) {
      setImageError("Please keep at least one image");
    }
  }

  // =====================================================
  // REMOVE NEW IMAGE
  // =====================================================

  function removeNewImage(index) {
    if (preview[index]) {
      URL.revokeObjectURL(preview[index]);
    }

    const newImages = images.filter((item, i) => i !== index);

    const newPreview = preview.filter((item, i) => i !== index);

    setImages(newImages);

    setPreview(newPreview);

    if (oldImages.length === 0 && newImages.length === 0) {
      setImageError("Please keep at least one image");
    }
  }

  // =====================================================
  // VALIDATION HELPERS
  // =====================================================

  const currentValues = useMemo(
    () => ({
      productId,
      name,
      description,
      price,
      labelNo,
      category,
    }),
    [productId, name, description, price, labelNo, category],
  );

  const errors = useMemo(() => validateProduct(currentValues), [currentValues]);

  const fieldClass = (field) =>
    `field ${touched[field] && errors[field] ? "field-invalid" : ""}`;

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const focusFirstInvalid = (currentErrors) => {
    const order = [
      "name",
      "description",
      "price",
      "labelNo",
      "category",
    ];

    const first = order.find((field) => currentErrors[field]);

    if (!first) {
      return;
    }

    const node = document.getElementById(`update-product-${first}`);

    if (node) {
      node.focus();
    }
  };

  // =====================================================
  // UPDATE PRODUCT
  // =====================================================

  async function updateProduct() {
    // =================================================
    // TOKEN CHECK
    // =================================================

    const token = localStorage.getItem("token");

    if (token == null) {
      navigate("/login");

      return;
    }

    // =================================================
    // VALIDATION
    // =================================================

    const currentErrors = validateProduct(currentValues);

    setTouched({
      productId: true,
      name: true,
      description: true,
      price: true,
      labelNo: true,
      category: true,
    });

    if (Object.keys(currentErrors).length > 0) {
      toast.error("Please fill all required fields");

      focusFirstInvalid(currentErrors);

      return;
    }

    // Image එකක්වත් නැත්නම්

    if (oldImages.length === 0 && images.length === 0) {
      setImageError("Please select at least one image");

      toast.error("Please select at least one image");

      const node = document.getElementById("update-product-images");

      if (node) {
        node.focus();
      }

      return;
    }

    setLoading(true);

    try {
      // =================================================
      // NEW IMAGES UPLOAD TO SUPABASE
      // =================================================

      const promises = [];

      for (let i = 0; i < images.length; i++) {
        promises[i] = MediaUploader(images[i], token);
      }

      // New images upload වෙලා URLs එනවා

      const newImageUrls = await Promise.all(promises);

      console.log("New Uploaded Images:", newImageUrls);

      // =================================================
      // OLD IMAGES + NEW IMAGES
      // =================================================

      const finalImages = [...oldImages, ...newImageUrls];

      console.log("Final Images:", finalImages);

      // =================================================
      // ALTERNATIVE NAMES
      // =================================================

      const alternativeNames = altNames

        .split(",")

        .map((name) => name.trim())

        .filter((name) => name !== "");

      // =================================================
      // UPDATED PRODUCT OBJECT
      // =================================================

      const updatedProduct = {
        productId: productId.trim(),

        name: name.trim(),

        altNames: alternativeNames,

        description: description.trim(),

        price: Number(price),

        labelNo: Number(labelNo),

        category: category.trim(),

        images: finalImages,
      };

      console.log("UPDATED PRODUCT:", updatedProduct);

      // =================================================
      // SEND UPDATE TO BACKEND
      // =================================================

      const response = await axios.put(
        API_URL +
          "/api/products/" +
          (routeProductId || productId),

        updatedProduct,

        {
          headers: {
            Authorization: "Bearer " + token,
          },
        },
      );

      console.log("UPDATE RESPONSE:", response.data);

      toast.success("Product updated successfully ❤️");

      navigate("/admin/products");
    } catch (err) {
      console.log("UPDATE ERROR:", err);

      console.log("STATUS:", err.response?.status);

      console.log("BACKEND RESPONSE:", err.response?.data);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update product",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // ALL IMAGES FOR DISPLAY
  // Old images + New images
  // =====================================================

  const allPreviewImages = [
    ...oldImages.map((url) => ({
      type: "old",

      url: url,
    })),

    ...preview.map((url, index) => ({
      type: "new",

      url: url,

      newIndex: index,
    })),
  ];

  // =====================================================
  // LIVE PREVIEW VALUES
  // =====================================================

  const previewPrice =
    price === "" || !Number.isFinite(Number(price)) ? "—" : Number(price).toLocaleString();

  const previewStock =
    labelNo === "" || !Number.isFinite(Number(labelNo))
      ? "—"
      : Number(labelNo).toLocaleString();

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <PageTransition>
      <div className="relative min-h-full w-full bg-canvas p-4 sm:p-6 lg:p-8">
        <AuroraBackdrop />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          {/* =================================================
              TOP BAR
          ================================================= */}

          <Reveal immediate>
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  aria-label="Back to products"
                  className="btn btn-secondary !p-3"
                >
                  <ArrowLeft aria-hidden="true" className="size-5" />
                </button>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-aurora-600 dark:text-aurora-300">
                    NariCraft Admin
                  </p>

                  <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                    Update Product
                  </h1>

                  <p className="mt-1 text-sm text-ink-muted">
                    Product එකේ අවශ්‍ය details වෙනස් කරන්න.
                  </p>
                </div>
              </div>

              <span className="badge badge-accent w-fit">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Product Management
              </span>
            </div>
          </Reveal>

          {/* =================================================
              FORM + LIVE PREVIEW
          ================================================= */}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            {/* =================================================
                LEFT: FORM / SKELETON / ERROR
            ================================================= */}

            <Reveal delay={80}>
              {/* ---------- LOADING SKELETON ---------- */}

              {loadStatus === "loading" && (
                <div
                  className="surface card-3d p-5 sm:p-7"
                  role="status"
                  aria-live="polite"
                  aria-label="Loading product"
                >
                  <div className="flex items-center gap-4 border-b border-line pb-5">
                    <Skeleton className="h-12 w-12 !rounded-xl" />

                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-52" />
                      <Skeleton className="h-3 w-72" />
                    </div>
                  </div>

                  <Skeleton className="mt-6 h-64 w-full !rounded-xl" />

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>

                  <Skeleton className="mt-5 h-28 w-full" />
                </div>
              )}

              {/* ---------- ERROR STATE ---------- */}

              {loadStatus === "error" && (
                <ErrorState
                  title="Could not load this product"
                  message={loadError}
                  onRetry={() => {
                    setLoadToken((token) => token + 1);
                  }}
                />
              )}

              {/* ---------- FORM ---------- */}

              {loadStatus === "ready" && (
                <form
                  className="surface card-3d p-5 sm:p-7"
                  onSubmit={(event) => {
                    event.preventDefault();

                    updateProduct();
                  }}
                  noValidate
                >
                  {/* ---------- FORM HEADER ---------- */}

                  <div className="mb-6 flex items-center gap-4 border-b border-line pb-5">
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-aurora-500/12 text-aurora-600 dark:text-aurora-300"
                    >
                      <PackagePlus className="size-6" />
                    </span>

                    <div>
                      <h2 className="font-display text-xl font-bold text-ink">
                        Update Product Details
                      </h2>

                      <p className="mt-1 text-sm text-ink-muted">
                        Details වෙනස් කර Update Product button එක click කරන්න.
                      </p>
                    </div>
                  </div>

                  {/* ---------- IMAGE SECTION ---------- */}

                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="update-product-images"
                        className="label !mb-0 flex items-center gap-2"
                      >
                        <ImagePlus
                          aria-hidden="true"
                          className="size-4 text-aurora-600 dark:text-aurora-300"
                        />
                        Product Images
                      </label>

                      {allPreviewImages.length > 0 && (
                        <span className="text-xs text-ink-muted">
                          {allPreviewImages.length} selected
                        </span>
                      )}
                    </div>

                    <input
                      id="update-product-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      aria-invalid={imageError ? "true" : undefined}
                      aria-describedby={
                        imageError ? "update-product-images-error" : undefined
                      }
                      className="peer sr-only"
                    />

                    {allPreviewImages.length === 0 ? (
                      <label
                        htmlFor="update-product-images"
                        className="
                          group
                          flex
                          cursor-pointer
                          flex-col
                          items-center
                          justify-center
                          gap-3
                          rounded-xl
                          border-2
                          border-dashed
                          border-line-strong
                          bg-surface-2
                          px-6
                          py-10
                          text-center
                          transition-colors
                          hover:border-aurora-500
                          peer-focus-visible:outline
                          peer-focus-visible:outline-2
                          peer-focus-visible:outline-offset-2
                          peer-focus-visible:outline-aurora-500
                        "
                      >
                        <span
                          aria-hidden="true"
                          className="
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-aurora-500/12
                            text-aurora-600
                            transition-transform
                            group-hover:scale-110
                            dark:text-aurora-300
                          "
                        >
                          <ImagePlus className="size-7" />
                        </span>

                        <span className="font-display text-base font-bold text-ink">
                          Upload Product Image
                        </span>

                        <span className="max-w-[240px] text-xs leading-5 text-ink-muted">
                          JPG, PNG or WEBP image එකක් හෝ images කිහිපයක් select
                          කරන්න.
                        </span>

                        <span className="btn btn-secondary !py-2">
                          Choose Image
                        </span>
                      </label>
                    ) : (
                      <>
                        {/* ---------- MAIN IMAGE ---------- */}

                        <div className="relative overflow-hidden rounded-xl border border-line bg-surface-2">
                          <img
                            src={allPreviewImages[0].url}
                            alt="Selected product image preview"
                            className="h-64 w-full object-cover sm:h-72"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const item = allPreviewImages[0];

                              if (item.type === "old") {
                                const oldIndex = oldImages.indexOf(item.url);

                                removeOldImage(oldIndex);
                              } else {
                                removeNewImage(item.newIndex);
                              }
                            }}
                            aria-label="Remove image 1"
                            className="btn btn-secondary absolute right-3 top-3 !rounded-full !p-2"
                          >
                            <X aria-hidden="true" className="size-4" />
                          </button>
                        </div>

                        {/* ---------- OTHER IMAGES ---------- */}

                        {allPreviewImages.length > 1 && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {allPreviewImages.slice(1).map((item, index) => {
                              const actualIndex = index + 1;

                              return (
                                <div
                                  key={item.url + actualIndex}
                                  className="relative h-24 overflow-hidden rounded-xl border border-line bg-surface-2"
                                >
                                  <img
                                    src={item.url}
                                    alt={`Product image ${actualIndex + 1}`}
                                    className="h-full w-full object-cover"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (item.type === "old") {
                                        const oldIndex = oldImages.indexOf(
                                          item.url,
                                        );

                                        removeOldImage(oldIndex);
                                      } else {
                                        removeNewImage(item.newIndex);
                                      }
                                    }}
                                    aria-label={`Remove image ${actualIndex + 1}`}
                                    className="btn btn-secondary absolute right-1.5 top-1.5 !rounded-full !p-1"
                                  >
                                    <X aria-hidden="true" className="size-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* ---------- ADD MORE ---------- */}

                        <label
                          htmlFor="update-product-images"
                          className="btn btn-secondary mt-3 w-full cursor-pointer"
                        >
                          <ImagePlus aria-hidden="true" className="size-4" />
                          + Add More
                        </label>
                      </>
                    )}

                    <FieldError
                      id="update-product-images-error"
                      message={imageError}
                    />

                    {/* ---------- IMAGE INFO ---------- */}

                    <p className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3 text-xs leading-5 text-ink-muted">
                      ✦ Existing images තියාගන්නත්, remove කරන්නත්, අලුත් images
                      add කරන්නත් පුළුවන්.
                    </p>
                  </div>

                  {/* ---------- PRODUCT ID + STOCKS ---------- */}

                  <div className="mb-5 grid gap-5 sm:grid-cols-2">
                    {/* PRODUCT ID */}

                    <div>
                      <label
                        htmlFor="update-product-productId"
                        className="label flex items-center gap-2"
                      >
                        <Hash
                          aria-hidden="true"
                          className="size-4 text-aurora-600 dark:text-aurora-300"
                        />
                        Product ID
                      </label>

                      <input
                        id="update-product-productId"
                        type="text"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        readOnly
                        aria-invalid={
                          touched.productId && errors.productId
                            ? "true"
                            : undefined
                        }
                        aria-describedby={
                          touched.productId && errors.productId
                            ? "update-product-productId-error"
                            : undefined
                        }
                        className={`${fieldClass("productId")} cursor-not-allowed`}
                      />

                      <FieldError
                        id="update-product-productId-error"
                        message={touched.productId ? errors.productId : ""}
                      />
                    </div>

                    {/* STOCKS */}

                    <div>
                      <label
                        htmlFor="update-product-labelNo"
                        className="label flex items-center gap-2"
                      >
                        <CiBoxes
                          aria-hidden="true"
                          className="size-4 text-aurora-600 dark:text-aurora-300"
                        />
                        Stocks
                      </label>

                      <input
                        id="update-product-labelNo"
                        type="number"
                        value={labelNo}
                        onChange={(e) => setLabelNo(e.target.value)}
                        onBlur={() => markTouched("labelNo")}
                        placeholder="001"
                        required
                        aria-invalid={
                          touched.labelNo && errors.labelNo ? "true" : undefined
                        }
                        aria-describedby={
                          touched.labelNo && errors.labelNo
                            ? "update-product-labelNo-error"
                            : undefined
                        }
                        className={fieldClass("labelNo")}
                      />

                      <FieldError
                        id="update-product-labelNo-error"
                        message={touched.labelNo ? errors.labelNo : ""}
                      />
                    </div>
                  </div>

                  {/* ---------- PRODUCT NAME ---------- */}

                  <div className="mb-5">
                    <label
                      htmlFor="update-product-name"
                      className="label flex items-center gap-2"
                    >
                      <PackagePlus
                        aria-hidden="true"
                        className="size-4 text-aurora-600 dark:text-aurora-300"
                      />
                      Product Name
                    </label>

                    <input
                      id="update-product-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => markTouched("name")}
                      placeholder="Royal Maroon Saree Jacket"
                      required
                      aria-invalid={
                        touched.name && errors.name ? "true" : undefined
                      }
                      aria-describedby={
                        touched.name && errors.name
                          ? "update-product-name-error"
                          : undefined
                      }
                      className={fieldClass("name")}
                    />

                    <FieldError
                      id="update-product-name-error"
                      message={touched.name ? errors.name : ""}
                    />
                  </div>

                  {/* ---------- ALTERNATIVE NAME ---------- */}

                  <div className="mb-5">
                    <label
                      htmlFor="update-product-altName"
                      className="label flex items-center gap-2"
                    >
                      <Tag
                        aria-hidden="true"
                        className="size-4 text-aurora-600 dark:text-aurora-300"
                      />
                      Alternative Name
                    </label>

                    <input
                      id="update-product-altName"
                      type="text"
                      value={altNames}
                      onChange={(e) => setAltNames(e.target.value)}
                      placeholder="Maroon Blouse, Designer Jacket"
                      className="field"
                    />
                  </div>

                  {/* ---------- CATEGORY + PRICE ---------- */}

                  <div className="mb-5 grid gap-5 sm:grid-cols-2">
                    {/* CATEGORY */}

                    <div>
                      <label
                        htmlFor="update-product-category"
                        className="label flex items-center gap-2"
                      >
                        <Layers3
                          aria-hidden="true"
                          className="size-4 text-aurora-600 dark:text-aurora-300"
                        />
                        Category
                      </label>

                      <select
                        id="update-product-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        onBlur={() => markTouched("category")}
                        required
                        aria-invalid={
                          touched.category && errors.category ? "true" : undefined
                        }
                        aria-describedby={
                          touched.category && errors.category
                            ? "update-product-category-error"
                            : undefined
                        }
                        className={fieldClass("category")}
                      >
                        <option value="">Select Category</option>

                        <optgroup label="Fashion Collections">
                          <option value="Saree Jackets">Saree Jackets</option>

                          <option value="Blouses">Blouses</option>

                          <option value="Frocks">Frocks</option>

                          <option value="Crop Tops">Crop Tops</option>

                          <option value="Premium">Premium Collection</option>

                          <option value="Traditional">Traditional</option>
                        </optgroup>

                        <optgroup label="Uniform & Group Orders">
                          <option value="Preschool Uniforms">
                            Preschool Uniforms
                          </option>

                          <option value="Association T-Shirts">
                            Association T-Shirts
                          </option>
                        </optgroup>
                      </select>

                      <FieldError
                        id="update-product-category-error"
                        message={touched.category ? errors.category : ""}
                      />
                    </div>

                    {/* PRICE */}

                    <div>
                      <label
                        htmlFor="update-product-price"
                        className="label flex items-center gap-2"
                      >
                        <DollarSign
                          aria-hidden="true"
                          className="size-4 text-aurora-600 dark:text-aurora-300"
                        />
                        Price
                      </label>

                      <div className="relative">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted"
                        >
                          LKR
                        </span>

                        <input
                          id="update-product-price"
                          type="number"
                          min="0"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          onBlur={() => markTouched("price")}
                          placeholder="5800"
                          required
                          aria-invalid={
                            touched.price && errors.price ? "true" : undefined
                          }
                          aria-describedby={
                            touched.price && errors.price
                              ? "update-product-price-error"
                              : undefined
                          }
                          className={`${fieldClass("price")} !pl-12`}
                        />
                      </div>

                      <FieldError
                        id="update-product-price-error"
                        message={touched.price ? errors.price : ""}
                      />
                    </div>
                  </div>

                  {/* ---------- DESCRIPTION ---------- */}

                  <div className="mb-6">
                    <label
                      htmlFor="update-product-description"
                      className="label flex items-center gap-2"
                    >
                      <FileText
                        aria-hidden="true"
                        className="size-4 text-aurora-600 dark:text-aurora-300"
                      />
                      Product Description
                    </label>

                    <textarea
                      id="update-product-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={() => markTouched("description")}
                      placeholder="Product එකේ fabric, design, fitting සහ වෙනත් විස්තර..."
                      rows={6}
                      required
                      aria-invalid={
                        touched.description && errors.description
                          ? "true"
                          : undefined
                      }
                      aria-describedby={
                        touched.description && errors.description
                          ? "update-product-description-error"
                          : undefined
                      }
                      className={`${fieldClass("description")} resize-none`}
                    />

                    <FieldError
                      id="update-product-description-error"
                      message={touched.description ? errors.description : ""}
                    />
                  </div>

                  {/* ---------- BUTTONS ---------- */}

                  <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/products")}
                      disabled={loading}
                      className="btn btn-secondary !px-7 !py-3.5"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary !px-8 !py-3.5"
                    >
                      {loading ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-4 animate-spin"
                        />
                      ) : (
                        <Save aria-hidden="true" className="size-4" />
                      )}

                      {loading ? "Updating Product..." : "Update Product"}
                    </button>
                  </div>
                </form>
              )}
            </Reveal>

            {/* =================================================
                RIGHT: LIVE PREVIEW
            ================================================= */}

            <Reveal delay={160}>
              <div className="glass relative overflow-hidden rounded-lg p-6 shadow-[var(--shadow-e3)]">
                <AuroraBackdrop className="opacity-80" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                      Live preview
                    </p>

                    <span className="badge badge-info">
                      <span
                        aria-hidden="true"
                        className="pulse-dot size-2 rounded-full bg-info"
                      />
                      Live
                    </span>
                  </div>

                  {/* ---------- PREVIEW IMAGE ---------- */}

                  <div className="mt-4 aspect-square overflow-hidden rounded-lg border border-line bg-surface-2">
                    {allPreviewImages.length > 0 ? (
                      <img
                        src={allPreviewImages[0].url}
                        alt="Live preview of the current product image"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted">
                        <ImageOff aria-hidden="true" className="size-8" />
                        <span className="text-xs">No image selected yet</span>
                      </span>
                    )}
                  </div>

                  {/* ---------- PREVIEW TEXT ---------- */}

                  <h3 className="mt-4 font-display text-lg font-extrabold text-ink">
                    {name.trim() === "" ? "Untitled product" : name}
                  </h3>

                  <p className="mt-1 font-display text-2xl font-extrabold text-aurora-600 dark:text-aurora-300">
                    LKR {previewPrice}
                  </p>

                  <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-muted">Product ID</dt>
                      <dd className="font-mono text-xs font-semibold text-ink">
                        {productId.trim() === "" ? "—" : productId}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-muted">Category</dt>
                      <dd className="text-ink">
                        {category === "" ? "—" : category}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-muted">Stocks</dt>
                      <dd className="text-ink">{previewStock}</dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-muted">Images</dt>
                      <dd className="text-ink">{allPreviewImages.length}</dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-xs leading-5 text-ink-muted">
                    This panel mirrors the form as you type — it is exactly what
                    customers will see in the catalogue.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
