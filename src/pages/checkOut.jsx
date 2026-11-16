import { API_URL } from "../utils/config.js";
import { useCallback, useEffect, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

import {
  FaArrowLeft,
  FaCreditCard,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSpinner,
  FaUser,
} from "react-icons/fa";

import axios from "axios";

import { loadCart } from "../utils/cart";

import { PageTransition } from "../components/PageTransition";
import { AuroraBackdrop } from "../components/brand/AuroraBackdrop";
import { CountUp } from "../components/brand/CountUp";
import { EmptyState, ErrorState, Skeleton } from "../components/StateBlocks";

function normalizeSriLankanMobile(value) {
  const compact = String(value || "")
    .trim()
    .replace(/[\s()-]/g, "");

  if (/^07\d{8}$/.test(compact)) {
    return compact;
  }

  if (/^\+947\d{8}$/.test(compact)) {
    return "0" + compact.slice(3);
  }

  if (/^947\d{8}$/.test(compact)) {
    return "0" + compact.slice(2);
  }

  return null;
}

// =====================================================
// FIELD VALIDATION
// One message per field so the inline hints and the
// form-level checks always agree.
// =====================================================

const PHONE_HINT =
  "Enter a valid Sri Lankan mobile number such as 0771234567";

function validateField(field, value) {
  switch (field) {
    case "fullName":
      return value.trim() === "" ? "Full name is required." : "";

    case "phone": {
      if (value.trim() === "") {
        return "Phone number is required.";
      }

      return normalizeSriLankanMobile(value) ? "" : PHONE_HINT;
    }

    case "address":
      return value.trim() === "" ? "Delivery address is required." : "";

    case "city":
      return value.trim() === "" ? "City is required." : "";

    case "district":
      return value.trim() === "" ? "District is required." : "";

    default:
      return "";
  }
}

export default function CheckOutPage() {
  const navigate = useNavigate();

  const location = useLocation();

  // =====================================================
  // CART / BUY NOW PRODUCTS
  // =====================================================

  const isBuyNow =
    location.state?.buyNow === true && location.state?.product != null;

  const [cart, setCart] = useState(isBuyNow ? [location.state.product] : []);

  const [isCartLoading, setIsCartLoading] = useState(!isBuyNow);

  const [cartError, setCartError] = useState("");

  // =====================================================
  // LOAD NORMAL CART FROM DATABASE
  // Buy Now එකෙන් ආවා නම් database cart එක load කරන්නේ නැහැ.
  // =====================================================

  // Applies a successful cart response.
  const applyCart = useCallback((items) => {
    setCart(items);

    setCartError("");
  }, []);

  // Applies a failed cart response.
  const applyCartError = useCallback(
    (error) => {
      console.error("Load Checkout Cart Error:", error.message);

      if (error.response?.status === 401 || error.code === "LOGIN_REQUIRED") {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      setCartError(
        error.response?.data?.message || "Unable to load your cart right now.",
      );

      toast.error(error.response?.data?.message || "Unable to load cart");
    },
    [navigate],
  );

  // Re-runs the exact same request (used by the retry button).
  async function loadCheckoutCart() {
    try {
      const items = await loadCart();

      applyCart(items);
    } catch (error) {
      applyCartError(error);
    } finally {
      setIsCartLoading(false);
    }
  }

  // =====================================================
  // RETRY HANDLER
  // Runs from the ErrorState button, so the loading state
  // can be raised here instead of inside the effect.
  // =====================================================

  function handleRetry() {
    setIsCartLoading(true);
    setCartError("");

    loadCheckoutCart();
  }

  useEffect(() => {
    if (isBuyNow) {
      return undefined;
    }

    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("You need to login to checkout");
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

        setIsCartLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applyCart, applyCartError, isBuyNow, navigate]);

  // =====================================================
  // CUSTOMER DETAILS
  // =====================================================

  const [fullName, setFullName] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [city, setCity] = useState("");

  const [district, setDistrict] = useState("");

  const [notes, setNotes] = useState("");

  const [isOrdering, setIsOrdering] = useState(false);

  const [paymentPlan, setPaymentPlan] = useState("Full Payment");

  // If the order is created successfully but payment initiation fails,
  // reuse the same order on retry instead of creating a duplicate order.
  const [createdOrder, setCreatedOrder] = useState(null);

  // Inline validation messages, keyed by field name.
  const [errors, setErrors] = useState({});

  // Fields the user has already left once — only those get live validation.
  const [touched, setTouched] = useState({});

  // =====================================================
  // TOTAL PRICE
  // Frontend display only.
  // Backend calculates real total again.
  // =====================================================

  const totalPrice = cart.reduce((total, product) => {
    return total + Number(product.price || 0) * Number(product.quantity || 0);
  }, 0);

  // =====================================================
  // PAYMENT DISPLAY VALUES
  // Frontend display only.
  // Backend calculates the real payment amount again.
  // =====================================================

  const amountToPayNow =
    paymentPlan === "Half Payment"
      ? Math.round((totalPrice / 2) * 100) / 100
      : totalPrice;

  // The amount each payment plan would charge if it were the selected one.
  const halfPaymentAmount = Math.round((totalPrice / 2) * 100) / 100;

  const balanceOnDelivery =
    paymentPlan === "Half Payment"
      ? Math.round((totalPrice - amountToPayNow) * 100) / 100
      : 0;
  // =====================================================
  // TOTAL QUANTITY
  // =====================================================

  const totalQuantity = cart.reduce((total, product) => {
    return total + Number(product.quantity || 0);
  }, 0);

  // =====================================================
  // FIELD HELPERS
  // =====================================================

  function handleFieldChange(field, value, setter) {
    setter(value);

    if (touched[field]) {
      setErrors((current) => ({
        ...current,
        [field]: validateField(field, value),
      }));
    }
  }

  function handleFieldBlur(field, value) {
    setTouched((current) => ({ ...current, [field]: true }));

    setErrors((current) => ({
      ...current,
      [field]: validateField(field, value),
    }));
  }

  // =====================================================
  // PURCHASE CART
  // =====================================================

  async function purchaseCart(event) {
    if (event) {
      event.preventDefault();
    }

    // ============================================
    // CHECK LOGIN
    // ============================================

    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("You need to login to purchase");

      navigate("/login");

      return;
    }

    // ============================================
    // CUSTOMER DETAILS
    // ============================================

    const requiredFields = {
      fullName: fullName,
      phone: phone,
      address: address,
      city: city,
      district: district,
    };

    const missingField = Object.keys(requiredFields).find((field) => {
      return requiredFields[field].trim() === "";
    });

    if (missingField) {
      setTouched({
        fullName: true,
        phone: true,
        address: true,
        city: true,
        district: true,
      });

      // Flag every empty field, not only the first one.
      setErrors((current) => {
        const next = { ...current };

        Object.keys(requiredFields).forEach((field) => {
          next[field] = validateField(field, requiredFields[field]);
        });

        return next;
      });

      toast.error("Please fill all required delivery details");

      return;
    }

    const normalizedPhone = normalizeSriLankanMobile(phone);

    if (!normalizedPhone) {
      setTouched((current) => ({ ...current, phone: true }));

      setErrors((current) => ({
        ...current,
        phone: validateField("phone", phone),
      }));

      toast.error("Enter a valid Sri Lankan mobile number such as 0771234567");

      return;
    }

    // ============================================
    // CART
    // ============================================

    if (cart.length === 0) {
      toast.error("Your cart is empty");

      return;
    }

    // ============================================
    // PAYMENT PLAN
    // ============================================

    if (paymentPlan !== "Full Payment" && paymentPlan !== "Half Payment") {
      toast.error("Please select a payment plan");

      return;
    }

    // ============================================
    // PRODUCTS
    // ============================================

    const products = [];

    for (let i = 0; i < cart.length; i++) {
      products.push({
        productId: cart[i].productId,

        quantity: Number(cart[i].quantity),
      });
    }

    // ============================================
    // ORDER DATA
    //
    // Notice:
    // We do NOT send totalPrice.
    // Backend calculates real total.
    // ============================================

    const orderData = {
      fullName: fullName.trim(),

      phone: normalizedPhone,

      address: address.trim(),

      city: city.trim(),

      district: district.trim(),

      notes: notes.trim(),

      products: products,
    };

    try {
      setIsOrdering(true);

      // ==========================================
      // STEP 1
      // CREATE NARICRAFT ORDER
      // ==========================================

      const fingerprint = JSON.stringify(orderData);
      let orderIdForPayment = createdOrder?.fingerprint === fingerprint ? createdOrder.id : null;

      if (!orderIdForPayment) {
        const orderResponse = await axios.post(
          API_URL + "/api/orders",

          orderData,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const createdOrder = orderResponse.data.order;

        if (!createdOrder?.orderId) {
          throw new Error("Order was created without an order ID");
        }

        orderIdForPayment = createdOrder.orderId;
        setCreatedOrder({ id: orderIdForPayment, fingerprint });
      }

      // ==========================================
      // STEP 2
      // CREATE PAYMENTS.LK SANDBOX CHECKOUT
      // ==========================================

      const paymentResponse = await axios.post(
        API_URL + "/api/payments/product/initiate",

        {
          orderId: orderIdForPayment,

          paymentPlan: paymentPlan,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { checkoutUrl, paymentReference } = paymentResponse.data;

      if (!checkoutUrl || !paymentReference) {
        throw new Error("Invalid Payments.lk checkout response");
      }

      // ==========================================
      // TEMPORARY PAYMENT CONTEXT
      //
      // sessionStorage instead of localStorage:
      // less persistent / better privacy.
      //
      // No personal customer data is saved here.
      // ==========================================

      sessionStorage.setItem(
        "naricraftPendingPayment",

        JSON.stringify({
          paymentReference: paymentReference,

          orderId: orderIdForPayment,

          clearCart: !isBuyNow,
        }),
      );

      toast.success("Redirecting to Payments.lk secure checkout...");

      // ==========================================
      // IMPORTANT
      //
      // Do NOT clear cart here.
      // Payment is not verified yet.
      // The order becomes Paid only after the
      // verified Payments.lk webhook reaches backend.
      // ==========================================

      window.location.assign(checkoutUrl);
    } catch (error) {
      console.error("Checkout Payment Error:", error.message);

      toast.error(
        error.response?.data?.message ||
          "Unable to start payment. Please try again.",
      );
    } finally {
      setIsOrdering(false);
    }
  }

  // =====================================================
  // RENDER
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
              PAGE HEADER
          ================================================= */}

          <div
            className="
              flex
              items-start
              justify-between
              gap-5
              mb-10
            "
          >
            <div>
              <span className="badge badge-accent">Final Step</span>

              <h1
                className="
                  mt-4
                  text-3xl
                  md:text-4xl
                  font-display
                  font-bold
                  tracking-tight
                  text-ink
                "
              >
                Checkout
              </h1>

              <p
                className="
                  mt-3
                  max-w-xl
                  text-ink-muted
                "
              >
                ඔබගේ delivery details ලබාදී order එක confirm කිරීමට සූදානම් වෙන්න.
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

            {/* BACK */}

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary hidden sm:inline-flex"
            >
              <FaArrowLeft size={13} aria-hidden="true" />
              Back
            </button>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {isCartLoading && (
            <div
              className="
                grid
                lg:grid-cols-[1fr_380px]
                gap-8
                items-start
              "
            >
              <div className="surface-elevated p-6 md:p-8">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="mt-3 h-3 w-64" />

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-28 w-full md:col-span-2" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-24 w-full md:col-span-2" />
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-4 h-6 w-40" />
                <Skeleton className="mt-6 h-px w-full" />
                <Skeleton className="mt-6 h-14 w-full" />
                <Skeleton className="mt-6 h-12 w-full" />
                <Skeleton className="mt-8 h-12 w-full" />
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!isCartLoading && cartError && (
            <ErrorState
              title="We couldn't load your checkout"
              message={cartError}
              onRetry={handleRetry}
              className="mb-6"
            />
          )}

          {/* =================================================
              EMPTY CART
          ================================================= */}

          {!isCartLoading && !cartError && cart.length === 0 && (
            <div className="flex min-h-[400px] items-center justify-center">
              <EmptyState
                title="Your cart is empty"
                description="Checkout කරන්න කලින් product එකක් cart එකට add කරන්න."
                action={
                  <Link to="/products" className="btn btn-primary">
                    Explore Products
                  </Link>
                }
                className="w-full max-w-[450px]"
              />
            </div>
          )}

          {/* =================================================
              CHECKOUT CONTENT
          ================================================= */}

          {!isCartLoading && cart.length > 0 && (
            <div
              className="
                grid
                lg:grid-cols-[1fr_380px]
                gap-8
                items-start
              "
            >
              {/* =================================================
                  LEFT SIDE - DELIVERY DETAILS
              ================================================= */}

              <form
                id="checkout-form"
                onSubmit={purchaseCart}
                noValidate
                className="
                  surface-elevated
                  rounded-lg
                  p-6
                  md:p-8
                  shadow-[var(--shadow-e3)]
                "
              >
                <div className="mb-7 flex items-center gap-3">
                  <span
                    className="
                      flex
                      size-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      bg-aurora-500/12
                      text-aurora-600
                      dark:text-aurora-300
                    "
                  >
                    <FaMapMarkerAlt aria-hidden="true" />
                  </span>

                  <div>
                    <h2
                      className="
                        text-xl
                        font-display
                        font-bold
                        text-ink
                      "
                    >
                      Delivery Details
                    </h2>

                    <p className="mt-1 text-xs text-ink-muted">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                {/* =================================================
                    FULL NAME + PHONE
                ================================================= */}

                <div className="grid gap-5 md:grid-cols-2">
                  {/* FULL NAME */}

                  <div>
                    <label className="label" htmlFor="checkout-full-name">
                      Full Name *
                    </label>

                    <div className="relative">
                      <FaUser
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
                        id="checkout-full-name"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => {
                          handleFieldChange("fullName", e.target.value, setFullName);
                        }}
                        onBlur={() => {
                          handleFieldBlur("fullName", fullName);
                        }}
                        placeholder="Your full name"
                        aria-invalid={errors.fullName ? "true" : "false"}
                        aria-describedby={
                          errors.fullName ? "checkout-full-name-error" : undefined
                        }
                        className={`field pl-11 ${
                          errors.fullName ? "field-invalid" : ""
                        }`}
                      />
                    </div>

                    {errors.fullName && (
                      <p
                        id="checkout-full-name-error"
                        className="mt-1.5 text-xs font-medium text-danger"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* PHONE */}

                  <div>
                    <label className="label" htmlFor="checkout-phone">
                      Phone Number *
                    </label>

                    <div className="relative">
                      <FaPhoneAlt
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
                        id="checkout-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => {
                          handleFieldChange("phone", e.target.value, setPhone);
                        }}
                        onBlur={() => {
                          handleFieldBlur("phone", phone);
                        }}
                        placeholder="07X XXX XXXX"
                        aria-invalid={errors.phone ? "true" : "false"}
                        aria-describedby={
                          errors.phone ? "checkout-phone-error" : undefined
                        }
                        className={`field pl-11 ${
                          errors.phone ? "field-invalid" : ""
                        }`}
                      />
                    </div>

                    {errors.phone && (
                      <p
                        id="checkout-phone-error"
                        className="mt-1.5 text-xs font-medium text-danger"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* =================================================
                    ADDRESS
                ================================================= */}

                <div className="mt-5">
                  <label className="label" htmlFor="checkout-address">
                    Delivery Address *
                  </label>

                  <textarea
                    id="checkout-address"
                    name="address"
                    rows="4"
                    value={address}
                    onChange={(e) => {
                      handleFieldChange("address", e.target.value, setAddress);
                    }}
                    onBlur={() => {
                      handleFieldBlur("address", address);
                    }}
                    placeholder="House number, street, village..."
                    aria-invalid={errors.address ? "true" : "false"}
                    aria-describedby={
                      errors.address ? "checkout-address-error" : undefined
                    }
                    className={`field resize-none ${
                      errors.address ? "field-invalid" : ""
                    }`}
                  />

                  {errors.address && (
                    <p
                      id="checkout-address-error"
                      className="mt-1.5 text-xs font-medium text-danger"
                    >
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* =================================================
                    CITY + DISTRICT
                ================================================= */}

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {/* CITY */}

                  <div>
                    <label className="label" htmlFor="checkout-city">
                      City *
                    </label>

                    <input
                      id="checkout-city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => {
                        handleFieldChange("city", e.target.value, setCity);
                      }}
                      onBlur={() => {
                        handleFieldBlur("city", city);
                      }}
                      placeholder="City"
                      aria-invalid={errors.city ? "true" : "false"}
                      aria-describedby={
                        errors.city ? "checkout-city-error" : undefined
                      }
                      className={`field ${
                        errors.city ? "field-invalid" : ""
                      }`}
                    />

                    {errors.city && (
                      <p
                        id="checkout-city-error"
                        className="mt-1.5 text-xs font-medium text-danger"
                      >
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* DISTRICT */}

                  <div>
                    <label className="label" htmlFor="checkout-district">
                      District *
                    </label>

                    <input
                      id="checkout-district"
                      name="district"
                      type="text"
                      autoComplete="address-level1"
                      value={district}
                      onChange={(e) => {
                        handleFieldChange("district", e.target.value, setDistrict);
                      }}
                      onBlur={() => {
                        handleFieldBlur("district", district);
                      }}
                      placeholder="District"
                      aria-invalid={errors.district ? "true" : "false"}
                      aria-describedby={
                        errors.district ? "checkout-district-error" : undefined
                      }
                      className={`field ${
                        errors.district ? "field-invalid" : ""
                      }`}
                    />

                    {errors.district && (
                      <p
                        id="checkout-district-error"
                        className="mt-1.5 text-xs font-medium text-danger"
                      >
                        {errors.district}
                      </p>
                    )}
                  </div>
                </div>

                {/* =================================================
                    NOTES
                ================================================= */}

                <div className="mt-5">
                  <label className="label" htmlFor="checkout-notes">
                    Order Notes
                    <span className="ml-2 font-normal text-ink-muted">
                      Optional
                    </span>
                  </label>

                  <textarea
                    id="checkout-notes"
                    name="notes"
                    rows="3"
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                    }}
                    placeholder="Special instructions..."
                    className="field resize-none"
                  />
                </div>
              </form>

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
                  Your Order
                </h2>

                <div className="my-6 h-px w-full bg-line" />

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div
                  className="
                    max-h-[300px]
                    space-y-4
                    overflow-y-auto
                    pr-1
                  "
                >
                  {cart.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        loading="lazy"
                        className="
                          size-14
                          shrink-0
                          rounded-md
                          border
                          border-line
                          object-cover
                        "
                      />

                      <div className="min-w-0 flex-1">
                        <h3
                          className="
                            truncate
                            text-sm
                            font-display
                            font-bold
                            text-ink
                          "
                        >
                          {product.name}
                        </h3>

                        <p className="mt-1 text-xs text-ink-muted">
                          Qty: {product.quantity}
                        </p>
                      </div>

                      <p
                        className="
                          whitespace-nowrap
                          text-sm
                          font-display
                          font-bold
                          text-ink
                        "
                      >
                        LKR {(product.price * product.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="my-6 h-px w-full bg-line" />

                {/* PRODUCTS */}

                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Products</span>

                  <span className="font-display font-bold text-ink">
                    {cart.length}
                  </span>
                </div>

                {/* QUANTITY */}

                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-ink-muted">Total Quantity</span>

                  <span className="font-display font-bold text-ink">
                    {totalQuantity}
                  </span>
                </div>

                {/* DELIVERY */}

                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-ink-muted">Delivery</span>

                  <span className="font-display font-bold text-aurora-600 dark:text-aurora-300">
                    Calculated later
                  </span>
                </div>

                <div className="my-6 h-px w-full bg-line" />

                {/* TOTAL */}

                <div className="flex items-end justify-between gap-5">
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

                    <p className="mt-1 text-[10px] text-ink-muted">
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
                    <CountUp value={totalPrice} decimals={2} prefix="LKR " />
                  </p>
                </div>

                {/* =================================================
                    PAYMENT PLAN
                ================================================= */}

                <div className="my-6 h-px w-full bg-line" />

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <FaCreditCard
                      aria-hidden="true"
                      className="text-aurora-600 dark:text-aurora-300"
                    />

                    <h3
                      className="
                        text-sm
                        font-display
                        font-bold
                        text-ink
                      "
                    >
                      Choose Payment Plan
                    </h3>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Payment plan"
                    className="flex flex-col gap-3"
                  >
                    {/* FULL PAYMENT */}

                    <button
                      type="button"
                      role="radio"
                      aria-checked={paymentPlan === "Full Payment"}
                      onClick={() => {
                        setPaymentPlan("Full Payment");
                      }}
                      className={`
                        w-full
                        rounded-lg
                        border-2
                        p-4
                        text-left
                        transition-all
                        duration-200

                        ${
                          paymentPlan === "Full Payment"
                            ? "border-aurora-500 bg-aurora-500/10 shadow-[var(--shadow-e2)]"
                            : "border-line bg-surface hover:border-line-strong"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className={`
                              flex
                              size-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border-2
                              transition-colors

                              ${
                                paymentPlan === "Full Payment"
                                  ? "border-aurora-500 bg-aurora-500"
                                  : "border-line-strong"
                              }
                            `}
                          >
                            {paymentPlan === "Full Payment" && (
                              <span className="size-2 rounded-full bg-ink-invert" />
                            )}
                          </span>

                          <div>
                            <p
                              className="
                                font-display
                                font-bold
                                text-ink
                              "
                            >
                              Full Payment
                            </p>

                            <p className="mt-1 text-xs text-ink-muted">
                              Pay the full order amount securely now.
                            </p>
                          </div>
                        </div>

                        <p
                          className="
                            whitespace-nowrap
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
                    </button>

                    {/* HALF PAYMENT */}

                    <button
                      type="button"
                      role="radio"
                      aria-checked={paymentPlan === "Half Payment"}
                      onClick={() => {
                        setPaymentPlan("Half Payment");
                      }}
                      className={`
                        w-full
                        rounded-lg
                        border-2
                        p-4
                        text-left
                        transition-all
                        duration-200

                        ${
                          paymentPlan === "Half Payment"
                            ? "border-aurora-500 bg-aurora-500/10 shadow-[var(--shadow-e2)]"
                            : "border-line bg-surface hover:border-line-strong"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className={`
                              flex
                              size-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border-2
                              transition-colors

                              ${
                                paymentPlan === "Half Payment"
                                  ? "border-aurora-500 bg-aurora-500"
                                  : "border-line-strong"
                              }
                            `}
                          >
                            {paymentPlan === "Half Payment" && (
                              <span className="size-2 rounded-full bg-ink-invert" />
                            )}
                          </span>

                          <div>
                            <p
                              className="
                                font-display
                                font-bold
                                text-ink
                              "
                            >
                              50% Advance
                            </p>

                            <p className="mt-1 text-xs text-ink-muted">
                              Pay 50% now and the remaining 50% on delivery.
                            </p>
                          </div>
                        </div>

                        <p
                          className="
                            whitespace-nowrap
                            font-display
                            font-bold
                            text-ink
                          "
                        >
                          <CountUp
                            value={halfPaymentAmount}
                            decimals={2}
                            prefix="LKR "
                          />
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* PAYMENT BREAKDOWN */}

                  <div
                    className="
                      mt-4
                      rounded-lg
                      border
                      border-line
                      bg-surface-2
                      p-4
                    "
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Pay now</span>

                      <span
                        className="
                          font-display
                          font-bold
                          text-ink
                        "
                      >
                        <CountUp
                          value={amountToPayNow}
                          decimals={2}
                          prefix="LKR "
                        />
                      </span>
                    </div>

                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-ink-muted">Balance on delivery</span>

                      <span
                        className="
                          font-display
                          font-bold
                          text-ink
                        "
                      >
                        <CountUp
                          value={balanceOnDelivery}
                          decimals={2}
                          prefix="LKR "
                        />
                      </span>
                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        items-start
                        gap-2
                        border-t
                        border-line
                        pt-4
                      "
                    >
                      <FaLock
                        aria-hidden="true"
                        className="
                          mt-0.5
                          shrink-0
                          text-aurora-600
                          dark:text-aurora-300
                        "
                      />

                      <p className="text-[11px] leading-5 text-ink-muted">
                        Payment is processed securely by Payments.lk. NariCraft
                        does not store your card number or CVV.
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    PLACE ORDER
                ================================================= */}

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isOrdering}
                  aria-busy={isOrdering}
                  className="btn btn-primary mt-7 w-full !py-4"
                >
                  {isOrdering ? (
                    <>
                      <FaSpinner
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                      Processing…
                    </>
                  ) : (
                    <>
                      Pay{" "}
                      <CountUp
                        value={amountToPayNow}
                        decimals={2}
                        prefix="LKR "
                      />{" "}
                      Securely
                    </>
                  )}
                </button>

                {/* BACK TO CART */}

                <Link
                  to="/cart"
                  className="btn btn-ghost mt-3 w-full"
                >
                  <FaArrowLeft size={11} aria-hidden="true" />
                  Back to Cart
                </Link>
              </aside>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
