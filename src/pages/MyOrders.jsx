import { API_URL } from "../utils/config.js";
import axios from "axios";

import { useCallback, useEffect, useRef, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

import {
  FaEye,
  FaTimes,
  FaShoppingBag,
  FaMagic,
  FaRulerCombined,
  FaTshirt,
  FaSyncAlt,
  FaCreditCard,
  FaCheckCircle,
  FaLock,
} from "react-icons/fa";

import { EmptyState, ErrorState, TableSkeleton } from "../components/StateBlocks";

import { AuroraBackdrop } from "../components/brand/AuroraBackdrop";

import { Reveal } from "../components/brand/useReveal";

import { PageTransition } from "../components/PageTransition";

// =====================================================
// GARMENT / MEASUREMENT DISPLAY CONFIG
// =====================================================

const garmentDisplayConfig = {
  "saree-jacket": {
    label: "Saree Jacket",
    fields: [
      { name: "height", label: "උස (Height)" },
      { name: "shoulder", label: "උරපතු මිනුම (Shoulder)" },
      { name: "bust", label: "පපුව වට (Bust)" },
      { name: "abdomen", label: "උදරයේ ප්‍රදේශ මිම්ම (Abdomen)" },
      { name: "frontNeckDepth", label: "ඉදිරි කර ගැඹුර (Front Neck Depth)" },
      { name: "backNeckDepth", label: "පිටුපස කර ගැඹුර (Back Neck Depth)" },
      {
        name: "topToBustPoint",
        label: "ඉ඄ළ සිට බ්‍රා මධ්‍ය ලක්ෂ්‍යය (Top to Bust Point)",
      },
      {
        name: "sideToBustPoint",
        label: "පැත්තෙන් සිට බ්‍රා මධ්‍ය ලක්ෂ්‍යය (Side to Bust Point)",
      },
      { name: "sleeveLength", label: "අත දිග (Sleeve Length)" },
      { name: "sleeveCircumference", label: "අත වට (Sleeve Circumference)" },
      { name: "armhole", label: "අත් කැපුම (Armhole)" },
    ],
  },

  frock: {
    label: "Frock",
    fields: [
      { name: "shoulder", label: "උරහිස (Shoulder)" },
      { name: "waistLength", label: "ඉන දක්වා (Waist Length)" },
      { name: "bust", label: "පපුව (Bust)" },
      { name: "waist", label: "ඉන (Waist)" },
      { name: "sleeveCircumference", label: "අත වට (Sleeve Circumference)" },
      { name: "armhole", label: "අත් කැපුම (Armhole)" },
      { name: "skirtLength", label: "සාය උස (Skirt Length)" },
      { name: "frontNeckDepth", label: "ඉදිරි කර ගැඹුර (Front Neck Depth)" },
    ],
  },

  "crop-top": {
    label: "Crop Top",
    fields: [
      { name: "height", label: "උස (Height)" },
      { name: "shoulder", label: "උරහිස (Shoulder)" },
      { name: "waistLength", label: "ඉන දක්වා (Waist Length)" },
      { name: "bust", label: "පපුව (Bust)" },
      { name: "waist", label: "ඉන (Waist)" },
      { name: "sleeveCircumference", label: "අත වට (Sleeve Circumference)" },
      { name: "armhole", label: "අත් කැපුම (Armhole)" },
      { name: "frontNeckDepth", label: "ඉදිරි කර ගැඹුර (Front Neck Depth)" },
    ],
  },
};

const legacyMeasurementFields = [
  { name: "bust", label: "Bust" },
  { name: "underBust", label: "Under Bust" },
  { name: "waist", label: "Waist" },
  { name: "shoulder", label: "Shoulder" },
  { name: "sleeveLength", label: "Sleeve Length" },
  { name: "sleeveCircumference", label: "Sleeve Circumference" },
  { name: "frontNeck", label: "Front Neck" },
  { name: "backNeck", label: "Back Neck" },
  { name: "jacketLength", label: "Jacket Length" },
];

function getGarmentLabel(garmentType) {
  return garmentDisplayConfig[garmentType]?.label || "Legacy Custom Design";
}

function getOrderMeasurementFields(order) {
  return (
    garmentDisplayConfig[order?.garmentType]?.fields || legacyMeasurementFields
  );
}

// =====================================================
// DIALOG FOCUS / ESCAPE HELPER
// =====================================================

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useDialogFocus(open, onClose) {
  const panelRef = useRef(null);

  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement;

    const node = panelRef.current;

    const getFocusable = () =>
      node
        ? Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
            (element) => element.offsetParent !== null,
          )
        : [];

    getFocusable()[0]?.focus?.();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();

        onClose();

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const items = getFocusable();

      if (items.length === 0) {
        return;
      }

      const first = items[0];

      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();

        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();

        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  return panelRef;
}

// =====================================================
// STATUS HELPERS
// =====================================================

function getStatusBadge(status) {
  if (status === "Pending") {
    return "badge badge-warning";
  }

  if (status === "Confirmed" || status === "Accepted") {
    return "badge badge-info";
  }

  if (status === "Processing" || status === "In Progress" || status === "Reviewed") {
    return "badge badge-accent";
  }

  if (status === "Shipped") {
    return "badge badge-accent";
  }

  if (
    status === "Delivered" ||
    status === "Completed" ||
    status === "Ready"
  ) {
    return "badge badge-success";
  }

  if (status === "Cancelled") {
    return "badge badge-danger";
  }

  return "badge";
}

function getPaymentBadge(status) {
  if (status === "Price Pending") {
    return "badge badge-warning";
  }

  if (status === "Payment Pending") {
    return "badge badge-warning";
  }

  if (status === "Partially Paid") {
    return "badge badge-info";
  }

  if (status === "Paid") {
    return "badge badge-success";
  }

  if (status === "Failed" || status === "Chargedback") {
    return "badge badge-danger";
  }

  return "badge";
}

export default function MyOrders() {
  const navigate = useNavigate();

  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.state?.tab === "custom" ? "custom" : "products",
  );

  const [productOrders, setProductOrders] = useState([]);

  const [customOrders, setCustomOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState(null);

  const [selectedProductOrder, setSelectedProductOrder] = useState(null);

  const [selectedCustomOrder, setSelectedCustomOrder] = useState(null);

  const [customPaymentPlan, setCustomPaymentPlan] = useState("Full Payment");

  const [customDeliveryAddress, setCustomDeliveryAddress] = useState("");

  const [customCity, setCustomCity] = useState("");

  const [customDistrict, setCustomDistrict] = useState("");

  const [isStartingPayment, setIsStartingPayment] = useState(false);

  const isDialogOpen = Boolean(selectedProductOrder || selectedCustomOrder);

  const closeDialogs = useCallback(() => {
    setSelectedProductOrder(null);

    setSelectedCustomOrder(null);
  }, []);

  const dialogRef = useDialogFocus(isDialogOpen, closeDialogs);

  // =====================================================
  // OPEN CUSTOM ORDER MODAL
  // =====================================================

  function openCustomOrder(order) {
    setSelectedCustomOrder(order);

    setCustomPaymentPlan(
      order.paymentPlan === "Half Payment" ? "Half Payment" : "Full Payment",
    );

    setCustomDeliveryAddress(order.deliveryAddress || "");

    setCustomCity(order.city || "");

    setCustomDistrict(order.district || "");
  }

  // =====================================================
  // START CUSTOM ORDER PAYMENT
  // =====================================================

  async function payCustomOrder() {
    if (!selectedCustomOrder) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login again");

      navigate("/login");

      return;
    }

    if (selectedCustomOrder.status === "Cancelled") {
      toast.error("Cancelled orders cannot be paid");

      return;
    }

    if (!Number(selectedCustomOrder.price)) {
      toast.error("Price has not been set yet");

      return;
    }

    if (
      selectedCustomOrder.paymentStatus === "Paid" ||
      selectedCustomOrder.paymentStatus === "Partially Paid" ||
      selectedCustomOrder.paymentStatus === "Chargedback"
    ) {
      toast.error("This order cannot start another payment");

      return;
    }

    if (
      customPaymentPlan !== "Full Payment" &&
      customPaymentPlan !== "Half Payment"
    ) {
      toast.error("Please select a payment plan");

      return;
    }

    if (
      customDeliveryAddress.trim() === "" ||
      customCity.trim() === "" ||
      customDistrict.trim() === ""
    ) {
      toast.error("Please enter your delivery details");

      return;
    }

    try {
      setIsStartingPayment(true);

      const response = await axios.post(
        API_URL + "/api/payments/custom/initiate",
        {
          customOrderId: selectedCustomOrder.customOrderId,
          paymentPlan: customPaymentPlan,
          deliveryAddress: customDeliveryAddress.trim(),
          city: customCity.trim(),
          district: customDistrict.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { checkoutUrl, paymentReference } = response.data;

      if (!checkoutUrl || !paymentReference) {
        throw new Error("Invalid Payments.lk checkout response");
      }

      // Only non-sensitive temporary payment context is stored here.
      sessionStorage.setItem(
        "naricraftPendingPayment",
        JSON.stringify({
          paymentReference: paymentReference,
          orderType: "custom",
          customOrderId: selectedCustomOrder.customOrderId,
          clearCart: false,
        }),
      );

      toast.success("Redirecting to Payments.lk secure checkout...");

      // Payment status is NOT trusted from the browser redirect.
      // Backend updates the order only after the signed
      // Payments.lk webhook is verified.
      window.location.assign(checkoutUrl);
    } catch (err) {
      console.error("Custom Payment Error:", err.message);

      toast.error(
        err.response?.data?.message ||
          "Unable to start payment. Please try again.",
      );
    } finally {
      setIsStartingPayment(false);
    }
  }

  // =====================================================

  // LOAD ORDERS

  // =====================================================

  const loadOrders = useCallback(() => {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("Please login to view your orders");

      navigate("/login");

      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      axios.get(API_URL + "/api/orders", {
        headers,
      }),

      axios.get(API_URL + "/api/custom-orders", {
        headers,
      }),
    ])
      .then(([productResponse, customResponse]) => {
        setProductOrders(productResponse.data);

        setCustomOrders(customResponse.data);

        setLoadError(null);
      })
      .catch((err) => {
        console.log("Load Orders Error:", err);

        toast.error(
          err.response?.data?.message || "Failed to load your orders",
        );

        setLoadError(
          err.response?.data?.message ||
            "We could not reach the order service. Please try again.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  // Manual refresh (button / retry) — runs from a click, never from an effect.
  const refreshOrders = useCallback(() => {
    setIsLoading(true);

    setLoadError(null);

    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // =====================================================

  // FORMAT DATE

  // =====================================================

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  }

  // =====================================================

  const safeProductOrders = Array.isArray(productOrders) ? productOrders : [];

  const safeCustomOrders = Array.isArray(customOrders) ? customOrders : [];

  const selectedCustomPrice = Number(selectedCustomOrder?.price || 0);

  const customAmountToPayNow =
    customPaymentPlan === "Half Payment"
      ? Math.round((selectedCustomPrice / 2) * 100) / 100
      : selectedCustomPrice;

  const customBalanceOnDelivery =
    customPaymentPlan === "Half Payment"
      ? Math.max(
          0,
          Math.round((selectedCustomPrice - customAmountToPayNow) * 100) / 100,
        )
      : 0;

  return (
    <PageTransition>
      <main className="relative isolate w-full min-h-screen overflow-hidden bg-canvas px-4 py-10 md:px-8">
        <AuroraBackdrop />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          {/* =================================================

              HEADER

          ================================================= */}

          <Reveal immediate>
            <header className="card-glow mb-8 overflow-hidden rounded-2xl p-6 shadow-[var(--shadow-e3)] md:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[3px] text-aurora-600 dark:text-aurora-300">
                    NariCraft Account
                  </p>

                  <h1 className="mt-2 font-display text-3xl font-extrabold text-ink md:text-4xl">
                    My Orders
                  </h1>

                  <p className="mt-2 text-sm text-ink-2">
                    ඔබගේ product orders සහ custom tailoring orders මෙතනින් බලන්න.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshOrders}
                  className="btn btn-secondary self-start sm:self-auto"
                >
                  <FaSyncAlt aria-hidden="true" />
                  Refresh
                </button>
              </div>
            </header>
          </Reveal>

          {/* =================================================

              TABS

          ================================================= */}

          <Reveal delay={80}>
            <div
              role="tablist"
              aria-label="Order categories"
              className="mb-8 inline-flex w-full max-w-xl gap-1 rounded-xl border border-line bg-surface-2 p-1.5"
            >
              <button
                type="button"
                role="tab"
                id="tab-product-orders"
                aria-controls="panel-product-orders"
                aria-selected={activeTab === "products"}
                tabIndex={activeTab === "products" ? 0 : -1}
                onClick={() => setActiveTab("products")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all duration-200 ${
                  activeTab === "products"
                    ? "bg-aurora-500 text-white shadow-[var(--shadow-e2)]"
                    : "text-ink-2 hover:bg-surface hover:text-ink"
                }`}
              >
                <FaShoppingBag aria-hidden="true" />
                Product Orders
                <span className="text-xs opacity-80">
                  ({safeProductOrders.length})
                </span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-custom-orders"
                aria-controls="panel-custom-orders"
                aria-selected={activeTab === "custom"}
                tabIndex={activeTab === "custom" ? 0 : -1}
                onClick={() => setActiveTab("custom")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all duration-200 ${
                  activeTab === "custom"
                    ? "bg-aurora-500 text-white shadow-[var(--shadow-e2)]"
                    : "text-ink-2 hover:bg-surface hover:text-ink"
                }`}
              >
                <FaMagic aria-hidden="true" />
                Custom Orders
                <span className="text-xs opacity-80">
                  ({safeCustomOrders.length})
                </span>
              </button>
            </div>
          </Reveal>

          {/* =================================================

              PRODUCT ORDERS

          ================================================= */}

          {activeTab === "products" && (
            <Reveal
              delay={140}
              role="tabpanel"
              id="panel-product-orders"
              aria-labelledby="tab-product-orders"
            >
              {isLoading ? (
                <div className="table-shell">
                  <TableSkeleton rows={5} columns={5} />
                </div>
              ) : loadError ? (
                <ErrorState
                  title="We could not load your orders"
                  message={loadError}
                  onRetry={refreshOrders}
                />
              ) : safeProductOrders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="ඔබ තවම product order එකක් place කරලා නැහැ. අපගේ collection එකෙන් ඔබගේ පළමු order එක place කරන්න."
                  action={
                    <Link to="/products" className="btn btn-primary">
                      <FaShoppingBag aria-hidden="true" />
                      Explore Products
                    </Link>
                  }
                />
              ) : (
                <div className="table-shell">
                  <table className="nari-table">
                    <caption className="sr-only">
                      Your NariCraft product orders
                    </caption>

                    <thead>
                      <tr>
                        <th scope="col">Order ID</th>

                        <th scope="col">Placed</th>

                        <th scope="col">Items</th>

                        <th scope="col">Status</th>

                        <th scope="col">Total</th>

                        <th scope="col">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {safeProductOrders.map((order) => (
                        <tr key={order._id || order.orderId}>
                          <td
                            data-label="Order ID"
                            className="font-mono text-xs font-bold text-ink-2"
                          >
                            {order.orderId}
                          </td>

                          <td data-label="Placed" className="text-ink-2">
                            {formatDate(order.date || order.createdAt)}
                          </td>

                          <td data-label="Items" className="text-ink-2">
                            {order.products?.length || 0}
                          </td>

                          <td data-label="Status">
                            <span className={getStatusBadge(order.status)}>
                              {order.status}
                            </span>
                          </td>

                          <td
                            data-label="Total"
                            className="font-display text-base font-bold text-ink"
                          >
                            LKR {order.totalPrice?.toLocaleString() || "0"}
                          </td>

                          <td data-label="Action">
                            <button
                              type="button"
                              onClick={() => setSelectedProductOrder(order)}
                              className="btn btn-ghost !px-3 !py-1.5 text-xs"
                              aria-label={`View details for order ${order.orderId}`}
                            >
                              <FaEye aria-hidden="true" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Reveal>
          )}

          {/* =================================================

              CUSTOM ORDERS

          ================================================= */}

          {activeTab === "custom" && (
            <Reveal
              delay={140}
              role="tabpanel"
              id="panel-custom-orders"
              aria-labelledby="tab-custom-orders"
            >
              {isLoading ? (
                <div className="table-shell">
                  <TableSkeleton rows={5} columns={6} />
                </div>
              ) : loadError ? (
                <ErrorState
                  title="We could not load your custom orders"
                  message={loadError}
                  onRetry={refreshOrders}
                />
              ) : safeCustomOrders.length === 0 ? (
                <EmptyState
                  title="No custom orders yet"
                  description="ඔබේම custom design එකක් අපට එවලා tailoring order එකක් පටන් ගන්න."
                  action={
                    <Link to="/custom-design" className="btn btn-primary">
                      <FaMagic aria-hidden="true" />
                      Create Custom Design
                    </Link>
                  }
                />
              ) : (
                <div className="table-shell">
                  <table className="nari-table">
                    <caption className="sr-only">
                      Your NariCraft custom tailoring orders
                    </caption>

                    <thead>
                      <tr>
                        <th scope="col">Order ID</th>

                        <th scope="col">Garment</th>

                        <th scope="col">Size / Fit</th>

                        <th scope="col">Price</th>

                        <th scope="col">Payment</th>

                        <th scope="col">Status</th>

                        <th scope="col">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {safeCustomOrders.map((order) => (
                        <tr key={order._id || order.customOrderId}>
                          <td
                            data-label="Order ID"
                            className="font-mono text-xs font-bold text-ink-2"
                          >
                            {order.customOrderId}
                          </td>

                          <td data-label="Garment" className="text-ink">
                            <span className="inline-flex items-center gap-2 font-semibold">
                              <FaTshirt aria-hidden="true" className="text-aurora-500" />
                              {getGarmentLabel(order.garmentType)}
                            </span>
                          </td>

                          <td data-label="Size / Fit" className="text-ink-2">
                            {order.measurementType === "custom"
                              ? "Custom Measurements"
                              : `Standard Size - ${order.standardSize || "-"}`}
                          </td>

                          <td
                            data-label="Price"
                            className="font-display text-base font-bold text-ink"
                          >
                            {order.price
                              ? `LKR ${order.price.toLocaleString()}`
                              : "Price Pending"}
                          </td>

                          <td data-label="Payment">
                            <span className={getPaymentBadge(order.paymentStatus)}>
                              {order.paymentStatus}
                            </span>
                          </td>

                          <td data-label="Status">
                            <span className={getStatusBadge(order.status)}>
                              {order.status}
                            </span>
                          </td>

                          <td data-label="Action">
                            <button
                              type="button"
                              onClick={() => openCustomOrder(order)}
                              className="btn btn-ghost !px-3 !py-1.5 text-xs"
                              aria-label={`View details for custom order ${order.customOrderId}`}
                            >
                              <FaEye aria-hidden="true" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Reveal>
          )}

          {/* =================================================

              NORMAL ORDER MODAL

          ================================================= */}

          {selectedProductOrder && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setSelectedProductOrder(null);
                }
              }}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={`Product order ${selectedProductOrder.orderId}`}
                className="pop-in max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-line bg-canvas shadow-[var(--shadow-e4)]"
              >
                <ModalHeader
                  title={selectedProductOrder.orderId}
                  text="PRODUCT ORDER DETAILS"
                  onClose={() => setSelectedProductOrder(null)}
                />

                <div className="p-6 md:p-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoCard
                      title="Order Status"
                      value={selectedProductOrder.status}
                    />

                    <InfoCard
                      title="Payment Status"
                      value={
                        selectedProductOrder.paymentStatus || "Payment Pending"
                      }
                    />

                    <InfoCard
                      title="Total"
                      value={`LKR ${
                        selectedProductOrder.totalPrice?.toLocaleString() || "0"
                      }`}
                    />

                    <InfoCard
                      title="Paid / Remaining"
                      value={`LKR ${Number(
                        selectedProductOrder.paidAmount || 0,
                      ).toLocaleString()} / LKR ${Number(
                        selectedProductOrder.remainingAmount || 0,
                      ).toLocaleString()}`}
                    />
                  </div>

                  {/* DELIVERY */}

                  <div className="surface mt-5 p-5">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                      Delivery Details
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-ink-2">
                      {selectedProductOrder.fullName}
                      <br />
                      {selectedProductOrder.phone}
                      <br />
                      {selectedProductOrder.address}
                      <br />
                      {selectedProductOrder.city}, {selectedProductOrder.district}
                    </p>
                  </div>

                  {/* PRODUCTS */}

                  <div className="mt-6">
                    <h3 className="font-display text-lg font-bold text-ink">
                      Products
                    </h3>

                    <div className="mt-4 space-y-3">
                      {selectedProductOrder.products?.map((product, index) => (
                        <div
                          key={product._id || product.productId || index}
                          className="surface flex items-center gap-4 p-4"
                        >
                          <img
                            src={product.image || "/placeholder.png"}
                            alt={product.name || "Order product"}
                            className="size-16 rounded-xl object-cover"
                          />

                          <div className="flex-1">
                            <p className="font-bold text-ink">{product.name}</p>

                            <p className="mt-1 text-xs text-ink-muted">
                              Qty: {product.quantity}
                            </p>
                          </div>

                          <p className="font-display font-bold text-ink">
                            LKR{" "}
                            {(product.price * product.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedProductOrder.notes && (
                    <NoteBox
                      title="Order Notes"
                      text={selectedProductOrder.notes}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =================================================

              CUSTOM ORDER MODAL

          ================================================= */}

          {selectedCustomOrder && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setSelectedCustomOrder(null);
                }
              }}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={`Custom order ${selectedCustomOrder.customOrderId}`}
                className="pop-in max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-line bg-canvas shadow-[var(--shadow-e4)]"
              >
                <ModalHeader
                  title={selectedCustomOrder.customOrderId}
                  text="CUSTOM DESIGN ORDER"
                  onClose={() => setSelectedCustomOrder(null)}
                />

                <div className="p-6 md:p-8">
                  {/* DESIGN IMAGE */}

                  <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-line bg-surface">
                    <img
                      src={selectedCustomOrder.designImage}
                      alt={`Custom design preview for order ${selectedCustomOrder.customOrderId}`}
                      className="max-h-[500px] w-full object-contain"
                    />
                  </div>

                  {/* STATUS */}

                  <div className="mt-7 grid gap-4 sm:grid-cols-3">
                    <InfoCard
                      title="Order Status"
                      value={selectedCustomOrder.status}
                    />

                    <InfoCard
                      title="Payment"
                      value={selectedCustomOrder.paymentStatus}
                    />

                    <InfoCard
                      title="Price"
                      value={
                        selectedCustomOrder.price
                          ? `LKR ${selectedCustomOrder.price.toLocaleString()}`
                          : "Price Pending"
                      }
                    />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <InfoCard
                      title="Contact Number"
                      value={selectedCustomOrder.telephone}
                    />

                    <InfoCard
                      title="Customer Email"
                      value={selectedCustomOrder.email}
                    />

                    <InfoCard
                      title="Garment Type"
                      value={getGarmentLabel(selectedCustomOrder.garmentType)}
                    />
                  </div>

                  {/* MEASUREMENT TYPE */}

                  <div className="surface mt-6 p-5">
                    <div className="flex items-center gap-2 text-aurora-600 dark:text-aurora-300">
                      <FaRulerCombined aria-hidden="true" />

                      <p className="text-xs font-bold uppercase tracking-[2px]">
                        Size / Measurements
                      </p>
                    </div>

                    {selectedCustomOrder.measurementType === "standard" ? (
                      <div className="mt-4">
                        <p className="text-sm text-ink-muted">Standard Size</p>

                        <p className="mt-1 font-display text-3xl font-extrabold text-ink">
                          {selectedCustomOrder.standardSize}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {getOrderMeasurementFields(selectedCustomOrder).map(
                          (field) => (
                            <Measurement
                              key={field.name}
                              title={field.label}
                              value={
                                selectedCustomOrder.measurements?.[field.name]
                              }
                              unit={selectedCustomOrder.measurementUnit}
                            />
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* FABRIC */}

                  <div className="surface mt-5 p-5">
                    <p className="text-xs font-bold uppercase tracking-[2px] text-aurora-600 dark:text-aurora-300">
                      Fabric
                    </p>

                    <p className="mt-2 font-bold text-ink">
                      {selectedCustomOrder.customerProvidesFabric
                        ? "Customer will provide the fabric ✅"
                        : "Fabric is not provided by customer"}
                    </p>
                  </div>

                  {selectedCustomOrder.notes && (
                    <NoteBox
                      title="Special Notes"
                      text={selectedCustomOrder.notes}
                    />
                  )}

                  {selectedCustomOrder.status === "Cancelled" &&
                    selectedCustomOrder.cancelReason && (
                      <div className="mt-5 rounded-xl border border-danger/40 bg-danger/5 p-5">
                        <p className="text-xs font-bold uppercase tracking-[2px] text-danger">
                          Cancellation Reason
                        </p>

                        <p className="mt-3 text-sm leading-7 text-ink-2">
                          {selectedCustomOrder.cancelReason}
                        </p>

                        {selectedCustomOrder.cancelledAt && (
                          <p className="mt-3 text-xs text-ink-muted">
                            Cancelled:{" "}
                            {formatDate(selectedCustomOrder.cancelledAt)}
                          </p>
                        )}
                      </div>
                    )}

                  <div className="card-glow mt-6 rounded-2xl p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[2px] text-ink-muted">
                          Custom Order Price
                        </p>

                        <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                          {selectedCustomOrder.price
                            ? `LKR ${selectedCustomOrder.price.toLocaleString()}`
                            : "Price Pending"}
                        </p>
                      </div>

                      <span className={getStatusBadge(selectedCustomOrder.status)}>
                        {selectedCustomOrder.status}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-ink-muted">
                      {formatDate(
                        selectedCustomOrder.date || selectedCustomOrder.createdAt,
                      )}
                    </p>
                  </div>

                  {/* =================================================

                      CUSTOM PAYMENT AREA

                  ================================================= */}

                  {selectedCustomOrder.price &&
                    selectedCustomOrder.status !== "Cancelled" &&
                    (selectedCustomOrder.paymentStatus === "Payment Pending" ||
                      selectedCustomOrder.paymentStatus === "Failed") && (
                      <div className="surface-elevated mt-6 rounded-2xl p-5 md:p-6">
                        <div className="flex items-center gap-3">
                          <span className="flex size-11 items-center justify-center rounded-xl bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                            <FaCreditCard aria-hidden="true" />
                          </span>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-[2px] text-aurora-600 dark:text-aurora-300">
                              Secure Payment
                            </p>

                            <h3 className="mt-1 font-display text-xl font-bold text-ink">
                              Choose your payment plan
                            </h3>
                          </div>
                        </div>

                        {selectedCustomOrder.paymentStatus === "Failed" && (
                          <div className="mt-4 rounded-lg border border-danger/40 bg-danger/5 p-4">
                            <p className="text-sm font-bold text-danger">
                              Your previous payment attempt was not completed. You
                              can try again.
                            </p>
                          </div>
                        )}

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          <button
                            type="button"
                            aria-pressed={customPaymentPlan === "Full Payment"}
                            onClick={() => setCustomPaymentPlan("Full Payment")}
                            className={`rounded-xl border p-5 text-left transition-all ${
                              customPaymentPlan === "Full Payment"
                                ? "border-aurora-500 bg-aurora-500/8 shadow-[var(--shadow-e2)]"
                                : "border-line bg-surface hover:border-aurora-500/60"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                aria-hidden="true"
                                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                                  customPaymentPlan === "Full Payment"
                                    ? "border-aurora-500 bg-aurora-500"
                                    : "border-line-strong"
                                }`}
                              >
                                {customPaymentPlan === "Full Payment" && (
                                  <FaCheckCircle className="text-xs text-white" />
                                )}
                              </span>

                              <div>
                                <p className="font-bold text-ink">Full Payment</p>

                                <p className="mt-1 text-xs text-ink-2">
                                  Pay the complete custom order price now.
                                </p>

                                <p className="mt-3 font-display text-lg font-bold text-ink">
                                  LKR {selectedCustomPrice.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            aria-pressed={customPaymentPlan === "Half Payment"}
                            onClick={() => setCustomPaymentPlan("Half Payment")}
                            className={`rounded-xl border p-5 text-left transition-all ${
                              customPaymentPlan === "Half Payment"
                                ? "border-aurora-500 bg-aurora-500/8 shadow-[var(--shadow-e2)]"
                                : "border-line bg-surface hover:border-aurora-500/60"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                aria-hidden="true"
                                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                                  customPaymentPlan === "Half Payment"
                                    ? "border-aurora-500 bg-aurora-500"
                                    : "border-line-strong"
                                }`}
                              >
                                {customPaymentPlan === "Half Payment" && (
                                  <FaCheckCircle className="text-xs text-white" />
                                )}
                              </span>

                              <div>
                                <p className="font-bold text-ink">
                                  50% Advance
                                </p>

                                <p className="mt-1 text-xs text-ink-2">
                                  Pay 50% now and the remaining 50% on delivery.
                                </p>

                                <p className="mt-3 font-display text-lg font-bold text-ink">
                                  LKR {customAmountToPayNow.toLocaleString()} now
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>

                        <div className="mt-5 rounded-xl border border-line bg-surface-2 p-4">
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-ink-2">Pay now</span>

                            <span className="font-display font-bold text-ink">
                              LKR {customAmountToPayNow.toLocaleString()}
                            </span>
                          </div>

                          <div className="mt-3 flex justify-between gap-4 text-sm">
                            <span className="text-ink-2">Balance on delivery</span>

                            <span className="font-display font-bold text-ink">
                              LKR {customBalanceOnDelivery.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5">
                          <p className="text-xs font-bold uppercase tracking-[2px] text-aurora-600 dark:text-aurora-300">
                            Delivery Details
                          </p>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                              <label
                                className="label"
                                htmlFor="deliveryAddress"
                              >
                                Delivery Address
                              </label>

                              <input
                                id="deliveryAddress"
                                type="text"
                                value={customDeliveryAddress}
                                onChange={(e) =>
                                  setCustomDeliveryAddress(e.target.value)
                                }
                                placeholder="Enter full delivery address"
                                autoComplete="street-address"
                                className="field"
                              />
                            </div>

                            <div>
                              <label className="label" htmlFor="deliveryCity">
                                City
                              </label>

                              <input
                                id="deliveryCity"
                                type="text"
                                value={customCity}
                                onChange={(e) => setCustomCity(e.target.value)}
                                placeholder="City"
                                autoComplete="address-level2"
                                className="field"
                              />
                            </div>

                            <div>
                              <label className="label" htmlFor="deliveryDistrict">
                                District
                              </label>

                              <input
                                id="deliveryDistrict"
                                type="text"
                                value={customDistrict}
                                onChange={(e) =>
                                  setCustomDistrict(e.target.value)
                                }
                                placeholder="District"
                                autoComplete="address-level1"
                                className="field"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isStartingPayment}
                          onClick={payCustomOrder}
                          className="btn btn-primary mt-6 w-full !py-4"
                        >
                          <FaLock aria-hidden="true" />
                          {isStartingPayment
                            ? "Preparing Secure Payment..."
                            : `Pay LKR ${customAmountToPayNow.toLocaleString()} Securely`}
                        </button>

                        <p className="mt-4 text-center text-[11px] leading-5 text-ink-muted">
                          Card details are entered on Payments.lk. NariCraft does
                          not store your card number or CVV.
                        </p>
                      </div>
                    )}

                  {selectedCustomOrder.paymentStatus === "Partially Paid" && (
                    <div className="mt-6 rounded-xl border border-info/40 bg-info/5 p-5 md:p-6">
                      <div className="flex items-center gap-3">
                        <FaCheckCircle
                          aria-hidden="true"
                          className="text-2xl text-info"
                        />

                        <div>
                          <p className="font-bold text-ink">50% Advance Paid</p>

                          <p className="mt-1 text-sm text-ink-2">
                            The remaining balance will be collected on delivery.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <SmallInfo
                          title="Total"
                          value={`LKR ${selectedCustomPrice.toLocaleString()}`}
                        />

                        <SmallInfo
                          title="Paid"
                          value={`LKR ${Number(
                            selectedCustomOrder.paidAmount || 0,
                          ).toLocaleString()}`}
                        />

                        <SmallInfo
                          title="Balance"
                          value={`LKR ${Number(
                            selectedCustomOrder.remainingAmount || 0,
                          ).toLocaleString()}`}
                        />
                      </div>

                      {selectedCustomOrder.deliveryAddress && (
                        <p className="mt-5 text-xs leading-6 text-ink-2">
                          Delivery: {selectedCustomOrder.deliveryAddress},{" "}
                          {selectedCustomOrder.city},{" "}
                          {selectedCustomOrder.district}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedCustomOrder.paymentStatus === "Paid" && (
                    <div className="mt-6 rounded-xl border border-success/40 bg-success/5 p-5 md:p-6">
                      <div className="flex items-center gap-3">
                        <FaCheckCircle
                          aria-hidden="true"
                          className="text-2xl text-success"
                        />

                        <div>
                          <p className="font-bold text-ink">
                            Payment Completed
                          </p>

                          <p className="mt-1 text-sm text-ink-2">
                            This custom order is fully paid.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <SmallInfo
                          title="Total"
                          value={`LKR ${selectedCustomPrice.toLocaleString()}`}
                        />

                        <SmallInfo
                          title="Paid"
                          value={`LKR ${Number(
                            selectedCustomOrder.paidAmount || 0,
                          ).toLocaleString()}`}
                        />

                        <SmallInfo title="Balance" value="LKR 0" />
                      </div>
                    </div>
                  )}

                  {selectedCustomOrder.paymentStatus === "Chargedback" && (
                    <div className="mt-6 rounded-xl border border-danger/40 bg-danger/5 p-5">
                      <p className="font-bold text-danger">
                        Payment Under Review
                      </p>

                      <p className="mt-2 text-sm leading-6 text-ink-2">
                        This payment has a chargeback status. Please contact
                        NariCraft support before making another payment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
}

// =====================================================

// SMALL COMPONENTS

// =====================================================

function SmallInfo({ title, value }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <p className="text-xs text-ink-muted">{title}</p>

      <p className="mt-1 font-display font-bold text-ink">{value}</p>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-xs font-bold uppercase tracking-[2px] text-aurora-600 dark:text-aurora-300">
        {title}
      </p>

      <p className="mt-3 font-bold text-ink">{value || "-"}</p>
    </div>
  );
}

function Measurement({ title, value, unit }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-4">
      <p className="text-xs text-ink-muted">{title}</p>

      <p className="mt-1 font-display font-bold text-ink">
        {value || "-"} {value ? unit : ""}
      </p>
    </div>
  );
}

function NoteBox({ title, text }) {
  return (
    <div className="mt-5 rounded-xl border border-warning/40 bg-warning/5 p-5">
      <p className="text-xs font-bold uppercase tracking-[2px] text-warning">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-ink-2">{text}</p>
    </div>
  );
}

function ModalHeader({ title, text, onClose }) {
  return (
    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-canvas/95 p-6 backdrop-blur">
      <div>
        <p className="text-xs font-bold uppercase tracking-[2px] text-aurora-600 dark:text-aurora-300">
          {text}
        </p>

        <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
          {title}
        </h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${text.toLowerCase()} details`}
        className="btn btn-ghost !size-10 !rounded-full !p-0"
      >
        <FaTimes aria-hidden="true" />
      </button>
    </div>
  );
}
