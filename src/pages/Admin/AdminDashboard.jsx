import { API_URL } from "../../utils/config.js";
import axios from "axios";

import { useEffect, useMemo, useState } from "react";

import { toast } from "react-hot-toast";

import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaCoins,
  FaExclamationTriangle,
  FaMagic,
  FaShoppingBag,
  FaSyncAlt,
  FaTshirt,
  FaUserSlash,
  FaUsers,
} from "react-icons/fa";

import { EmptyState, ErrorState, Skeleton } from "../../components/StateBlocks";

import { AuroraBackdrop } from "../../components/brand/AuroraBackdrop";

import { CountUp } from "../../components/brand/CountUp";

import { Reveal } from "../../components/brand/useReveal";

import { TiltCard } from "../../components/brand/TiltCard";

export default function AdminDashboard() {
  // =====================================================
  // STATE
  // =====================================================

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState(null);

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Admin login required");

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setLoadError(null);

      const response = await axios.get(
        API_URL + "/api/admin/dashboard",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setData(response.data);
    } catch (err) {
      console.log("Dashboard Load Error:", err);

      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load dashboard",
      );

      setLoadError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "We could not reach the dashboard service. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // MONEY
  // =====================================================

  function formatMoney(value) {
    return Number(value || 0).toLocaleString("en-LK");
  }

  // =====================================================
  // DATE
  // =====================================================

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  }

  // =====================================================
  // MAX MONTH REVENUE
  // =====================================================

  const maximumMonthlyRevenue = useMemo(() => {
    if (!data?.monthlyRevenue?.length) {
      return 1;
    }

    return Math.max(
      ...data.monthlyRevenue.map((month) => Number(month.revenue || 0)),

      1,
    );
  }, [data]);

  // =====================================================
  // MAX STATUS
  // =====================================================

  const maximumStatusCount = useMemo(() => {
    if (!data?.orderStatus?.length) {
      return 1;
    }

    return Math.max(
      ...data.orderStatus.map((status) => Number(status.count || 0)),

      1,
    );
  }, [data]);

  const summary = data?.summary || {};

  return (
    <div className="relative isolate w-full min-h-full overflow-hidden bg-canvas p-4 md:p-7">
      {/* =================================================
          HEADER STRIP
      ================================================= */}

      <div className="relative isolate overflow-hidden">
        <AuroraBackdrop />

        <div className="relative z-10 mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-aurora-600 dark:text-aurora-300">
              NariCraft Admin
            </p>

            <h1 className="mt-2 font-display text-3xl font-extrabold text-ink md:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-ink-2">
              Store performance, orders, customers සහ stock overview.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="btn btn-secondary self-start lg:self-auto"
          >
            <FaSyncAlt aria-hidden="true" />
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* =================================================
          BODY
      ================================================= */}

      {loading ? (
        <DashboardSkeleton />
      ) : loadError ? (
        <ErrorState
          title="Dashboard unavailable"
          message={loadError}
          onRetry={loadDashboard}
        />
      ) : !data ? (
        <EmptyState
          title="No dashboard data yet"
          description="Once the store records its first order, the live numbers will appear here."
          action={
            <button
              type="button"
              onClick={loadDashboard}
              className="btn btn-primary"
            >
              <FaSyncAlt aria-hidden="true" />
              Refresh Dashboard
            </button>
          }
        />
      ) : (
        <>
          {/* =================================================
              MAIN STATISTICS
          ================================================= */}

          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile
                icon={<FaCoins />}
                title="Total Revenue"
                value={summary.totalRevenue || 0}
                prefix="LKR "
                description={`Products LKR ${formatMoney(
                  summary.productRevenue,
                )} • Custom LKR ${formatMoney(summary.customRevenue)}`}
                featured
              />

              <StatTile
                icon={<FaShoppingBag />}
                title="Product Orders"
                value={summary.productOrders || 0}
                description="Normal store orders"
              />

              <StatTile
                icon={<FaMagic />}
                title="Custom Orders"
                value={summary.customOrders || 0}
                description="Custom tailoring orders"
              />

              <StatTile
                icon={<FaUsers />}
                title="Customers"
                value={summary.customers || 0}
                description="Registered customer accounts"
              />
            </div>
          </Reveal>

          {/* =================================================
              SECONDARY STATISTICS
          ================================================= */}

          <Reveal delay={100}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                icon={<FaClock />}
                title="Active Orders"
                value={summary.activeOrders || 0}
                description="Still being processed"
                compact
              />

              <StatTile
                icon={<FaCheckCircle />}
                title="Completed"
                value={summary.completedOrders || 0}
                description="Delivered to the customer"
                compact
              />

              <StatTile
                icon={<FaExclamationTriangle />}
                title="Low Stock"
                value={summary.lowStockCount || 0}
                description="Products running low"
                compact
              />

              <StatTile
                icon={<FaUserSlash />}
                title="Blocked Users"
                value={summary.blockedUsers || 0}
                description="Accounts on hold"
                compact
              />
            </div>
          </Reveal>

          {/* =================================================
              REVENUE CHART + ORDER STATUS
          ================================================= */}

          <div className="mt-7 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            {/* ===============================================
                REVENUE CHART
            =============================================== */}

            <Reveal delay={160}>
              <section className="surface-elevated h-full rounded-2xl p-5 md:p-6">
                <SectionHeader
                  smallTitle="SALES OVERVIEW"
                  title="Revenue • Last 6 Months"
                />

                <div className="mt-8 flex h-[290px] items-end gap-3 border-b border-line sm:gap-5">
                  {data.monthlyRevenue?.map((month) => {
                    const percentage = Math.max(
                      (Number(month.revenue || 0) / maximumMonthlyRevenue) * 100,

                      month.revenue > 0 ? 5 : 1,
                    );

                    return (
                      <div
                        key={month.key}
                        className="group flex h-full flex-1 flex-col items-center justify-end"
                      >
                        {/* TOOLTIP */}

                        <div className="mb-2 text-center opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="whitespace-nowrap font-mono text-[10px] font-bold text-aurora-600 dark:text-aurora-300">
                            LKR {formatMoney(month.revenue)}
                          </p>
                        </div>

                        {/* BAR */}

                        <div className="relative flex h-[220px] w-full max-w-[58px] items-end">
                          <div
                            style={{
                              height: `${percentage}%`,
                            }}
                            className="w-full min-h-[3px] rounded-t-xl bg-linear-to-t from-aurora-700 via-aurora-500 to-cyan-glow transition-all duration-500 group-hover:brightness-110"
                          />
                        </div>

                        {/* MONTH */}

                        <p className="py-3 font-mono text-xs font-bold text-ink-muted">
                          {month.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* SPLIT */}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <RevenueMini
                    title="Product Revenue"
                    value={summary.productRevenue}
                  />

                  <RevenueMini
                    title="Custom Revenue"
                    value={summary.customRevenue}
                  />
                </div>
              </section>
            </Reveal>

            {/* ===============================================
                ORDER STATUS
            =============================================== */}

            <Reveal delay={220}>
              <section className="surface-elevated h-full rounded-2xl p-5 md:p-6">
                <SectionHeader smallTitle="ORDER FLOW" title="Order Status" />

                <div className="mt-8 space-y-5">
                  {data.orderStatus?.map((item) => {
                    const width =
                      (Number(item.count || 0) / maximumStatusCount) * 100;

                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-ink">
                            {item.label}
                          </p>

                          <span className="badge badge-info min-w-8 justify-center font-mono">
                            {item.count}
                          </span>
                        </div>

                        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                          <div
                            style={{
                              width: `${width}%`,
                            }}
                            className="h-full rounded-full bg-linear-to-r from-aurora-500 to-cyan-glow transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </Reveal>
          </div>

          {/* =================================================
              RECENT ORDERS
          ================================================= */}

          <Reveal delay={260}>
            <section className="surface-elevated mt-7 overflow-hidden rounded-2xl">
              <div className="p-5 md:p-6">
                <SectionHeader smallTitle="LATEST ACTIVITY" title="Recent Orders" />
              </div>

              {data.recentOrders?.length === 0 ? (
                <div className="px-5 pb-10 md:px-6">
                  <EmptyState
                    title="No orders yet"
                    description="New store and custom orders will show up here."
                    className="!border-none !bg-transparent !shadow-none"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="nari-table">
                    <caption className="sr-only">
                      The most recent NariCraft orders
                    </caption>

                    <thead>
                      <tr>
                        <th scope="col">Order</th>

                        <th scope="col">Customer</th>

                        <th scope="col">Type</th>

                        <th scope="col">Amount</th>

                        <th scope="col">Status</th>

                        <th scope="col">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.recentOrders.map((order) => (
                        <tr key={`${order.type}-${order._id}`}>
                          <td
                            data-label="Order"
                            className="font-mono text-xs font-bold text-aurora-600 dark:text-aurora-300"
                          >
                            {order.id}
                          </td>

                          <td data-label="Customer">
                            <p className="font-bold text-ink">{order.customer}</p>

                            <p className="mt-1 text-xs text-ink-muted">
                              {order.phone || "No phone"}
                            </p>
                          </td>

                          <td data-label="Type">
                            <OrderTypeBadge type={order.type} />
                          </td>

                          <td
                            data-label="Amount"
                            className="font-display font-bold text-ink"
                          >
                            {order.amount > 0
                              ? `LKR ${formatMoney(order.amount)}`
                              : "Pending"}
                          </td>

                          <td data-label="Status">
                            <StatusBadge status={order.status} />
                          </td>

                          <td data-label="Date" className="text-xs text-ink-muted">
                            {formatDate(order.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </Reveal>

          {/* =================================================
              LOW STOCK
          ================================================= */}

          <Reveal delay={300}>
            <section className="surface-elevated mt-7 p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SectionHeader
                  smallTitle="INVENTORY"
                  title="Low Stock Products"
                />

                <div className="flex gap-2">
                  <InventoryBadge title="Low" value={summary.lowStockCount || 0} />

                  <InventoryBadge
                    title="Out"
                    value={summary.outOfStockCount || 0}
                    danger
                  />
                </div>
              </div>

              {data.lowStockProducts?.length === 0 ? (
                <div className="py-12 text-center">
                  <FaCheckCircle
                    aria-hidden="true"
                    className="mx-auto text-4xl text-success"
                  />

                  <p className="mt-4 font-display text-lg font-bold text-ink">
                    Stock levels look good
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {data.lowStockProducts.map((product) => (
                    <div
                      key={product._id}
                      className="overflow-hidden rounded-xl border border-line bg-surface-2"
                    >
                      <div className="h-[130px] bg-surface-2">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name || "Low stock product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-aurora-500">
                            <FaTshirt size={30} aria-hidden="true" />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="truncate font-bold text-ink">{product.name}</p>

                        <p className="mt-1 font-mono text-xs text-ink-muted">
                          {product.productId}
                        </p>

                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-ink-muted">
                              Remaining
                            </p>

                            <p className="font-display text-2xl font-extrabold text-warning">
                              {product.stock}
                            </p>
                          </div>

                          <FaBoxOpen
                            aria-hidden="true"
                            className="text-xl text-aurora-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        </>
      )}
    </div>
  );
}

// =====================================================
// STAT TILE (TILT + COUNT UP)
// =====================================================

function StatTile({
  icon,
  title,
  value,
  prefix = "",
  description,
  featured = false,
  compact = false,
}) {
  return (
    <TiltCard
      max={6}
      className={`card-3d card-glow h-full p-5 ${
        featured ? "shadow-[var(--shadow-glow)]" : ""
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-xl bg-aurora-500/12 text-aurora-600 dark:text-aurora-300 ${
          compact ? "size-10" : "size-12"
        }`}
      >
        {icon}
      </span>

      <p className="mt-5 text-xs font-bold text-ink-muted">{title}</p>

      <p
        className={`mt-1 font-display font-extrabold text-ink ${
          compact ? "text-2xl" : "text-2xl xl:text-3xl"
        }`}
      >
        <CountUp value={value} prefix={prefix} />
      </p>

      {description && (
        <p className="mt-3 text-[11px] leading-5 text-ink-muted">{description}</p>
      )}
    </TiltCard>
  );
}

// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({ smallTitle, title }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-aurora-600 dark:text-aurora-300">
        {smallTitle}
      </p>

      <h2 className="mt-1 font-display text-xl font-bold text-ink">{title}</h2>
    </div>
  );
}

// =====================================================
// REVENUE MINI
// =====================================================

function RevenueMini({ title, value }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-4">
      <p className="text-xs text-ink-muted">{title}</p>

      <p className="mt-1 font-display text-lg font-bold text-ink">
        LKR {Number(value || 0).toLocaleString("en-LK")}
      </p>
    </div>
  );
}

// =====================================================
// ORDER TYPE
// =====================================================

function OrderTypeBadge({ type }) {
  const custom = type === "Custom";

  return (
    <span className={`badge ${custom ? "badge-accent" : "badge-info"}`}>
      {custom ? (
        <FaMagic aria-hidden="true" />
      ) : (
        <FaShoppingBag aria-hidden="true" />
      )}

      {type}
    </span>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }) {
  let classes = "badge";

  if (status === "Pending") {
    classes = "badge badge-warning";
  }

  if (status === "Confirmed" || status === "Accepted") {
    classes = "badge badge-info";
  }

  if (
    status === "Processing" ||
    status === "Reviewed" ||
    status === "In Progress"
  ) {
    classes = "badge badge-accent";
  }

  if (status === "Shipped" || status === "Ready") {
    classes = "badge badge-accent";
  }

  if (status === "Delivered" || status === "Completed") {
    classes = "badge badge-success";
  }

  if (status === "Cancelled") {
    classes = "badge badge-danger";
  }

  return <span className={classes}>{status}</span>;
}

// =====================================================
// INVENTORY BADGE
// =====================================================

function InventoryBadge({ title, value, danger = false }) {
  return (
    <div
      className={`rounded-xl border px-4 py-2 text-center ${
        danger
          ? "border-danger/40 bg-danger/5"
          : "border-warning/40 bg-warning/5"
      }`}
    >
      <p
        className={`text-[9px] font-bold uppercase ${
          danger ? "text-danger" : "text-warning"
        }`}
      >
        {title}
      </p>

      <p
        className={`font-display text-lg font-extrabold ${
          danger ? "text-danger" : "text-warning"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// =====================================================
// LOADING SKELETON
// =====================================================

function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Skeleton className="h-[420px] w-full rounded-xl" />

        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>

      <Skeleton className="mt-7 h-72 w-full rounded-xl" />
    </div>
  );
}
