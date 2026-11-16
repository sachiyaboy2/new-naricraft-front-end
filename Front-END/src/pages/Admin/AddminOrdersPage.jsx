import { API_URL } from "../../utils/config.js";
import axios from "axios";

import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSyncAlt,
  FaTimes,
  FaTruck,
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // =====================================================
  // STATUSES
  // =====================================================

  const statuses = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  // =====================================================
  // LOAD ORDERS
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
        API_URL + "/api/orders",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!Array.isArray(res.data)) throw new Error("The orders response was not a list");
      setOrders(res.data.filter(order => order && typeof order === "object").map(order => ({ ...order, products: Array.isArray(order.products) ? order.products : [] })));

      setLoadError("");
    } catch (err) {
      console.log(err);

      const message = err.response?.data?.message || "Failed to load orders";

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
  // CLOSE MODAL ON ESCAPE
  // =====================================================

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      setSelectedOrder(null);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  async function collectBalance(order) {
    if (!window.confirm(`Confirm you have received LKR ${Number(order.remainingAmount).toLocaleString()} from the customer. This records collection; it does not charge a card.`)) return;
    setUpdatingOrderId(order.orderId);
    try {
      const response = await axios.put(API_URL + "/api/orders/balance/" + encodeURIComponent(order.orderId), {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(current => current.map(item => item.orderId === order.orderId ? response.data.order : item));
      setSelectedOrder(response.data.order);
      toast.success("Balance recorded as collected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not record balance");
    } finally { setUpdatingOrderId(null); }
  }

  async function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("You need to login first");

      return;
    }

    try {
      setUpdatingOrderId(orderId);

      await axios.put(
        API_URL + "/api/orders/status/" + orderId,

        {
          status: newStatus,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ==========================================
      // UPDATE PAGE WITHOUT RELOADING
      // ==========================================

      setOrders(
        orders.map((order) => {
          if (order.orderId === orderId) {
            return {
              ...order,
              status: newStatus,
            };
          }

          return order;
        }),
      );

      // Modal එක open නම් ඒකත් update කරන්න
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
        });
      }

      toast.success("Order status updated successfully");
    } catch (err) {
      console.log(err);

      toast.error(
        err.response?.data?.message || "Failed to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // =====================================================
  // STATUS BADGE
  // =====================================================

  function getStatusStyle(status) {
    if (status === "Pending") {
      return "badge badge-warning";
    }

    if (status === "Confirmed") {
      return "badge badge-info";
    }

    if (status === "Processing") {
      return "badge badge-accent";
    }

    if (status === "Shipped") {
      return "badge badge-accent";
    }

    if (status === "Delivered") {
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

    if (status === "Confirmed") {
      return <FaCheckCircle aria-hidden="true" />;
    }

    if (status === "Processing") {
      return <FaBoxOpen aria-hidden="true" />;
    }

    if (status === "Shipped") {
      return <FaTruck aria-hidden="true" />;
    }

    if (status === "Delivered") {
      return <FaCheckCircle aria-hidden="true" />;
    }

    if (status === "Cancelled") {
      return <FaTimes aria-hidden="true" />;
    }

    return null;
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
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter((order) => order.status === "Pending").length;

    const inTransit = orders.filter(
      (order) => order.status === "Processing" || order.status === "Shipped",
    ).length;

    const revenue = orders.reduce(
      (totalPrice, order) => totalPrice + (Number(order.totalPrice) || 0),
      0,
    );

    return { total, pending, inTransit, revenue };
  }, [orders]);

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
                  Customer Orders
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                  View and manage customer orders.
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
                icon={<FaBoxOpen />}
                title="Total Orders"
                value={statistics.total}
              />

              <StatCard
                icon={<FaClock />}
                title="Pending"
                value={statistics.pending}
              />

              <StatCard
                icon={<FaTruck />}
                title="In Transit"
                value={statistics.inTransit}
              />

              <StatCard
                icon={<FaCheckCircle />}
                title="Order Value"
                value={statistics.revenue}
                money
              />
            </div>
          </Reveal>

          {/* =================================================
              ORDERS TABLE
          ================================================= */}

          <Reveal delay={180}>
            <div className="table-shell">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                <p className="font-display text-sm font-semibold text-ink">
                  All Orders
                </p>

                <p className="text-xs text-ink-muted">
                  Showing{" "}
                  <span className="font-semibold text-ink-2">{orders.length}</span>{" "}
                  orders
                </p>
              </div>

              {isLoading ? (
                <TableSkeleton rows={6} columns={7} />
              ) : loadError ? (
                <ErrorState
                  title="Could not load orders"
                  message={loadError}
                  onRetry={loadOrders}
                  className="border-0 shadow-none"
                />
              ) : orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Customer orders will appear here."
                  action={
                    <button
                      type="button"
                      onClick={loadOrders}
                      className="btn btn-secondary"
                    >
                      <FaSyncAlt aria-hidden="true" />
                      Refresh Orders
                    </button>
                  }
                  className="border-0 shadow-none"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="nari-table">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Order ID
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Customer
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Products
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Total
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Status
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Date
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Details
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          {/* ORDER ID */}

                          <td data-label="Order ID">
                            <span className="font-mono text-sm font-semibold text-aurora-600 dark:text-aurora-300">
                              {order.orderId}
                            </span>
                          </td>

                          {/* CUSTOMER */}

                          <td data-label="Customer">
                            <p className="font-semibold text-ink">
                              {order.fullName}
                            </p>

                            <p className="mt-1 text-xs text-ink-muted">
                              {order.phone}
                            </p>
                          </td>

                    {/* PRODUCTS */}

                          <td data-label="Products">
                            <p className="font-semibold text-ink">
                              {order.products?.length || 0} item(s)
                            </p>

                            <p className="mt-1 text-xs text-ink-muted">
                              Qty:{" "}
                              {order.products?.reduce(
                                (total, product) => total + product.quantity,
                                0,
                              ) || 0}
                            </p>
                          </td>

                          {/* TOTAL */}

                          <td data-label="Total">
                            <span className="whitespace-nowrap font-display font-bold text-ink">
                              LKR {order.totalPrice?.toLocaleString()}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td data-label="Status">
                            <div className="flex min-w-[160px] flex-col gap-2">
                              <span className={`${getStatusStyle(order.status)} w-fit`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>

                              <label
                                className="sr-only"
                                htmlFor={`order-status-${order.orderId}`}
                              >
                                Change status for order {order.orderId}
                              </label>

                              <select
                                id={`order-status-${order.orderId}`}
                                value={order.status}
                                disabled={updatingOrderId === order.orderId}
                                onChange={(e) =>
                                  updateOrderStatus(order.orderId, e.target.value)
                                }
                                className="field py-2 text-xs font-semibold"
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>

                              {updatingOrderId === order.orderId && (
                                <p className="text-[10px] font-semibold text-aurora-600 dark:text-aurora-300">
                                  Updating...
                                </p>
                              )}
                            </div>
                          </td>

                          {/* DATE */}

                          <td data-label="Date">
                            <span className="text-xs text-ink-muted">
                              {formatDate(order.date)}
                            </span>
                          </td>

                          {/* VIEW */}

                          <td data-label="Details">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                aria-label={`View details for order ${order.orderId}`}
                                className="btn btn-ghost h-10 w-10 rounded-xl border border-line p-0"
                              >
                                <FaEye aria-hidden="true" />
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
              DETAILS MODAL
          ================================================= */}

          {selectedOrder && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`Details for order ${selectedOrder.orderId}`}
                className="surface-elevated pop-in max-h-[90vh] w-full max-w-3xl overflow-y-auto"
              >
                {/* MODAL HEADER */}

                <div className="flex items-start justify-between gap-4 rounded-t-lg bg-ink p-6 text-ink-invert">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[2px] text-ink-invert/70">
                      ORDER DETAILS
                    </p>

                    <h2 className="mt-1 font-display text-2xl font-bold">
                      {selectedOrder.orderId}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    aria-label="Close order details"
                    className="btn btn-ghost h-10 w-10 shrink-0 rounded-full p-0 text-ink-invert hover:bg-ink-invert/15 hover:text-ink-invert"
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  {/* CUSTOMER */}

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard
                      icon={<FaUser />}
                      title="Customer"
                      value={selectedOrder.fullName}
                    />

                    <InfoCard
                      icon={<FaPhoneAlt />}
                      title="Phone"
                      value={selectedOrder.phone}
                    />
                  </div>

                  {/* ADDRESS */}

                  <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-5">
                    <div className="flex items-center gap-2 text-aurora-600 dark:text-aurora-300">
                      <FaMapMarkerAlt aria-hidden="true" />

                      <p className="text-xs font-semibold uppercase">
                        Delivery Address
                      </p>
                    </div>

                    <p className="mt-3 font-semibold text-ink">
                      {selectedOrder.address}
                    </p>

                    <p className="mt-1 text-sm text-ink-muted">
                      {selectedOrder.city}, {selectedOrder.district}
                    </p>
                  </div>

                  <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-5">
                    <h3 className="font-semibold">Payment: {selectedOrder.paymentStatus}</h3>
                    <p className="mt-2 text-sm">Paid: LKR {Number(selectedOrder.paidAmount || 0).toLocaleString()} / Balance: LKR {Number(selectedOrder.remainingAmount || 0).toLocaleString()}</p>
                    {selectedOrder.status !== "Cancelled" && selectedOrder.paymentStatus === "Partially Paid" && selectedOrder.balanceStatus === "Pending" && (
                      <button type="button" className="btn btn-primary mt-3" disabled={updatingOrderId === selectedOrder.orderId} onClick={() => collectBalance(selectedOrder)}>Record received balance</button>
                    )}
                  </div>

                  {/* PRODUCTS */}

                  <div className="mt-7">
                    <h3 className="font-display text-lg font-bold text-ink">
                      Ordered Products
                    </h3>

                    <div className="mt-4 space-y-3">
                      {selectedOrder.products?.map((product, index) => (
                        <div
                          key={product._id || product.productId || index}
                          className="flex items-center gap-4 rounded-2xl border border-line bg-surface-2 p-4"
                        >
                          <img
                            src={product.image || "/placeholder.png"}
                            alt={product.name || "Ordered product"}
                            className="size-16 rounded-xl bg-surface object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-ink">
                              {product.name}
                            </p>

                            <p className="mt-1 font-mono text-xs text-ink-muted">
                              {product.productId}
                            </p>

                            <p className="mt-1 text-xs text-ink-muted">
                              Qty: {product.quantity}
                            </p>
                          </div>

                          <p className="whitespace-nowrap font-display font-bold text-ink">
                            LKR{" "}
                            {(product.price * product.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NOTES */}

                  {selectedOrder.notes && (
                    <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-5">
                      <p className="text-xs font-semibold uppercase text-warning">
                        Customer Notes
                      </p>

                      <p className="mt-2 text-sm leading-6 text-ink-2">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}

                  {/* STATUS CHANGE IN MODAL */}

                  <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-5">
                    <label
                      className="label"
                      htmlFor={`modal-order-status-${selectedOrder.orderId}`}
                    >
                      Order Status
                    </label>

                    <select
                      id={`modal-order-status-${selectedOrder.orderId}`}
                      value={selectedOrder.status}
                      disabled={updatingOrderId === selectedOrder.orderId}
                      onChange={(e) =>
                        updateOrderStatus(selectedOrder.orderId, e.target.value)
                      }
                      className="field font-semibold"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TOTAL */}

                  <div className="mt-7 rounded-2xl bg-ink p-5 text-ink-invert">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-ink-invert/70">Order Total</p>

                        <p className="mt-1 font-display text-2xl font-bold">
                          LKR {selectedOrder.totalPrice?.toLocaleString()}
                        </p>
                      </div>

                      <span className={getStatusStyle(selectedOrder.status)}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-ink-invert/70">
                      {formatDate(selectedOrder.date)}
                    </p>
                  </div>
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

function StatCard({ icon, title, value, money = false }) {
  return (
    <TiltCard className="card-3d card-glow p-5">
      <div className="flex size-11 items-center justify-center rounded-xl bg-aurora-500/15 text-aurora-600 dark:text-aurora-300">
        {icon}
      </div>

      <p className="mt-4 text-xs uppercase tracking-wide text-ink-muted">
        {title}
      </p>

      <p className="mt-1 font-display text-3xl font-bold text-ink">
        <CountUp value={value} decimals={money ? 2 : 0} prefix={money ? "LKR " : ""} />
      </p>
    </TiltCard>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard(props) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5">
      <div className="flex items-center gap-2 text-aurora-600 dark:text-aurora-300">
        {props.icon}

        <p className="text-xs font-semibold uppercase">{props.title}</p>
      </div>

      <p className="mt-3 font-semibold text-ink">{props.value || "-"}</p>
    </div>
  );
}
