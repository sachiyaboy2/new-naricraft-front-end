import { API_URL } from "../../utils/config.js";
import axios from "axios";

import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  FaBan,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaEye,
  FaMagic,
  FaPhoneAlt,
  FaRulerCombined,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTshirt,
  FaUser,
} from "react-icons/fa";

import { AuroraBackdrop } from "../../components/brand/AuroraBackdrop";
import { CountUp } from "../../components/brand/CountUp";
import { Reveal } from "../../components/brand/useReveal";
import { TiltCard } from "../../components/brand/TiltCard";
import { PageTransition } from "../../components/PageTransition";
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "../../components/StateBlocks";

// =====================================================
// GARMENT + MEASUREMENT CONFIG
// =====================================================

const garmentMeasurementConfig = {
  "saree-jacket": {
    label: "Saree Jacket",
    fields: [
      { name: "height", title: "Height / උස" },
      { name: "shoulder", title: "Shoulder / උරපතු මිනුම" },
      { name: "bust", title: "Bust / පපුව වට" },
      { name: "abdomen", title: "Abdomen / උදරයේ ප්‍රදේශ මිම්ම" },
      { name: "frontNeckDepth", title: "Front Neck Depth / ඉදිරි කර ගැඹුර" },
      { name: "backNeckDepth", title: "Back Neck Depth / පිටුපස කර ගැඹුර" },
      {
        name: "topToBustPoint",
        title: "Top to Bust Point / ඉහළ සිට බ්‍රා මධ්‍ය ලක්ෂ්‍යය",
      },
      {
        name: "sideToBustPoint",
        title: "Side to Bust Point / බ්‍රා මධ්‍ය ලක්ෂ්‍යය දක්වා",
      },
      { name: "sleeveLength", title: "Sleeve Length / අත දිග" },
      { name: "sleeveCircumference", title: "Sleeve Circumference / අත වට" },
      { name: "armhole", title: "Armhole / අත කැපුම" },
    ],
  },

  frock: {
    label: "Frock",
    fields: [
      { name: "shoulder", title: "Shoulder / උරහිස" },
      { name: "waistLength", title: "Waist Length / ඉන දක්වා" },
      { name: "bust", title: "Bust / පපුව" },
      { name: "waist", title: "Waist / ඉන" },
      { name: "sleeveCircumference", title: "Sleeve Circumference / අත වට" },
      { name: "armhole", title: "Armhole / අත් කැපුම" },
      { name: "skirtLength", title: "Skirt Length / සාය උස" },
      { name: "frontNeckDepth", title: "Front Neck Depth / ඉදිරි කර ගැඹුර" },
    ],
  },

  "crop-top": {
    label: "Crop Top",
    fields: [
      { name: "height", title: "Height / උස" },
      { name: "shoulder", title: "Shoulder / උරහිස" },
      { name: "waistLength", title: "Waist Length / ඉන දක්වා" },
      { name: "bust", title: "Bust / පපුව" },
      { name: "waist", title: "Waist / ඉන" },
      { name: "sleeveCircumference", title: "Sleeve Circumference / අත වට" },
      { name: "armhole", title: "Armhole / අත් කැපුම" },
      { name: "frontNeckDepth", title: "Front Neck Depth / ඉදිරි කර ගැඹුර" },
    ],
  },
};

const legacyMeasurementFields = [
  { name: "bust", title: "Bust" },
  { name: "underBust", title: "Under Bust" },
  { name: "waist", title: "Waist" },
  { name: "shoulder", title: "Shoulder" },
  { name: "sleeveLength", title: "Sleeve Length" },
  { name: "sleeveCircumference", title: "Sleeve Circumference" },
  { name: "frontNeck", title: "Front Neck" },
  { name: "backNeck", title: "Back Neck" },
  { name: "jacketLength", title: "Jacket Length" },
];

function getGarmentLabel(garmentType) {
  return garmentMeasurementConfig[garmentType]?.label || "Legacy Custom Design";
}

function getMeasurementFieldsForOrder(order) {
  return (
    garmentMeasurementConfig[order?.garmentType]?.fields ||
    legacyMeasurementFields
  );
}

export default function AdminCustomOrdersPage() {
  // =====================================================

  // STATES

  // =====================================================

  const [orders, setOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [priceInputs, setPriceInputs] = useState({});

  const [cancellingOrder, setCancellingOrder] = useState(null);

  const [cancelReason, setCancelReason] = useState("");

  // =====================================================

  // ORDER STATUSES

  // =====================================================

  const statuses = [
    "Pending",

    "Reviewed",

    "Accepted",

    "In Progress",

    "Ready",

    "Completed",

    "Cancelled",
  ];

  // =====================================================

  // PAYMENT STATUSES

  // =====================================================

  const paymentStatuses = ["Price Pending", "Payment Pending", "Paid"];

  // =====================================================

  // LOAD CUSTOM ORDERS

  // =====================================================

  async function loadOrders() {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("You need to login first");

      setLoadError("You need to login first.");

      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.get(
        API_URL + "/api/custom-orders",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrders(res.data);

      const prices = {};

      res.data.forEach((order) => {
        prices[order.customOrderId] = order.price || "";
      });

      setPriceInputs(prices);

      setLoadError("");
    } catch (err) {
      console.log("Load Custom Orders Error:", err);

      const message =
        err.response?.data?.message || "Failed to load custom orders";

      setLoadError(message);

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  // =====================================================

  // LOAD PAGE

  // =====================================================

  useEffect(() => {
    // The first request is deferred out of the effect body so the initial
    // fetch never triggers a synchronous state update while rendering.
    const timer = setTimeout(() => {
      loadOrders();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // =====================================================

  // CLOSE MODALS ON ESCAPE

  // =====================================================

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      if (updatingOrderId != null) {
        return;
      }

      setSelectedOrder(null);

      setCancellingOrder(null);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [updatingOrderId]);

  // =====================================================

  // UPDATE ORDER INSIDE PAGE

  // =====================================================

  function replaceOrder(updatedOrder) {
    setOrders((oldOrders) => {
      return oldOrders.map((order) => {
        if (order.customOrderId === updatedOrder.customOrderId) {
          return updatedOrder;
        }

        return order;
      });
    });

    setSelectedOrder((oldSelected) => {
      if (oldSelected?.customOrderId === updatedOrder.customOrderId) {
        return updatedOrder;
      }

      return oldSelected;
    });
  }

  // =====================================================

  // UPDATE PRICE

  // =====================================================

  async function updatePrice(customOrderId) {
    const token = localStorage.getItem("token");

    const price = Number(priceInputs[customOrderId]);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid price");

      return;
    }

    try {
      setUpdatingOrderId(customOrderId);

      const response = await axios.put(
        API_URL +
          "/api/custom-orders/price/" +
          customOrderId,

        {
          price: price,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      replaceOrder(response.data.order);

      setPriceInputs((old) => ({
        ...old,

        [customOrderId]: response.data.order.price,
      }));

      toast.success("Custom order price updated");
    } catch (err) {
      console.log("Price Update Error:", err);

      toast.error(err.response?.data?.message || "Failed to update price");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // =====================================================

  // UPDATE ORDER STATUS

  // =====================================================

  async function updateOrderStatus(customOrderId, status, reason = "") {
    const token = localStorage.getItem("token");

    try {
      setUpdatingOrderId(customOrderId);

      const response = await axios.put(
        API_URL +
          "/api/custom-orders/status/" +
          customOrderId,
        {
          status: status,
          cancelReason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      replaceOrder(response.data.order);

      toast.success(
        status === "Cancelled"
          ? "Order cancelled successfully"
          : "Order status updated",
      );

      return true;
    } catch (err) {
      console.log("Status Update Error:", err);

      toast.error(err.response?.data?.message || "Failed to update status");
      return false;
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function handleStatusChange(order, newStatus) {
    if (newStatus === "Cancelled") {
      setCancellingOrder(order);
      setCancelReason("");
      return;
    }

    updateOrderStatus(order.customOrderId, newStatus);
  }

  // =====================================================

  // UPDATE PAYMENT STATUS

  // =====================================================

  async function updatePaymentStatus(customOrderId, paymentStatus) {
    const token = localStorage.getItem("token");

    try {
      setUpdatingOrderId(customOrderId);

      const response = await axios.put(
        API_URL +
          "/api/custom-orders/payment/" +
          customOrderId,

        {
          paymentStatus: paymentStatus,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      replaceOrder(response.data.order);

      toast.success("Payment status updated");
    } catch (err) {
      console.log("Payment Update Error:", err);

      toast.error(
        err.response?.data?.message || "Failed to update payment status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

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

  // STATUS BADGE

  // =====================================================

  function getStatusStyle(status) {
    if (status === "Pending") {
      return "badge badge-warning";
    }

    if (status === "Reviewed") {
      return "badge badge-info";
    }

    if (status === "Accepted") {
      return "badge badge-info";
    }

    if (status === "In Progress") {
      return "badge badge-accent";
    }

    if (status === "Ready") {
      return "badge badge-accent";
    }

    if (status === "Completed") {
      return "badge badge-success";
    }

    if (status === "Cancelled") {
      return "badge badge-danger";
    }

    return "badge";
  }

  function getStatusIcon(status) {
    if (status === "Pending") {
      return <FaClock aria-hidden="true" />;
    }

    if (status === "Reviewed") {
      return <FaEye aria-hidden="true" />;
    }

    if (status === "Accepted") {
      return <FaCheckCircle aria-hidden="true" />;
    }

    if (status === "In Progress") {
      return <FaMagic aria-hidden="true" />;
    }

    if (status === "Ready") {
      return <FaTshirt aria-hidden="true" />;
    }

    if (status === "Completed") {
      return <FaCheckCircle aria-hidden="true" />;
    }

    if (status === "Cancelled") {
      return <FaBan aria-hidden="true" />;
    }

    return null;
  }

  // =====================================================

  // PAYMENT BADGE

  // =====================================================

  function getPaymentStyle(status) {
    if (status === "Price Pending") {
      return "badge badge-warning";
    }

    if (status === "Payment Pending") {
      return "badge badge-warning";
    }

    if (status === "Paid") {
      return "badge badge-success";
    }

    return "badge";
  }

  // =====================================================

  // FILTER ORDERS

  // =====================================================

  const filteredOrders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      const matchesSearch =
        searchText === "" ||
        order.customOrderId?.toLowerCase().includes(searchText) ||
        order.fullName?.toLowerCase().includes(searchText) ||
        order.email?.toLowerCase().includes(searchText) ||
        order.telephone?.toLowerCase().includes(searchText);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  // =====================================================

  // STATISTICS

  // =====================================================

  const pendingCount = orders.filter(
    (order) => order.status === "Pending",
  ).length;

  const pricePendingCount = orders.filter(
    (order) => !order.price || order.paymentStatus === "Price Pending",
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "Completed",
  ).length;

  // =====================================================

  // CLEAR FILTERS

  // =====================================================

  function clearFilters() {
    setSearch("");

    setStatusFilter("All");
  }

  // =====================================================

  // PAGE

  // =====================================================

  return (
    <PageTransition>
      <div className="relative w-full min-h-full overflow-hidden bg-canvas p-4 md:p-7">
        <AuroraBackdrop />

        <div className="relative z-10">
          {/* =================================================

              HEADER

          ================================================= */}

          <Reveal immediate>
            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[3px] text-aurora-600 dark:text-aurora-300">
                  NariCraft Admin
                </p>

                <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                  Custom Design Orders
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                  Customer designs, measurements, fabric details, quoted prices
                  and tailoring progress මෙතනින් manage කරන්න.
                </p>
              </div>

              <button
                type="button"
                onClick={loadOrders}
                className="btn btn-secondary"
              >
                <FaSyncAlt aria-hidden="true" />
                Refresh Orders
              </button>
            </div>
          </Reveal>

          {/* =================================================

              SUMMARY STRIP

          ================================================= */}

          <Reveal immediate delay={90}>
            <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<FaMagic />}
                title="Total Custom Orders"
                value={orders.length}
              />

              <StatCard
                icon={<FaClock />}
                title="Pending Review"
                value={pendingCount}
              />

              <StatCard
                icon={<FaDollarSign />}
                title="Price Pending"
                value={pricePendingCount}
              />

              <StatCard
                icon={<FaCheckCircle />}
                title="Completed"
                value={completedCount}
              />
            </div>
          </Reveal>

          {/* =================================================

              SEARCH + FILTER

          ================================================= */}

          <Reveal delay={160}>
            <div className="surface-elevated mb-7 flex flex-col gap-4 p-4 lg:flex-row">
              <div className="flex-1">
                <label className="label" htmlFor="custom-order-search">
                  Search custom orders
                </label>

                <div className="relative">
                  <FaSearch
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  />

                  <input
                    id="custom-order-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Order ID, customer, email or phone..."
                    className="field pl-10"
                  />
                </div>
              </div>

              <div className="lg:w-[220px]">
                <label className="label" htmlFor="custom-order-status-filter">
                  Status
                </label>

                <select
                  id="custom-order-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="field font-semibold"
                >
                  <option value="All">All Statuses</option>

                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Reveal>

          {/* =================================================

              CUSTOM ORDERS TABLE

          ================================================= */}

          <Reveal delay={240}>
            <div className="table-shell">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                <p className="font-display text-sm font-semibold text-ink">
                  Custom Orders
                </p>

                <p className="text-xs text-ink-muted">
                  Showing{" "}
                  <span className="font-semibold text-ink-2">
                    {filteredOrders.length}
                  </span>{" "}
                  of {orders.length} orders
                </p>
              </div>

              {isLoading ? (
                <TableSkeleton rows={6} columns={7} />
              ) : loadError ? (
                <ErrorState
                  title="Could not load custom orders"
                  message={loadError}
                  onRetry={loadOrders}
                  className="border-0 shadow-none"
                />
              ) : filteredOrders.length === 0 ? (
                <EmptyState
                  title={
                    orders.length === 0
                      ? "No custom orders yet"
                      : "No matching custom orders"
                  }
                  description={
                    orders.length === 0
                      ? "Custom tailoring orders will appear here."
                      : "Search හෝ status filter වෙනස් කරලා බලන්න."
                  }
                  action={
                    orders.length === 0 ? (
                      <button
                        type="button"
                        onClick={loadOrders}
                        className="btn btn-secondary"
                      >
                        <FaSyncAlt aria-hidden="true" />
                        Refresh Orders
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="btn btn-secondary"
                      >
                        Clear filters
                      </button>
                    )
                  }
                  className="border-0 shadow-none"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="nari-table">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Design
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Customer
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Garment
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Price
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Status
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Payment
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id || order.customOrderId}>
                          {/* DESIGN */}

                          <td data-label="Design">
                            <div className="flex items-center gap-3">
                              <img
                                src={order.designImage || "/placeholder.png"}
                                alt={`Custom design from ${order.fullName || "customer"}`}
                                className="size-14 shrink-0 rounded-xl border border-line bg-surface-2 object-cover"
                              />

                              <div className="min-w-0">
                                <p className="truncate font-mono text-sm font-semibold text-aurora-600 dark:text-aurora-300">
                                  {order.customOrderId}
                                </p>

                                <p className="mt-1 text-[10px] text-ink-muted">
                                  {formatDate(order.createdAt || order.date)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CUSTOMER */}

                          <td data-label="Customer">
                            <p className="font-semibold text-ink">
                              {order.fullName}
                            </p>

                            <p className="mt-1 text-xs text-ink-muted">
                              {order.email}
                            </p>

                            <p className="mt-1 text-xs text-ink-muted">
                              {order.telephone}
                            </p>
                          </td>

                          {/* GARMENT */}

                          <td data-label="Garment">
                            <p className="font-semibold text-ink">
                              {getGarmentLabel(order.garmentType)}
                            </p>

                            <p className="mt-1 text-xs text-ink-muted">
                              {order.measurementType === "custom"
                                ? `Custom Measurements (${order.measurementUnit})`
                                : `Standard Size - ${order.standardSize}`}
                            </p>
                          </td>

                          {/* PRICE */}

                          <td data-label="Price">
                            <span className="whitespace-nowrap font-display font-bold text-ink">
                              {order.price
                                ? `LKR ${order.price.toLocaleString()}`
                                : "Price Pending"}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td data-label="Status">
                            <span className={`${getStatusStyle(order.status)} w-fit`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </td>

                          {/* PAYMENT */}

                          <td data-label="Payment">
                            <span
                              className={`${getPaymentStyle(order.paymentStatus)} w-fit`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td data-label="Actions">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                aria-label={`View and manage order ${order.customOrderId}`}
                                className="btn btn-secondary h-10"
                              >
                                <FaEye aria-hidden="true" />
                                Manage
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Reveal>

          {/* =================================================

              FULL DETAILS MODAL

          ================================================= */}

          {selectedOrder && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/55 p-3 backdrop-blur-sm md:p-5">
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`Details for custom order ${selectedOrder.customOrderId}`}
                className="surface-elevated pop-in max-h-[94vh] w-full max-w-6xl overflow-y-auto"
              >
                {/* ===============================================

                    MODAL HEADER

                =============================================== */}

                <div className="sticky top-0 z-10 flex items-start justify-between gap-5 rounded-t-lg bg-ink p-5 text-ink-invert md:p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[2px] text-ink-invert/70">
                      CUSTOM ORDER DETAILS
                    </p>

                    <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">
                      {selectedOrder.customOrderId}
                    </h2>

                    <p className="mt-2 text-xs text-ink-invert/70">
                      {formatDate(selectedOrder.createdAt || selectedOrder.date)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    aria-label="Close custom order details"
                    className="btn btn-ghost h-11 w-11 shrink-0 rounded-full p-0 text-ink-invert hover:bg-ink-invert/15 hover:text-ink-invert"
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                </div>

                <div className="p-5 md:p-8">
                  {/* ===============================================

                      IMAGE + CUSTOMER

                  =============================================== */}

                  <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                    {/* IMAGE */}

                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase text-aurora-600 dark:text-aurora-300">
                        Customer Design
                      </p>

                      <div className="overflow-hidden rounded-2xl border border-line bg-surface-2">
                        <img
                          src={selectedOrder.designImage || "/placeholder.png"}
                          alt={`Custom design for order ${selectedOrder.customOrderId}`}
                          className="max-h-[520px] w-full object-contain"
                        />
                      </div>
                    </div>

                    {/* CUSTOMER INFO */}

                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase text-aurora-600 dark:text-aurora-300">
                        Customer Information
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoCard
                          icon={<FaUser />}
                          title="Customer"
                          value={selectedOrder.fullName}
                        />

                        <InfoCard
                          icon={<FaPhoneAlt />}
                          title="Telephone"
                          value={selectedOrder.telephone}
                        />

                        <InfoCard
                          icon={<FaMagic />}
                          title="Email"
                          value={selectedOrder.email}
                        />

                        <InfoCard
                          icon={<FaTshirt />}
                          title="Garment Type"
                          value={getGarmentLabel(selectedOrder.garmentType)}
                        />

                        <InfoCard
                          icon={<FaTshirt />}
                          title="Fabric"
                          value={
                            selectedOrder.customerProvidesFabric
                              ? "Customer provides fabric"
                              : "Customer does not provide fabric"
                          }
                        />
                      </div>

                      {/* MEASUREMENT TYPE */}

                      <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-5">
                        <div className="flex items-center gap-2 text-aurora-600 dark:text-aurora-300">
                          <FaRulerCombined aria-hidden="true" />

                          <p className="text-xs font-semibold uppercase">
                            Measurement Type
                          </p>
                        </div>

                        <p className="mt-3 font-display text-lg font-bold text-ink">
                          {selectedOrder.measurementType === "custom"
                            ? "Custom Measurements"
                            : `Standard Size - ${selectedOrder.standardSize}`}
                        </p>

                        {selectedOrder.measurementType === "custom" && (
                          <p className="mt-1 text-sm text-ink-muted">
                            Measurement Unit:{" "}
                            <strong className="text-ink-2">
                              {selectedOrder.measurementUnit === "in"
                                ? "Inches"
                                : "Centimeters"}
                            </strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ===============================================

                      CUSTOM MEASUREMENTS

                  =============================================== */}

                  {selectedOrder.measurementType === "custom" && (
                    <div className="mt-8">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-aurora-500/15 text-aurora-600 dark:text-aurora-300">
                          <FaRulerCombined aria-hidden="true" />
                        </div>

                        <div>
                          <h3 className="font-display text-xl font-bold text-ink">
                            Body Measurements
                          </h3>

                          <p className="mt-1 text-xs text-ink-muted">
                            All customer measurements provided for this
                            tailoring order.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {getMeasurementFieldsForOrder(selectedOrder).map(
                          (field) => (
                            <MeasurementCard
                              key={field.name}
                              title={field.title}
                              value={selectedOrder.measurements?.[field.name]}
                              unit={selectedOrder.measurementUnit}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===============================================

                      NOTES

                  =============================================== */}

                  <div className="mt-8 rounded-2xl border border-warning/40 bg-warning/10 p-5">
                    <p className="text-xs font-semibold uppercase text-warning">
                      Customer Special Notes
                    </p>

                    <p className="mt-2 text-sm leading-7 text-ink-2">
                      {selectedOrder.notes || "No special notes provided."}
                    </p>
                  </div>

                  {selectedOrder.status === "Cancelled" &&
                    selectedOrder.cancelReason && (
                      <div className="mt-5 rounded-2xl border-2 border-danger/40 bg-danger/10 p-5">
                        <p className="text-xs font-semibold uppercase text-danger">
                          Cancellation Reason
                        </p>

                        <p className="mt-3 text-sm leading-7 text-ink-2">
                          {selectedOrder.cancelReason}
                        </p>

                        {selectedOrder.cancelledAt && (
                          <p className="mt-3 text-xs text-danger">
                            Cancelled: {formatDate(selectedOrder.cancelledAt)}
                          </p>
                        )}
                      </div>
                    )}

                  {/* ===============================================

                      ADMIN MANAGEMENT

                  =============================================== */}

                  <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-5 md:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[2px] text-aurora-600 dark:text-aurora-300">
                      Admin Controls
                    </p>

                    <h3 className="mt-2 font-display text-xl font-bold text-ink">
                      Price & Order Management
                    </h3>

                    <div className="mt-6 grid gap-5 lg:grid-cols-3">
                      {/* ================= PRICE ================= */}

                      <div>
                        <label
                          className="label"
                          htmlFor={`quoted-price-${selectedOrder.customOrderId}`}
                        >
                          Quoted Price
                        </label>

                        <div className="mt-2 flex overflow-hidden rounded-md border border-line bg-surface focus-within:border-aurora-500 focus-within:ring-4 focus-within:ring-aurora-500/15">
                          <span className="flex items-center border-r border-line px-4 font-semibold text-ink-muted">
                            LKR
                          </span>

                          <input
                            id={`quoted-price-${selectedOrder.customOrderId}`}
                            type="number"
                            min="1"
                            value={priceInputs[selectedOrder.customOrderId] ?? ""}
                            onChange={(e) =>
                              setPriceInputs((old) => ({
                                ...old,

                                [selectedOrder.customOrderId]: e.target.value,
                              }))
                            }
                            placeholder="Enter price"
                            className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-ink outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={updatingOrderId === selectedOrder.customOrderId}
                          onClick={() => updatePrice(selectedOrder.customOrderId)}
                          aria-label={`Save quoted price for order ${selectedOrder.customOrderId}`}
                          className="btn btn-primary mt-3 w-full"
                        >
                          Save Quoted Price
                        </button>
                      </div>

                      {/* ================= ORDER STATUS ================= */}

                      <div>
                        <label
                          className="label"
                          htmlFor={`tailoring-status-${selectedOrder.customOrderId}`}
                        >
                          Tailoring Status
                        </label>

                        <select
                          id={`tailoring-status-${selectedOrder.customOrderId}`}
                          value={selectedOrder.status}
                          disabled={updatingOrderId === selectedOrder.customOrderId}
                          onChange={(e) =>
                            handleStatusChange(selectedOrder, e.target.value)
                          }
                          className="field font-semibold"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <span
                          className={`${getStatusStyle(selectedOrder.status)} mt-3`}
                        >
                          {getStatusIcon(selectedOrder.status)}
                          {selectedOrder.status}
                        </span>
                      </div>

                      {/* ================= PAYMENT ================= */}

                      <div>
                        <label
                          className="label"
                          htmlFor={`payment-status-${selectedOrder.customOrderId}`}
                        >
                          Payment Status
                        </label>

                        <select
                          id={`payment-status-${selectedOrder.customOrderId}`}
                          value={selectedOrder.paymentStatus}
                          disabled={updatingOrderId === selectedOrder.customOrderId}
                          onChange={(e) =>
                            updatePaymentStatus(
                              selectedOrder.customOrderId,

                              e.target.value,
                            )
                          }
                          className="field font-semibold"
                        >
                          {paymentStatuses.map((paymentStatus) => (
                            <option key={paymentStatus} value={paymentStatus}>
                              {paymentStatus}
                            </option>
                          ))}
                        </select>

                        <span
                          className={`${getPaymentStyle(selectedOrder.paymentStatus)} mt-3`}
                        >
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ===============================================

                      SUMMARY

                  =============================================== */}

                  <div className="mt-6 rounded-2xl bg-ink p-6 text-ink-invert">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-ink-invert/70">
                          Current Quoted Price
                        </p>

                        <p className="mt-1 font-display text-3xl font-bold">
                          {selectedOrder.price
                            ? `LKR ${selectedOrder.price.toLocaleString()}`
                            : "Price Pending"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={getStatusStyle(selectedOrder.status)}>
                          {getStatusIcon(selectedOrder.status)}
                          {selectedOrder.status}
                        </span>

                        <span
                          className={getPaymentStyle(selectedOrder.paymentStatus)}
                        >
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================

              CANCEL ORDER MODAL

          ================================================= */}

          {cancellingOrder && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Cancel custom order"
                className="surface-elevated pop-in w-full max-w-lg p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[2px] text-danger">
                  Cancel Custom Order
                </p>

                <h2 className="mt-2 font-display text-2xl font-bold text-ink">
                  Cancellation Reason
                </h2>

                <p className="mt-2 text-sm text-ink-muted">
                  {cancellingOrder.customOrderId} — {cancellingOrder.fullName}
                </p>

                <div className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-4">
                  <p className="text-sm font-semibold text-danger">
                    මේ reason එක customerගේ My Orders page එකේ පෙන්වනවා.
                  </p>
                </div>

                <label className="label mt-4" htmlFor="cancel-reason">
                  Why is this order being cancelled?
                </label>

                <textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows="5"
                  placeholder="Why is this order being cancelled?"
                  className="field resize-none"
                />

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCancellingOrder(null);
                      setCancelReason("");
                    }}
                    className="btn btn-secondary"
                  >
                    Go Back
                  </button>

                  <button
                    type="button"
                    disabled={updatingOrderId === cancellingOrder.customOrderId}
                    onClick={async () => {
                      if (cancelReason.trim() === "") {
                        toast.error("Cancellation reason is required");
                        return;
                      }

                      const success = await updateOrderStatus(
                        cancellingOrder.customOrderId,
                        "Cancelled",
                        cancelReason.trim(),
                      );

                      if (success) {
                        setCancellingOrder(null);
                        setCancelReason("");
                      }
                    }}
                    className="btn btn-danger"
                  >
                    {updatingOrderId === cancellingOrder.customOrderId
                      ? "Cancelling..."
                      : "Confirm Cancellation"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

// =====================================================

// STAT CARD

// =====================================================

function StatCard({ icon, title, value }) {
  return (
    <TiltCard className="card-3d card-glow p-5">
      <div className="flex size-11 items-center justify-center rounded-xl bg-aurora-500/15 text-aurora-600 dark:text-aurora-300">
        {icon}
      </div>

      <p className="mt-4 text-xs uppercase tracking-wide text-ink-muted">
        {title}
      </p>

      <p className="mt-1 font-display text-3xl font-bold text-ink">
        <CountUp value={value} />
      </p>
    </TiltCard>
  );
}

// =====================================================

// INFO CARD

// =====================================================

function InfoCard({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5">
      <div className="flex items-center gap-2 text-aurora-600 dark:text-aurora-300">
        {icon}

        <p className="text-xs font-semibold uppercase">{title}</p>
      </div>

      <p className="mt-3 break-words font-semibold text-ink">{value || "-"}</p>
    </div>
  );
}

// =====================================================

// MEASUREMENT CARD

// =====================================================

function MeasurementCard({ title, value, unit }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-4">
      <p className="text-xs font-semibold text-ink-muted">{title}</p>

      <p className="mt-2 font-display text-xl font-bold text-ink">
        {value ?? "-"}

        {value != null && (
          <span className="ml-1 text-xs text-aurora-600 dark:text-aurora-300">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
