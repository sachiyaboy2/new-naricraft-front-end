import { API_URL } from "../../utils/config.js";
import { useMemo, useState } from "react";
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

import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import MediaUploader from "../../utils/mediaUpload";
import { CiBoxes } from "react-icons/ci";
import { FiAlertCircle } from "react-icons/fi";

import { AuroraBackdrop } from "../../components/brand/AuroraBackdrop";
import { Reveal } from "../../components/brand/useReveal";
import { PageTransition } from "../../components/PageTransition";

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

export default function AddProductPage() {
  const navigate = useNavigate();

  // =====================================================
  // IMAGE STATE
  // =====================================================

  const [image, setImage] = useState([]);
  const [preview, setPreview] = useState([]);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // PRODUCT DATA
  // =====================================================

  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    altName: "",
    description: "",
    price: "",
    labelNo: "",
    category: "",
  });

  // =====================================================
  // VALIDATION STATE
  // =====================================================

  const [touched, setTouched] = useState({});

  const [imageError, setImageError] = useState("");

  // =====================================================
  // FORM INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files || []);

    if (selectedImages.length === 0) {
      return;
    }

    // කලින් images අයින් නොකර
    // අලුත් images add කරනවා
    setImage((oldImages) => [...oldImages, ...selectedImages]);

    // Preview URLs
    const newPreview = selectedImages.map((file) => URL.createObjectURL(file));

    setPreview((oldPreview) => [...oldPreview, ...newPreview]);

    setImageError("");

    // same image එක ආයෙ select කරන්නත් පුළුවන්
    e.target.value = "";
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (index) => {
    URL.revokeObjectURL(preview[index]);

    const newImages = image.filter((item, i) => i !== index);

    const newPreview = preview.filter((item, i) => i !== index);

    setImage(newImages);
    setPreview(newPreview);

    if (newImages.length === 0) {
      setImageError("Please select at least one image");
    }
  };

  // =====================================================
  // VALIDATION HELPERS
  // =====================================================

  const errors = useMemo(() => validateProduct(formData), [formData]);

  const fieldClass = (field) =>
    `field ${touched[field] && errors[field] ? "field-invalid" : ""}`;

  const focusFirstInvalid = (currentErrors) => {
    const order = [
      "productId",
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

    const node = document.getElementById(`add-product-${first}`);

    if (node) {
      node.focus();
    }
  };

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  async function addProduct() {
    // -----------------------------------------
    // LOGIN CHECK
    // -----------------------------------------

    const token = localStorage.getItem("token");

    if (token == null) {
      navigate("/login");

      return;
    }

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    const currentErrors = validateProduct(formData);

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

    if (image.length === 0) {
      setImageError("Please select at least one image");

      toast.error("Please select at least one image");

      const node = document.getElementById("add-product-images");

      if (node) {
        node.focus();
      }

      return;
    }

    setLoading(true);

    // -----------------------------------------
    // SUPABASE IMAGE UPLOAD PROMISES
    // -----------------------------------------

    const promises = [];

    for (let i = 0; i < image.length; i++) {
      promises[i] = MediaUploader(image[i], token);
    }

    try {
      // ---------------------------------------
      // WAIT UNTIL ALL IMAGES UPLOAD
      // ---------------------------------------

      const urls = await Promise.all(promises);

      console.log("Uploaded Images:", urls);

      // ---------------------------------------
      // ALTERNATIVE NAMES
      // ---------------------------------------

      const alternativeNames = formData.altName
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name !== "");

      // ---------------------------------------
      // PRODUCT OBJECT
      // ---------------------------------------

      const product = {
        productId: formData.productId.trim(),

        name: formData.name.trim(),

        altNames: alternativeNames,

        description: formData.description.trim(),

        price: Number(formData.price),

        labelNo: Number(formData.labelNo),

        category: formData.category.trim(),

        images: urls,
      };

      console.log("Product:", product);

      // ---------------------------------------
      // SEND PRODUCT TO BACKEND
      // ---------------------------------------

      console.log("PRODUCT SENDING:", product);
      console.log("API URL:", API_URL + "/api/products");

      const res = await axios.post(
        API_URL + "/api/products",
        product,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        },
      );

      console.log("Product Response:", res.data);

      toast.success("Product added successfully");

      navigate("/admin/products");
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("STATUS:", err.response?.status);
      console.log("BACKEND RESPONSE:", err.response?.data);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LIVE PREVIEW VALUES
  // =====================================================

  const previewPrice =
    formData.price === "" || !Number.isFinite(Number(formData.price))
      ? "—"
      : Number(formData.price).toLocaleString();

  const previewStock =
    formData.labelNo === "" || !Number.isFinite(Number(formData.labelNo))
      ? "—"
      : Number(formData.labelNo).toLocaleString();

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
                    Add New Product
                  </h1>

                  <p className="mt-1 text-sm text-ink-muted">
                    ඔබගේ NariCraft collection එකට අලුත් product එකක් එකතු කරන්න.
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
                LEFT: FORM
            ================================================= */}

            <Reveal delay={80}>
              <form
                className="surface card-3d p-5 sm:p-7"
                onSubmit={(event) => {
                  event.preventDefault();

                  addProduct();
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
                      Product Details
                    </h2>

                    <p className="mt-1 text-sm text-ink-muted">
                      Product එකට අදාල විස්තර නිවැරදිව ඇතුළත් කරන්න.
                    </p>
                  </div>
                </div>

                {/* ---------- IMAGE SECTION ---------- */}

                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="add-product-images"
                      className="label !mb-0 flex items-center gap-2"
                    >
                      <ImagePlus
                        aria-hidden="true"
                        className="size-4 text-aurora-600 dark:text-aurora-300"
                      />
                      Product Images
                    </label>

                    {image.length > 0 && (
                      <span className="text-xs text-ink-muted">
                        {image.length} selected
                      </span>
                    )}
                  </div>

                  <input
                    id="add-product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    aria-invalid={imageError ? "true" : undefined}
                    aria-describedby={
                      imageError ? "add-product-images-error" : undefined
                    }
                    className="peer sr-only"
                  />

                  {preview.length === 0 ? (
                    <label
                      htmlFor="add-product-images"
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
                          dark:text-aurora-300
                          group-hover:scale-110
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
                          src={preview[0]}
                          alt="Selected product image preview"
                          className="h-64 w-full object-cover sm:h-72"
                        />

                        <button
                          type="button"
                          onClick={() => removeImage(0)}
                          aria-label="Remove image 1"
                          className="btn btn-secondary absolute right-3 top-3 !rounded-full !p-2"
                        >
                          <X aria-hidden="true" className="size-4" />
                        </button>
                      </div>

                      <p className="mt-2 truncate text-xs text-ink-muted">
                        {image[0]?.name}
                      </p>

                      {/* ---------- OTHER IMAGES ---------- */}

                      {preview.length > 1 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {preview.slice(1).map((url, index) => {
                            const actualIndex = index + 1;

                            return (
                              <div
                                key={actualIndex}
                                className="relative h-24 overflow-hidden rounded-xl border border-line bg-surface-2"
                              >
                                <img
                                  src={url}
                                  alt={`Product image ${actualIndex + 1}`}
                                  className="h-full w-full object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={() => removeImage(actualIndex)}
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
                        htmlFor="add-product-images"
                        className="btn btn-secondary mt-3 w-full cursor-pointer"
                      >
                        <ImagePlus aria-hidden="true" className="size-4" />
                        + Add More
                      </label>
                    </>
                  )}

                  <FieldError id="add-product-images-error" message={imageError} />

                  {/* ---------- IMAGE INFO ---------- */}

                  <p className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3 text-xs leading-5 text-ink-muted">
                    ✦ Clear product image එකක් use කරන්න. Catalog එකේ product
                    card එකේ පළවෙනි image එක පෙන්වන්න පුළුවන්.
                  </p>
                </div>

                {/* ---------- PRODUCT ID + STOCKS ---------- */}

                <div className="mb-5 grid gap-5 sm:grid-cols-2">
                  {/* PRODUCT ID */}

                  <div>
                    <label
                      htmlFor="add-product-productId"
                      className="label flex items-center gap-2"
                    >
                      <Hash
                        aria-hidden="true"
                        className="size-4 text-aurora-600 dark:text-aurora-300"
                      />
                      Product ID
                    </label>

                    <input
                      id="add-product-productId"
                      type="text"
                      name="productId"
                      value={formData.productId}
                      onChange={handleChange}
                      onBlur={() => markTouched("productId")}
                      placeholder="NRC-0001"
                      required
                      aria-invalid={
                        touched.productId && errors.productId ? "true" : undefined
                      }
                      aria-describedby={
                        touched.productId && errors.productId
                          ? "add-product-productId-error"
                          : undefined
                      }
                      className={fieldClass("productId")}
                    />

                    <FieldError
                      id="add-product-productId-error"
                      message={touched.productId ? errors.productId : ""}
                    />
                  </div>

                  {/* STOCKS */}

                  <div>
                    <label
                      htmlFor="add-product-labelNo"
                      className="label flex items-center gap-2"
                    >
                      <CiBoxes
                        aria-hidden="true"
                        className="size-4 text-aurora-600 dark:text-aurora-300"
                      />
                      Stocks
                    </label>

                    <input
                      id="add-product-labelNo"
                      type="number"
                      name="labelNo"
                      value={formData.labelNo}
                      onChange={handleChange}
                      onBlur={() => markTouched("labelNo")}
                      placeholder="001"
                      required
                      aria-invalid={
                        touched.labelNo && errors.labelNo ? "true" : undefined
                      }
                      aria-describedby={
                        touched.labelNo && errors.labelNo
                          ? "add-product-labelNo-error"
                          : undefined
                      }
                      className={fieldClass("labelNo")}
                    />

                    <FieldError
                      id="add-product-labelNo-error"
                      message={touched.labelNo ? errors.labelNo : ""}
                    />
                  </div>
                </div>

                {/* ---------- PRODUCT NAME ---------- */}

                <div className="mb-5">
                  <label
                    htmlFor="add-product-name"
                    className="label flex items-center gap-2"
                  >
                    <PackagePlus
                      aria-hidden="true"
                      className="size-4 text-aurora-600 dark:text-aurora-300"
                    />
                    Product Name
                  </label>

                  <input
                    id="add-product-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => markTouched("name")}
                    placeholder="Royal Maroon Saree Jacket"
                    required
                    aria-invalid={
                      touched.name && errors.name ? "true" : undefined
                    }
                    aria-describedby={
                      touched.name && errors.name
                        ? "add-product-name-error"
                        : undefined
                    }
                    className={fieldClass("name")}
                  />

                  <FieldError
                    id="add-product-name-error"
                    message={touched.name ? errors.name : ""}
                  />
                </div>

                {/* ---------- ALTERNATIVE NAME ---------- */}

                <div className="mb-5">
                  <label
                    htmlFor="add-product-altName"
                    className="label flex items-center gap-2"
                  >
                    <Tag
                      aria-hidden="true"
                      className="size-4 text-aurora-600 dark:text-aurora-300"
                    />
                    Alternative Name
                  </label>

                  <input
                    id="add-product-altName"
                    type="text"
                    name="altName"
                    value={formData.altName}
                    onChange={handleChange}
                    placeholder="Maroon Blouse, Designer Jacket"
                    className="field"
                  />
                </div>

                {/* ---------- CATEGORY + PRICE ---------- */}

                <div className="mb-5 grid gap-5 sm:grid-cols-2">
                  {/* CATEGORY */}

                  <div>
                    <label
                      htmlFor="add-product-category"
                      className="label flex items-center gap-2"
                    >
                      <Layers3
                        aria-hidden="true"
                        className="size-4 text-aurora-600 dark:text-aurora-300"
                      />
                      Category
                    </label>

                    <select
                      id="add-product-category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onBlur={() => markTouched("category")}
                      required
                      aria-invalid={
                        touched.category && errors.category ? "true" : undefined
                      }
                      aria-describedby={
                        touched.category && errors.category
                          ? "add-product-category-error"
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
                      id="add-product-category-error"
                      message={touched.category ? errors.category : ""}
                    />
                  </div>

                  {/* PRICE */}

                  <div>
                    <label
                      htmlFor="add-product-price"
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
                        id="add-product-price"
                        type="number"
                        min="0"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        onBlur={() => markTouched("price")}
                        placeholder="5800"
                        required
                        aria-invalid={
                          touched.price && errors.price ? "true" : undefined
                        }
                        aria-describedby={
                          touched.price && errors.price
                            ? "add-product-price-error"
                            : undefined
                        }
                        className={`${fieldClass("price")} !pl-12`}
                      />
                    </div>

                    <FieldError
                      id="add-product-price-error"
                      message={touched.price ? errors.price : ""}
                    />
                  </div>
                </div>

                {/* ---------- DESCRIPTION ---------- */}

                <div className="mb-6">
                  <label
                    htmlFor="add-product-description"
                    className="label flex items-center gap-2"
                  >
                    <FileText
                      aria-hidden="true"
                      className="size-4 text-aurora-600 dark:text-aurora-300"
                    />
                    Product Description
                  </label>

                  <textarea
                    id="add-product-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
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
                        ? "add-product-description-error"
                        : undefined
                    }
                    className={`${fieldClass("description")} resize-none`}
                  />

                  <FieldError
                    id="add-product-description-error"
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

                    {loading ? "Saving Product..." : "Add Product"}
                  </button>
                </div>
              </form>
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
                    {preview.length > 0 ? (
                      <img
                        src={preview[0]}
                        alt="Live preview of the selected product image"
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
                    {formData.name.trim() === ""
                      ? "Untitled product"
                      : formData.name}
                  </h3>

                  <p className="mt-1 font-display text-2xl font-extrabold text-aurora-600 dark:text-aurora-300">
                    LKR {previewPrice}
                  </p>

                  <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-muted">Product ID</dt>
                      <dd className="font-mono text-xs font-semibold text-ink">
                        {formData.productId.trim() === ""
                          ? "—"
                          : formData.productId}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-muted">Category</dt>
                      <dd className="text-ink">
                        {formData.category === "" ? "—" : formData.category}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-muted">Stocks</dt>
                      <dd className="text-ink">{previewStock}</dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-muted">Images</dt>
                      <dd className="text-ink">{preview.length}</dd>
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
