"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axiosInstance from "@/config/axiosInstance";
import moment from "moment";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ─── helpers ──────────────────────────────────────────────────────────────────
const compact = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};
const fmtPKR = (n) => `Rs. ${(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtD = (d) => d ? moment(d).format("DD MMM YYYY") : "—";
const daysLeft = (d) => Math.max(0, moment(d).diff(moment(), "days"));
const fmtRel = (d) => d ? moment(d).fromNow() : "—";

// ─── skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ h = "h-4", w = "w-full", r = "rounded-lg", extra = "" }) => (
  <div className={`animate-pulse bg-slate-100 ${h} ${w} ${r} ${extra}`} />
);

// ─── custom recharts tooltip ───────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2.5 text-xs">
      <p className="font-bold text-slate-500 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — SALES PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════
function SalesPerformance({ data, loading }) {
  const statCards = [
    {
      key: "today",
      label: "Today's Revenue",
      value: fmtPKR(data?.today),
      icon: "solar:dollar-minimalistic-bold-duotone",
      gradient: "from-primary-500 to-primary-700",
      lightBg: "bg-primary-50",
      textClr: "text-primary-700",
      sub: "Delivered orders today",
      subIcon: "mdi:check-circle-outline",
    },
    {
      key: "last7",
      label: "Last 7 Days",
      value: fmtPKR(data?.last7Days),
      icon: "solar:chart-2-bold-duotone",
      gradient: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50",
      textClr: "text-emerald-700",
      trend: data?.growthPercent,
      sub: data?.growthPercent != null
        ? `${data.growthPercent >= 0 ? "+" : ""}${data.growthPercent}% vs prev week`
        : "vs previous week",
      subIcon: data?.growthPercent >= 0 ? "mdi:trending-up" : "mdi:trending-down",
    },
    {
      key: "last30",
      label: "Last 30 Days",
      value: fmtPKR(data?.last30Days),
      icon: "solar:calendar-bold-duotone",
      gradient: "from-violet-500 to-purple-700",
      lightBg: "bg-violet-50",
      textClr: "text-violet-700",
      sub: "Monthly total revenue",
      subIcon: "mdi:calendar-month-outline",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? [0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <Sk h="h-10" w="w-10" r="rounded-xl" />
                <Sk h="h-5" w="w-16" r="rounded-full" />
              </div>
              <Sk h="h-3" w="w-24" />
              <Sk h="h-8" w="w-36" />
              <Sk h="h-3" w="w-28" />
            </div>
          ))
          : statCards.map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-all duration-200">
              {/* accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${c.gradient} rounded-t-2xl`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.lightBg}`}>
                  <Icon icon={c.icon} className={`w-6 h-6 ${c.textClr}`} />
                </div>
                {c.trend != null && (
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${c.trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                    }`}>
                    <Icon icon={c.trend >= 0 ? "mdi:trending-up" : "mdi:trending-down"} className="w-3 h-3" />
                    {c.trend >= 0 ? "+" : ""}{c.trend}%
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{c.label}</p>
              <p className="text-[1.6rem] font-black text-slate-900 leading-tight">{c.value}</p>
              <div className={`flex items-center gap-1 mt-2 text-[11px] font-semibold ${c.textClr}`}>
                <Icon icon={c.subIcon} className="w-3.5 h-3.5" />
                {c.sub}
              </div>
            </div>
          ))
        }
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 pb-3">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-black text-slate-900">Revenue Trend</p>
            <p className="text-xs text-slate-400">Last 7 days delivered order earnings</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary-600 font-bold bg-primary-50 px-3 py-1.5 rounded-full">
            <Icon icon="mdi:calendar-week" className="w-3.5 h-3.5" />
            7 Days
          </div>
        </div>
        {loading ? (
          <Sk h="h-44" r="rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data?.chartData || []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={v => compact(v)} width={40} />
              <Tooltip content={<ChartTooltip prefix="Rs. " />} />
              <Area type="monotone" dataKey="revenue" name="Revenue"
                stroke="#6366f1" strokeWidth={2.5}
                fill="url(#revGrad)" dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#6366f1" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════
function Actions({ data, loading }) {
  const { locale } = useParams();

  const items = [
    {
      icon: "solar:box-bold-duotone",
      clr: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200",
      label: "Pending Orders",
      sub: "Need to be processed",
      count: data?.pendingOrders || 0,
      // ?status=pending → order page reads this and opens the Pending tab
      href: "/seller/order?status=pending",
      urgent: true,
    },
    {
      icon: "solar:document-bold-duotone",
      clr: "text-red-600", bg: "bg-red-50", ring: "ring-red-200",
      label: "Pending Documents",
      sub: "KYC / bank details",
      count: data?.pendingDocuments || 0,
      href: "/seller/profile/edit-profile",
      urgent: true,
    },
    {
      icon: "solar:chat-round-like-bold-duotone",
      clr: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-200",
      label: "Order Questions",
      sub: "Open customer order queries",
      count: data?.orderQuestions || 0,
      // ?type=order → enquiries page reads this and opens Order tab
      // ?filterStatus=open → shows only open/unanswered queries
      href: "/seller/enquiries?type=order&filterStatus=open",
    },
    {
      icon: "solar:tag-price-bold-duotone",
      clr: "text-violet-600", bg: "bg-violet-50", ring: "ring-violet-200",
      label: "Product Questions",
      sub: "Open customer product queries",
      count: data?.productQuestions || 0,
      // ?type=customer → general product/store enquiries tab
      href: "/seller/enquiries?type=customer&filterStatus=open",
    },
    {
      icon: "solar:refresh-circle-bold-duotone",
      clr: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-200",
      label: "Return Requests",
      sub: "Awaiting your response",
      count: data?.pendingRefunds || 0,
      // ?tab=requested → returns page reads this and opens "New Requests" tab
      href: "/seller/returns?tab=requested",
      urgent: true,
    },
  ];

  const total = items.reduce((s, i) => s + i.count, 0);
  const requiredActions = items.filter(item => item.count > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <Icon icon="solar:bolt-bold-duotone" className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Actions Required</p>
            <p className="text-xs text-slate-400">Tasks needing attention</p>
          </div>
        </div>
        {!loading && total > 0 && (
          <span className="text-xs font-black bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm shadow-red-200">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </div>

      {/* list */}
      <div className="flex-1">
        {loading
          ? [0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 animate-pulse">
              <Sk h="h-9" w="w-9" r="rounded-xl" />
              <Sk h="h-4" w="w-32" />
              <div className="ml-auto"><Sk h="h-6" w="w-8" r="rounded-full" /></div>
            </div>
          ))
          : requiredActions.length > 0 ? requiredActions.map((item, i) => (
            <Link href={`/${locale}${item.href}`} key={i}
              className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg} ${item.urgent ? `ring-1 ${item.ring}` : ""}`}>
                <Icon icon={item.icon} className={`w-4.5 h-4.5 ${item.clr}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">
                  {item.label}
                </p>
                {item.sub && (
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.sub}</p>
                )}
              </div>
              <span className={`text-xs font-black min-w-[28px] text-center px-2 py-1 rounded-full flex-shrink-0 ${item.urgent ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                {item.count}
              </span>
              <Icon icon="mdi:chevron-right" className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
            </Link>
          )) : (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                <Icon icon="solar:check-circle-bold-duotone" className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-900">You're all caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No pending actions required.</p>
            </div>
          )
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — ADVERTISING PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════
function AdvertisingPerformance({ data, loading }) {
  const metrics = [
    {
      label: "Impressions",
      value: compact(data?.last7Days?.impressions || 0),
      raw: data?.last7Days?.impressions || 0,
      icon: "solar:eye-bold-duotone",
      bg: "bg-blue-50", clr: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Clicks",
      value: compact(data?.last7Days?.clicks || 0),
      raw: data?.last7Days?.clicks || 0,
      icon: "solar:cursor-bold-duotone",
      bg: "bg-violet-50", clr: "text-violet-600",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      label: "Ad Spend",
      value: fmtPKR(data?.last7Days?.spend),
      icon: "solar:card-send-bold-duotone",
      bg: "bg-rose-50", clr: "text-rose-600",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      label: "CTR",
      value: `${data?.last7Days?.ctr || 0}%`,
      icon: "solar:chart-bold-duotone",
      bg: "bg-emerald-50", clr: "text-emerald-600",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
            <Icon icon="solar:megaphone-bold-duotone" className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Advertising Performance</p>
            <p className="text-xs text-slate-400">Last 7 days · {data?.activeCampaigns || 0} active campaigns</p>
          </div>
        </div>
        <Link href="/seller/ads"
          className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 px-3 py-1.5 bg-primary-50 rounded-xl transition-colors">
          Show All <Icon icon="mdi:arrow-right" className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* metric cards row */}
      <div className="grid grid-cols-4 divide-x divide-slate-50">
        {metrics.map((m, i) => (
          <div key={i} className="p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${m.bg}`}>
              <Icon icon={m.icon} className={`w-4 h-4 ${m.clr}`} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{m.label}</p>
            {loading
              ? <Sk h="h-6" w="w-16" />
              : <p className="text-lg font-black text-slate-900">{m.value}</p>
            }
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="px-5 pb-4 pt-2 border-t border-slate-50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Impressions vs Clicks (7 days)</p>
        {loading ? (
          <Sk h="h-36" r="rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data?.chartData || []} barCategoryGap="35%" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={v => compact(v)} width={32} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={7}
                wrapperStyle={{ fontSize: "10px", fontWeight: 700, paddingTop: "6px" }} />
              <Bar dataKey="impressions" name="Impressions" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="clicks" name="Clicks" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* all-time strip */}
      {!loading && (
        <div className="border-t border-slate-50 bg-slate-50/60 px-5 py-3 flex flex-wrap gap-x-8 gap-y-1.5">
          {[
            { l: "All-time Impressions", v: compact(data?.allTime?.impressions || 0) },
            { l: "All-time Clicks", v: compact(data?.allTime?.clicks || 0) },
            { l: "Total Ad Spend", v: fmtPKR(data?.allTime?.spend) },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{s.l}</p>
              <p className="text-sm font-black text-slate-900">{s.v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — INTEGRATION CALENDAR
// ═══════════════════════════════════════════════════════════════════════════════
function IntegrationCalendar({ data, loading }) {
  const [tab, setTab] = useState("payments");

  const tabs = [
    { id: "payments", label: "Upcoming Payments", icon: "solar:wallet-bold-duotone", cnt: data?.upcomingPayments?.length || 0 },
    { id: "deliveries", label: "Upcoming Deliveries", icon: "solar:delivery-bold-duotone", cnt: data?.upcomingDeliveries?.length || 0 },
    { id: "campaigns", label: "Campaigns Ending", icon: "solar:megaphone-bold-duotone", cnt: data?.campaignEnding?.length || 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-3">
        <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
          <Icon icon="solar:calendar-bold-duotone" className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">Integration Calendar</p>
          <p className="text-xs text-slate-400">Upcoming milestones · next 14 days</p>
        </div>
      </div>

      {/* tab bar */}
      <div className="flex border-b border-slate-50 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${tab === t.id
              ? "border-primary-600 text-primary-700 bg-primary-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
            <Icon icon={t.icon} className="w-4 h-4" />
            {t.label}
            {!loading && t.cnt > 0 && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>{t.cnt}</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 min-h-[200px]">
        {/* ── Payments ── */}
        {tab === "payments" && (
          loading ? <CalSkeleton /> :
            !data?.upcomingPayments?.length
              ? <CalEmpty icon="solar:wallet-bold-duotone" msg="No payments releasing in the next 14 days" />
              : (
                <ul className="space-y-2">
                  {data.upcomingPayments.map((e, i) => {
                    const dl = daysLeft(e.availableAt);
                    return (
                      <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 transition-colors">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Icon icon="solar:wallet-bold-duotone" className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 text-[8px] font-black bg-emerald-600 text-white px-1 py-0.5 rounded-full leading-none">
                            {dl}d
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {e.orderId?.orderNo || e.orderNo || "Order Earning"}
                          </p>
                          <p className="text-[11px] text-slate-400">Releases {fmtD(e.availableAt)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-emerald-700">{fmtPKR(e.amount)}</p>
                          <p className="text-[10px] text-slate-400">net earnings</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
        )}

        {/* ── Deliveries ── */}
        {tab === "deliveries" && (
          loading ? <CalSkeleton /> :
            !data?.upcomingDeliveries?.length
              ? <CalEmpty icon="solar:delivery-bold-duotone" msg="No orders currently in transit" />
              : (
                <ul className="space-y-2">
                  {data.upcomingDeliveries.map((o, i) => (
                    <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:delivery-bold-duotone" className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{o.orderNo || o.orderId}</p>
                        <p className="text-[11px] text-slate-400">
                          {o.shippingAddress?.city ? `Delivering to: ${o.shippingAddress.city}` : "In transit"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">Shipped</span>
                        <p className="text-[10px] text-slate-400 mt-1">{fmtRel(o.updatedAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )
        )}

        {/* ── Campaigns Ending ── */}
        {tab === "campaigns" && (
          loading ? <CalSkeleton /> :
            !data?.campaignEnding?.length
              ? <CalEmpty icon="solar:megaphone-bold-duotone" msg="No campaigns ending in the next 14 days" />
              : (
                <ul className="space-y-3">
                  {data.campaignEnding.map((c, i) => {
                    const pct = c.totalBudget > 0
                      ? Math.min(((c.spentBudget || 0) / c.totalBudget) * 100, 100)
                      : 0;
                    const dl = daysLeft(c.endDate);
                    return (
                      <li key={i} className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                              <Icon icon="solar:megaphone-bold-duotone" className="w-5 h-5 text-rose-600" />
                            </div>
                            {dl <= 3 && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                            <p className="text-[11px] text-slate-400">Ends {fmtD(c.endDate)} · {dl} days left</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-black text-slate-700">{fmtPKR(c.remainingBudget)}</p>
                            <p className="text-[10px] text-slate-400">remaining</p>
                          </div>
                        </div>
                        {/* budget bar */}
                        <div className="ml-13">
                          <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                            <span>Budget used</span>
                            <span className="font-bold">{pct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-400" : pct > 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
        )}
      </div>
    </div>
  );
}

function CalSkeleton() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2].map(i => (
        <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 animate-pulse">
          <Sk h="h-10" w="w-10" r="rounded-xl" />
          <div className="flex-1 space-y-2">
            <Sk h="h-4" w="w-32" />
            <Sk h="h-3" w="w-24" />
          </div>
          <Sk h="h-5" w="w-16" />
        </li>
      ))}
    </ul>
  );
}

function CalEmpty({ icon, msg }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
        <Icon icon={icon} className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-sm text-slate-400 text-center max-w-[200px]">{msg}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function SellerDashboardPage() {
  const { token, user } = useSelector(s => s.auth);
  const { locale } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data: res } = await axiosInstance.get("/seller/dashboard/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.success) setData(res.data);
    } catch (err) {
      console.error("Overview fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const totalActions = data?.actions?.total || 0;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ── Welcome Banner ── */}
      <div className="relative mx-4 mt-6 sm:mx-6 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-primary-900/20">
        {/* Dynamic Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary-400/30 to-transparent rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary-500/20 to-transparent rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4 mix-blend-screen pointer-events-none"></div>

        {/* Grid pattern overlay for texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest flex items-center gap-1.5">
                <Icon icon="solar:sun-fog-bold-duotone" className="w-3.5 h-3.5 text-amber-300" />
                {greeting}
              </span>
              <p className="text-primary-200 text-sm font-medium">
                {moment().format("dddd, DD MMMM YYYY")}
              </p>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">{user?.name ? user.name.split(" ")[0] : "Seller"}</span>!
            </h1>
            <p className="text-primary-200/80 text-sm font-medium max-w-lg">
              Here is what's happening with your store today. Keep up the great work!
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            {totalActions > 0 && (
              <div className="group flex items-center gap-2.5 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-md border border-rose-500/30 hover:border-rose-500/50 transition-all rounded-2xl px-5 py-3 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="text-rose-100 text-sm font-bold group-hover:text-white transition-colors">{totalActions} action{totalActions !== 1 ? "s" : ""} needed</span>
              </div>
            )}
            <button onClick={fetchOverview}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all rounded-2xl px-5 py-3 text-white text-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0">
              <Icon icon={loading ? "svg-spinners:180-ring" : "solar:refresh-circle-bold-duotone"} className={`w-5 h-5 ${loading ? '' : 'text-primary-200'}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>
      </div>



      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* quick nav footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { label: "My Orders", icon: "solar:bag-heart-bold-duotone", href: `/${locale}/seller/order`, bg: "bg-primary-50", clr: "text-primary-600" },
            { label: "My Products", icon: "solar:box-bold-duotone", href: `/${locale}/seller/products`, bg: "bg-emerald-50", clr: "text-emerald-600" },
            { label: "My Wallet", icon: "solar:wallet-money-bold-duotone", href: `/${locale}/seller/wallet`, bg: "bg-violet-50", clr: "text-violet-600" },
            { label: "My Ads", icon: "solar:megaphone-bold-duotone", href: `/${locale}/seller/ads`, bg: "bg-amber-50", clr: "text-amber-600" },
          ].map((q, i) => (
            <Link key={i} href={q.href}
              className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${q.bg} flex-shrink-0`}>
                <Icon icon={q.icon} className={`w-5 h-5 ${q.clr}`} />
              </div>
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{q.label}</span>
              <Icon icon="mdi:arrow-right" className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
            </Link>
          ))}
        </div>
        {/* 1 — Sales */}
        <SalesPerformance data={data?.sales} loading={loading} />

        {/* 2+3 — Actions + Advertising stacked on mobile, side-by-side on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <Actions data={data?.actions} loading={loading} />
          </div>
          <div className="lg:col-span-3">
            <AdvertisingPerformance data={data?.advertising} loading={loading} />
          </div>
        </div>

        {/* 4 — Calendar */}
        <IntegrationCalendar data={data?.calendar} loading={loading} />


      </div>
    </div>
  );
}
