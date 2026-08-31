"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { format } from "date-fns";
import TransactionViewModal from "@/components/partials/admin/ecom/TransactionViewModal";

export default function RefurbishedTransactions() {
  const { token } = useSelector((s) => s.auth);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = useCallback(async (page = 1, searchQuery = "", type = "") => {
    if (!token) return;
    try {
      setLoading(true);
      const params = { category: "refurbished", page, limit: pagination.pageSize, search: searchQuery };
      if (type) params.type = type;

      const res = await axiosInstance.get("/admin/transactions", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setTransactions(res.data.data);
        setPagination((prev) => ({
          ...prev,
          current: res.data.pagination.currentPage,
          total: res.data.pagination.totalItems,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [token, pagination.pageSize]);

  useEffect(() => {
    fetchTransactions(1, search, typeFilter);
  }, [token, search, typeFilter, fetchTransactions]);

  const getTypeStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("refund") || t.includes("rejected")) {
      return { bg: "bg-red-100", text: "text-red-700", icon: "mdi:arrow-up-circle-outline" };
    }
    if (t.includes("success") || t.includes("release") || t.includes("order_payment")) {
      return { bg: "bg-emerald-100", text: "text-emerald-700", icon: "mdi:arrow-down-circle-outline" };
    }
    return { bg: "bg-blue-100", text: "text-blue-700", icon: "mdi:information-outline" };
  };

  const summaryCards = [
    { label: "Total Records", value: pagination.total, icon: "mdi:cash-register", color: "#6366f1" },
    { label: "Total Amount (Page)", value: `TRY ${transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString()}`, icon: "mdi:currency-usd", color: "#10b981" },
    { label: "Showing on Page", value: transactions.length, icon: "mdi:file-document-outline", color: "#f59e0b" },
  ];

  const typeOptions = [
    { label: "All Types", value: "" },
    { label: "Refund", value: "refund" },
    { label: "Hold", value: "hold" },
    { label: "Release", value: "seller_earning_release" },
    { label: "Withdrawal", value: "withdrawal_request" },
  ];

  const columns = [
    {
      key: "date",
      header: "Date",
      cell: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (row) => {
        const cfg = getTypeStyle(row.type);
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
            <Icon icon={cfg.icon} className="w-3.5 h-3.5" />
            {(row.type || "").toUpperCase().replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row) => {
        const cfg = getTypeStyle(row.type);
        return (
          <span className={`font-bold ${cfg.text} whitespace-nowrap`}>
            TRY. {(row.amount || 0).toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "orderNo",
      header: "Order No",
      cell: (row) => (
        <span className="text-gray-700 font-mono text-xs whitespace-nowrap">
          {row.orderNo || "—"}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (row) => (
        <p className="line-clamp-2 text-xs text-gray-600 max-w-xs" title={row.description}>
          {row.description}
        </p>
      ),
    },
    {
      key: "users",
      header: "From / To",
      cell: (row) => (
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          <span className="flex gap-1">
            <span className="font-semibold w-8 text-gray-400">Fr:</span>
            <span className="text-gray-700 truncate max-w-[120px]">{row.fromUserId?.name || "System"}</span>
          </span>
          <span className="flex gap-1">
            <span className="font-semibold w-8 text-gray-400">To:</span>
            <span className="text-gray-700 truncate max-w-[120px]">{row.toUserId?.name || "System"}</span>
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      cell: (row) => (
        <button
          onClick={() => {
            setSelectedTransaction(row);
            setIsModalOpen(true);
          }}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="View Details"
        >
          <Icon icon="mdi:eye-outline" className="w-5 h-5" />
        </button>
      ),
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Refurbished Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track all financial ledger records</p>
        </div>
      </div>

      {/* <SummaryCards data={summaryCards} /> */}

      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchInput
              value={search}
              onChange={(v) => setSearch(v)}
              placeholder="Search by order no, user, description..."
            />
          </div>
          <div className="w-full sm:w-48">
            <CustomDropdown
              icon="mdi:filter-outline"
              placeholder="Type"
              options={typeOptions}
              value={typeFilter}
              onChange={(v) => setTypeFilter(v)}
            />
          </div>
        </div>

        <DataTable
          data={transactions}
          columns={columns}
          loading={loading}
          emptyIcon="mdi:receipt-text-outline"
          emptyTitle="No transactions found"
          emptyDescription="Try adjusting your filters or search"
        />

        {/* Pagination Controls */}
        {transactions.length > 0 && pagination.total > pagination.pageSize && (
          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.current === 1 || loading}
                onClick={() => fetchTransactions(pagination.current - 1, search, typeFilter)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="mdi:chevron-left" className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-700 px-2">
                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <button
                disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize) || loading}
                onClick={() => fetchTransactions(pagination.current + 1, search, typeFilter)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="mdi:chevron-right" className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionViewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedTransaction(null), 200);
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
}
