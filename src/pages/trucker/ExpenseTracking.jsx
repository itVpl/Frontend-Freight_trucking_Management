import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Clear,
  AttachMoney,
  ReceiptLong,
  CloudUpload,
  CheckCircle,
  Cancel,
  Paid,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";
import { useThemeConfig } from "../../context/ThemeContext";
import { BASE_API_URL } from "../../apiConfig";

const PAYMENT_METHODS = [
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "company_account", label: "Company Account" },
  { value: "check", label: "Check" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "reimbursed", label: "Reimbursed" },
];

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const FilterDropdown = ({ label, value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const selected = options.find((o) => o.value === value) ?? options[0];
  const listboxId = `${label.replace(/\s+/g, "-").toLowerCase()}-listbox`;

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e) => {
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      setOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="min-w-[220px] flex-1">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-base text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
        >
          <span className="truncate">{selected?.label ?? "Select"}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <div
            ref={panelRef}
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <ul
              id={listboxId}
              role="listbox"
              aria-label={label}
              className="max-h-64 overflow-auto py-1"
            >
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <li
                    key={`${label}-${String(o.value)}`}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-base cursor-pointer transition ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{o.label}</span>
                      {active && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.5 7.5a1 1 0 0 1-1.415 0l-3.5-3.5a1 1 0 1 1 1.415-1.415l2.792 2.793 6.792-6.793a1 1 0 0 1 1.416-.001Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ExpenseTracking = () => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reference data
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    truck: "",
    driver: "",
    trip: "",
    startDate: null,
    endDate: null,
    sortBy: "expenseDate",
    sortOrder: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangePreset, setDateRangePreset] = useState("all");
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [customRangeStart, setCustomRangeStart] = useState(null);
  const [customRangeEnd, setCustomRangeEnd] = useState(null);

  // Add/Edit form
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    expenseDate: new Date(),
    payment: { method: "card", cardLastFour: "", companyAccountRef: "" },
    truck: "",
    driver: "",
    trip: "",
    vendor: "",
    vendorName: "",
    notes: "",
    remarks: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Detail view
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [uploadingReceipts, setUploadingReceipts] = useState(false);

  const { themeConfig } = useThemeConfig();
  const brand = themeConfig?.tokens?.primary || "#1976d2";

  // Fetch reference data
  const fetchReferenceData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [catRes, venRes, truckRes, tripRes, driverRes] = await Promise.all([
        fetch(`${BASE_API_URL}/api/v1/trucking-expenses/categories`, {
          headers,
        }),
        fetch(`${BASE_API_URL}/api/v1/trucking-expenses/vendors`, { headers }),
        fetch(`${BASE_API_URL}/api/v1/trucking-expenses/trucks`, { headers }),
        fetch(`${BASE_API_URL}/api/v1/trucking-expenses/trips`, { headers }),
        fetch(`${BASE_API_URL}/api/v1/driver/my-drivers`, { headers }),
      ]);

      const catData = catRes.ok ? await catRes.json() : {};
      const venData = venRes.ok ? await venRes.json() : {};
      const truckData = truckRes.ok ? await truckRes.json() : {};
      const tripData = tripRes.ok ? await tripRes.json() : {};
      const driverData = driverRes.ok ? await driverRes.json() : {};

      setCategories(catData?.data?.categories || []);
      setVendors(venData?.data?.vendors || []);
      setTrucks(truckData?.data?.trucks || []);
      setTrips(tripData?.data?.trips || []);
      setDrivers(
        Array.isArray(driverData) ? driverData : driverData?.drivers || [],
      );
    } catch (e) {
      console.error("Error fetching reference data:", e);
    }
  };

  // Fetch expenses list
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      params.set("sortBy", filters.sortBy);
      params.set("sortOrder", filters.sortOrder);
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (filters.truck) params.set("truck", filters.truck);
      if (filters.driver) params.set("driver", filters.driver);
      if (filters.trip) params.set("trip", filters.trip);
      if (filters.startDate)
        params.set("startDate", format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate)
        params.set("endDate", format(filters.endDate, "yyyy-MM-dd"));

      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses?${params.toString()}`,
        { headers: getAuthHeaders() },
      );
      const data = await res.json();
      if (data.success && data.data) {
        setExpenses(data.data.expenses || []);
        setPagination((prev) => ({
          ...prev,
          total: data.data.pagination?.total ?? 0,
          totalPages: data.data.pagination?.totalPages ?? 1,
        }));
      }
    } catch (e) {
      console.error("Error fetching expenses:", e);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate)
        params.set("startDate", format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate)
        params.set("endDate", format(filters.endDate, "yyyy-MM-dd"));
      if (filters.status) params.set("status", filters.status);
      if (filters.truck) params.set("truck", filters.truck);
      if (filters.driver) params.set("driver", filters.driver);
      if (filters.trip) params.set("trip", filters.trip);
      if (filters.category) params.set("category", filters.category);

      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses/summary?${params.toString()}`,
        { headers: getAuthHeaders() },
      );
      const data = await res.json();
      if (data.success) {
        const incoming = data?.data?.summary ?? data?.data ?? null;
        setSummary(incoming);
      } else {
        setSummary(null);
      }
    } catch (e) {
      console.error("Error fetching summary:", e);
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchSummary();
  }, [
    filters.startDate,
    filters.endDate,
    filters.status,
    filters.truck,
    filters.driver,
    filters.trip,
    filters.category,
  ]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const setDateRange = (start, end) => {
    setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const applyDatePreset = (preset) => {
    const today = new Date();

    if (preset === "all") {
      setDateRange(null, null);
      return;
    }

    if (preset === "today") {
      setDateRange(startOfDay(today), endOfDay(today));
      return;
    }

    if (preset === "yesterday") {
      const d = subDays(today, 1);
      setDateRange(startOfDay(d), endOfDay(d));
      return;
    }

    if (preset === "last7") {
      setDateRange(startOfDay(subDays(today, 6)), endOfDay(today));
      return;
    }

    if (preset === "last30") {
      setDateRange(startOfDay(subDays(today, 29)), endOfDay(today));
      return;
    }

    if (preset === "thisMonth") {
      setDateRange(startOfDay(startOfMonth(today)), endOfDay(endOfMonth(today)));
      return;
    }

    if (preset === "lastMonth") {
      const d = subMonths(today, 1);
      setDateRange(startOfDay(startOfMonth(d)), endOfDay(endOfMonth(d)));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      category: "",
      truck: "",
      driver: "",
      trip: "",
      startDate: null,
      endDate: null,
      sortBy: "expenseDate",
      sortOrder: "desc",
    });
    setDateRangePreset("all");
    setCustomRangeOpen(false);
    setCustomRangeStart(null);
    setCustomRangeEnd(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      amount: "",
      category: "",
      expenseDate: new Date(),
      payment: { method: "card", cardLastFour: "", companyAccountRef: "" },
      truck: "",
      driver: "",
      trip: "",
      vendor: "",
      vendorName: "",
      notes: "",
      remarks: "",
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditForm = (expense) => {
    setEditingId(expense._id);
    setForm({
      amount: expense.amount ?? "",
      category: expense.category?._id ?? "",
      expenseDate: expense.expenseDate
        ? new Date(expense.expenseDate)
        : new Date(),
      payment: {
        method: expense.payment?.method ?? "card",
        cardLastFour: expense.payment?.cardLastFour ?? "",
        companyAccountRef: expense.payment?.companyAccountRef ?? "",
      },
      truck: expense.truck?._id ?? "",
      driver: expense.driver?._id ?? "",
      trip: expense.trip?._id ?? "",
      vendor: expense.vendor?._id ?? "",
      vendorName: expense.vendorName ?? "",
      notes: expense.notes ?? "",
      remarks: expense.remarks ?? "",
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePaymentChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      payment: { ...prev.payment, [field]: value },
    }));
  };

  const validateForm = () => {
    const err = {};
    if (!form.amount || Number(form.amount) < 0)
      err.amount = "Amount is required and must be ≥ 0";
    if (!form.category) err.category = "Category is required";
    if (!form.expenseDate) err.expenseDate = "Expense date is required";
    if (!form.payment?.method) err.payment = "Payment method is required";
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    setFormLoading(true);
    try {
      const payload = {
        amount: Number(form.amount),
        category: form.category,
        expenseDate:
          form.expenseDate instanceof Date
            ? form.expenseDate.toISOString()
            : form.expenseDate,
        payment: form.payment,
        truck: form.truck || undefined,
        driver: form.driver || undefined,
        trip: form.trip || undefined,
        vendor: form.vendor || undefined,
        vendorName: form.vendorName || undefined,
        notes: form.notes || undefined,
        remarks: form.remarks || undefined,
      };

      const url = editingId
        ? `${BASE_API_URL}/api/v1/trucking-expenses/${editingId}`
        : `${BASE_API_URL}/api/v1/trucking-expenses`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFormOpen(false);
        fetchExpenses();
        fetchSummary();
      } else {
        setFormErrors({ submit: data.message || "Failed to save" });
      }
    } catch (e) {
      setFormErrors({ submit: e.message || "Request failed" });
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteDialog = (id) => {
    setExpenseToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleteLoading) return;
    setDeleteConfirmOpen(false);
    setExpenseToDelete(null);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (data.success) {
        fetchExpenses();
        fetchSummary();
        if (selectedExpense?._id === id) setDetailOpen(false);
        return true;
      }
      alert(data.message || "Delete failed");
      return false;
    } catch (e) {
      alert("Delete failed");
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    const ok = await handleDelete(expenseToDelete);
    setDeleteLoading(false);
    if (ok) {
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    }
  };

  const openDetail = async (expense) => {
    setSelectedExpense(null);
    setDetailOpen(true);
    setDetailLoading(true);
    setRejectReason("");
    setReceiptFiles([]);
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses/${expense._id}`,
        {
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (data.success) setSelectedExpense(data.data.expense);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedExpense) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses/${selectedExpense._id}/approve`,
        { method: "PATCH", headers: getAuthHeaders() },
      );
      const data = await res.json();
      if (data.success) {
        setSelectedExpense(
          data.data?.expense || { ...selectedExpense, status: "approved" },
        );
        fetchExpenses();
        fetchSummary();
      } else alert(data.message || "Approve failed");
    } catch (e) {
      alert("Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedExpense) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses/${selectedExpense._id}/reject`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ reason: rejectReason }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setSelectedExpense(
          data.data?.expense || { ...selectedExpense, status: "rejected" },
        );
        fetchExpenses();
        fetchSummary();
      } else alert(data.message || "Reject failed");
    } catch (e) {
      alert("Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReimburse = async () => {
    if (!selectedExpense) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses/${selectedExpense._id}/reimburse`,
        { method: "PATCH", headers: getAuthHeaders() },
      );
      const data = await res.json();
      if (data.success) {
        setSelectedExpense(
          data.data?.expense || { ...selectedExpense, status: "reimbursed" },
        );
        fetchExpenses();
        fetchSummary();
      } else alert(data.message || "Reimburse failed");
    } catch (e) {
      alert("Reimburse failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiptUpload = async () => {
    if (!selectedExpense || !receiptFiles.length) return;
    setUploadingReceipts(true);
    try {
      const formData = new FormData();
      receiptFiles.forEach((f) => formData.append("receipts", f));
      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses/${selectedExpense._id}/receipts`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        },
      );
      const data = await res.json();
      if (data.success && data.data?.expense) {
        setSelectedExpense(data.data.expense);
        setReceiptFiles([]);
      } else alert(data.message || "Upload failed");
    } catch (e) {
      alert("Upload failed");
    } finally {
      setUploadingReceipts(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "reimbursed":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusBadgeClasses = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "approved")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (normalized === "pending")
      return "bg-amber-50 text-amber-800 border-amber-200";
    if (normalized === "rejected")
      return "bg-red-50 text-red-700 border-red-200";
    if (normalized === "reimbursed")
      return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleExpenses = normalizedSearchQuery
    ? expenses.filter((row) => {
        const haystack = [
          row.status,
          row.category?.name,
          row.truck?.truckNumber,
          row.driver?.fullName,
          row.vendor?.name,
          row.vendorName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearchQuery);
      })
    : expenses;

  const totalPages = Math.max(1, pagination.totalPages || 1);
  const isSearchActive = normalizedSearchQuery.length > 0;
  const clampedPage = Math.min(
    Math.max(pagination.page - 1, 0),
    Math.max(0, totalPages - 1),
  );
  const totalItems = isSearchActive ? visibleExpenses.length : pagination.total;
  const pageStart = isSearchActive ? 0 : clampedPage * pagination.limit;
  const pageEnd = isSearchActive
    ? totalItems
    : Math.min(pageStart + pagination.limit, totalItems);

  const localSummary = (() => {
    const rows = visibleExpenses;
    let totalAmount = 0;
    let iftaFuelTotal = 0;

    for (const row of rows) {
      const amount = Number(row?.amount ?? 0);
      if (Number.isFinite(amount)) totalAmount += amount;
      const categoryName = String(row?.category?.name ?? "").toLowerCase();
      if (categoryName.includes("fuel")) {
        if (Number.isFinite(amount)) iftaFuelTotal += amount;
      }
    }

    return {
      totalCount: rows.length,
      totalAmount,
      iftaFuel: { totalFuelAmount: iftaFuelTotal },
    };
  })();

  const apiSummary = (() => {
    const totalCount = Number(summary?.totalCount ?? summary?.count ?? 0);
    const totalAmount = Number(summary?.totalAmount ?? summary?.amount ?? 0);
    const iftaFuelAmount = Number(
      summary?.iftaFuel?.totalFuelAmount ??
        summary?.iftaFuelTotal ??
        summary?.iftaFuelAmount ??
        0,
    );
    return {
      totalCount: Number.isFinite(totalCount) ? totalCount : 0,
      totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
      iftaFuel: { totalFuelAmount: Number.isFinite(iftaFuelAmount) ? iftaFuelAmount : 0 },
    };
  })();

  const effectiveSummary =
    (apiSummary.totalCount === 0 && visibleExpenses.length > 0) ? localSummary : apiSummary;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, clampedPage + 1 - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (start > 1) pages.push(1, "…");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("…", totalPages);
    return pages;
  };

  const handlePrevPage = () => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  };

  const handleNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(Math.max(1, prev.totalPages || 1), prev.page + 1),
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">
            Expense Tracking
          </h1>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <div className="text-lg font-semibold text-gray-600">
                  Total Count
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {summaryLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    (effectiveSummary.totalCount ?? 0)
                  )}
                </div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-green-50 text-green-600">
                <ReceiptLong fontSize="small" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <div className="text-lg font-semibold text-gray-600">
                  Total Amount
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {summaryLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    `$${Number(effectiveSummary.totalAmount ?? 0).toLocaleString()}`
                  )}
                </div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-600">
                <AttachMoney fontSize="small" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <div className="text-lg font-semibold text-gray-600">
                  IFTA Fuel
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {summaryLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    `$${Number(effectiveSummary.iftaFuel?.totalFuelAmount ?? 0).toLocaleString()}`
                  )}
                </div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-amber-50 text-amber-600">
                <Paid fontSize="small" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, truck, driver, vendor, status..."
              className="h-12 w-full flex-1 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
            />
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-blue-600 px-4 text-base font-medium text-white"
            >
              <Add fontSize="small" />
              Add Expense
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-end gap-3">
            <FilterDropdown
              label="Status"
              value={filters.status}
              onChange={(v) => handleFilterChange("status", v)}
              options={STATUS_OPTIONS}
            />

            <FilterDropdown
              label="Category"
              value={filters.category}
              onChange={(v) => handleFilterChange("category", v)}
              options={[
                { value: "", label: "All" },
                ...categories.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />

            <FilterDropdown
              label="Truck"
              value={filters.truck}
              onChange={(v) => handleFilterChange("truck", v)}
              options={[
                { value: "", label: "All" },
                ...trucks.map((t) => ({ value: t._id, label: t.truckNumber })),
              ]}
            />

            <FilterDropdown
              label="Date Range"
              value={dateRangePreset}
              onChange={(v) => {
                if (v === "custom") {
                  setDateRangePreset("custom");
                  setCustomRangeStart(filters.startDate ?? startOfDay(new Date()));
                  setCustomRangeEnd(filters.endDate ?? endOfDay(new Date()));
                  setCustomRangeOpen(true);
                  return;
                }
                setDateRangePreset(v);
                applyDatePreset(v);
              }}
              options={[
                { value: "all", label: "All" },
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "last7", label: "Last 7 Days" },
                { value: "last30", label: "Last 30 Days" },
                { value: "thisMonth", label: "This Month" },
                { value: "lastMonth", label: "Last Month" },
                {
                  value: "custom",
                  label:
                    dateRangePreset === "custom" && filters.startDate && filters.endDate
                      ? `Custom (${format(filters.startDate, "MMM d, yyyy")} - ${format(filters.endDate, "MMM d, yyyy")})`
                      : "Custom...",
                },
              ]}
            />

            <div className="flex w-full justify-end md:w-auto md:pl-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="h-11 cursor-pointer rounded-md border border-gray-200 bg-white px-4 text-base font-medium text-gray-700 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Clear fontSize="small" />
                  Clear Filters
                </span>
              </button>
            </div>
          </div>
        </div>

        <Dialog
          open={customRangeOpen}
          onClose={() => setCustomRangeOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: brand, color: "#fff" }}>
            Select Date Range
          </DialogTitle>
          <DialogContent>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-sm font-medium text-gray-700">Start</div>
                <DatePicker
                  value={customRangeStart}
                  onChange={(v) => setCustomRangeStart(v)}
                  slotProps={{ textField: { fullWidth: true, inputProps: { readOnly: true } } }}
                />
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-gray-700">End</div>
                <DatePicker
                  value={customRangeEnd}
                  onChange={(v) => setCustomRangeEnd(v)}
                  slotProps={{ textField: { fullWidth: true, inputProps: { readOnly: true } } }}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                setCustomRangeOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!customRangeStart || !customRangeEnd) return;
                const start = startOfDay(customRangeStart);
                const end = endOfDay(customRangeEnd);
                setDateRangePreset("custom");
                setDateRange(start, end);
                setCustomRangeOpen(false);
              }}
              sx={{ backgroundColor: brand, color:"#fff" }}
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex justify-center py-10">
              <CircularProgress />
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="overflow-x-auto p-4">
                <table className="min-w-full border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-left bg-slate-100">
                      <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-l-xl border-t border-b border-l border-gray-200">
                        Date
                      </th>
                      <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                        Category
                      </th>
                      <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                        Truck
                      </th>
                      <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                        Driver
                      </th>
                      <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                        Vendor
                      </th>
                      <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                        Status
                      </th>
                      <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-r-xl border-t border-b border-r border-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleExpenses.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-6 text-center text-sm text-slate-500"
                        >
                          No expenses found.
                        </td>
                      </tr>
                    ) : (
                      visibleExpenses.map((row) => (
                        <tr key={row._id} className="hover:bg-slate-50">
                          <td className="px-4 py-4 font-medium text-gray-700 truncate rounded-l-xl border-t border-b border-l border-gray-200">
                            {row.expenseDate
                              ? format(
                                  new Date(row.expenseDate),
                                  "MMM dd, yyyy",
                                )
                              : "—"}
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                            ${Number(row.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                            {row.category?.name ?? "—"}
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                            {row.truck?.truckNumber ?? "—"}
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                            {row.driver?.fullName ?? "—"}
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                            {row.vendor?.name || row.vendorName || "—"}
                          </td>
                          <td className="px-4 py-4 text-gray-700 border-t border-b border-gray-200">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-base font-medium border ${getStatusBadgeClasses(row.status)}`}
                            >
                              {row.status || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openDetail(row)}
                                className="h-8 px-3 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
                              >
                                View
                              </button>
                              {row.status !== "reimbursed" && (
                                <button
                                  type="button"
                                  onClick={() => openEditForm(row)}
                                  className="h-8 px-3 rounded-md border border-cyan-600 text-cyan-600 text-base cursor-pointer font-medium hover:bg-cyan-600 hover:text-white"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openDeleteDialog(row._id)}
                                className="h-8 px-3 rounded-md border border-red-600 text-red-600 text-base cursor-pointer font-medium hover:bg-red-600 hover:text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-2 border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center justify-between pr-40">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span>{`Showing ${totalItems === 0 ? 0 : pageStart + 1} to ${totalItems === 0 ? 0 : pageEnd} of ${totalItems} expenses`}</span>
              </div>
              <div className="flex items-center gap-2 mr-8">
                <label className="inline-flex items-center gap-2 font-medium text-gray-700">
                  <span>Rows per page</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) =>
                      setPagination((prev) => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }))
                    }
                    className="h-8 rounded-md border border-slate-300 px-2 text-sm bg-white cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={clampedPage === 0}
                  className={`h-8 px-3 text-base ${
                    clampedPage === 0
                      ? "text-slate-400 rounded-full cursor-not-allowed"
                      : "text-slate-900 font-semibold cursor-pointer rounded-md"
                  }`}
                >
                  Previous
                </button>
                {getPageNumbers().map((num, idx) =>
                  num === "…" ? (
                    <span key={`e-${idx}`} className="px-1 text-gray-900">
                      …
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setPagination((prev) => ({ ...prev, page: Number(num) }))}
                      className={`min-w-8 h-8 px-2 rounded-xl text-base cursor-pointer ${
                        num === clampedPage + 1 ? "border border-gray-900" : "text-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={clampedPage >= totalPages - 1}
                  className={`h-8 px-3 text-base ${
                    clampedPage >= totalPages - 1
                      ? "text-slate-400 rounded-full cursor-not-allowed"
                      : "text-slate-900 font-semibold cursor-pointer rounded-md"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* Add/Edit dialog */}
        <Dialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ className: "overflow-hidden rounded-2xl" }}
        >
          <DialogTitle disableTypography className="p-0">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                {/* <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
                  <ReceiptLong fontSize="small" className="text-white" />
                </div> */}
                <div>
                  <div className="text-lg font-semibold leading-tight">
                    {editingId ? "Edit Expense" : "Add Expense"}
                  </div>
                  <div className="text-base text-white/80">
                    Enter expense details below
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl bg-white/10 hover:bg-white/20"
              >
                <Clear fontSize="small" className="text-white" />
              </button>
            </div>
          </DialogTitle>

          <DialogContent className="bg-slate-50 p-5">
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 mt-6">
                <div className="mb-3 text-sm font-semibold text-blue-700">
                  Basic Information
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <TextField
                    fullWidth
                    label="Amount (USD)"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    value={form.amount}
                    onChange={(e) => handleFormChange("amount", e.target.value)}
                    error={!!formErrors.amount}
                    helperText={formErrors.amount}
                    size="small"
                  />

                  <FormControl
                    fullWidth
                    size="small"
                    error={!!formErrors.category}
                  >
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={form.category}
                      label="Category"
                      onChange={(e) =>
                        handleFormChange("category", e.target.value)
                      }
                    >
                      {categories.map((c) => (
                        <MenuItem key={c._id} value={c._id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <DatePicker
                    label="Expense Date"
                    value={form.expenseDate}
                    onChange={(d) => handleFormChange("expenseDate", d)}
                    slotProps={{
                      textField: { fullWidth: true, size: "small" },
                    }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="mb-3 text-sm font-semibold text-emerald-700">
                  Payment & Assignment
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={form.payment?.method}
                      label="Payment Method"
                      onChange={(e) =>
                        handlePaymentChange("method", e.target.value)
                      }
                    >
                      {PAYMENT_METHODS.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                          {p.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {form.payment?.method === "card" ? (
                    <TextField
                      fullWidth
                      label="Card last 4"
                      value={form.payment?.cardLastFour ?? ""}
                      onChange={(e) =>
                        handlePaymentChange("cardLastFour", e.target.value)
                      }
                      size="small"
                      inputProps={{ maxLength: 4 }}
                    />
                  ) : (
                    <div className="hidden md:block" />
                  )}

                  <FormControl fullWidth size="small">
                    <InputLabel>Truck</InputLabel>
                    <Select
                      value={form.truck}
                      label="Truck"
                      onChange={(e) =>
                        handleFormChange("truck", e.target.value)
                      }
                    >
                      <MenuItem value="">—</MenuItem>
                      {trucks.map((t) => (
                        <MenuItem key={t._id} value={t._id}>
                          {t.truckNumber}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Driver</InputLabel>
                    <Select
                      value={form.driver}
                      label="Driver"
                      onChange={(e) =>
                        handleFormChange("driver", e.target.value)
                      }
                    >
                      <MenuItem value="">—</MenuItem>
                      {drivers.map((d) => (
                        <MenuItem key={d._id} value={d._id}>
                          {d.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Trip</InputLabel>
                    <Select
                      value={form.trip}
                      label="Trip"
                      onChange={(e) => handleFormChange("trip", e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      {trips.map((t) => (
                        <MenuItem key={t._id} value={t._id}>
                          {t.tripId}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Vendor</InputLabel>
                    <Select
                      value={form.vendor}
                      label="Vendor"
                      onChange={(e) =>
                        handleFormChange("vendor", e.target.value)
                      }
                    >
                      <MenuItem value="">—</MenuItem>
                      {vendors.map((v) => (
                        <MenuItem key={v._id} value={v._id}>
                          {v.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                <div className="mb-3 text-sm font-semibold text-violet-700">
                  Notes
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <TextField
                    fullWidth
                    label="Vendor name (if no vendor)"
                    value={form.vendorName}
                    onChange={(e) =>
                      handleFormChange("vendorName", e.target.value)
                    }
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={form.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                    size="small"
                  />
                </div>
              </div>

              {formErrors.submit && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formErrors.submit}
                </div>
              )}
            </div>
          </DialogContent>

          <DialogActions className="border-t border-slate-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-red-600 bg-white px-5 text-sm font-medium text-red-600 hover:bg-red-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={formLoading}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formLoading ? (
                <CircularProgress size={20} className="text-white" />
              ) : (
                "Save"
              )}
            </button>
          </DialogActions>
        </Dialog>

        {/* Detail dialog */}
        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ className: "overflow-hidden rounded-2xl" }}
        >
          <DialogTitle disableTypography className="p-0">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                {/* <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
                  <Visibility fontSize="small" className="text-white" />
                </div> */}
                <div>
                  <div className="text-lg font-semibold leading-tight">
                    Expense Detail
                  </div>
                  <div className="text-base text-white/80">
                    Review details below
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl bg-white/10 hover:bg-white/20"
              >
                <Clear fontSize="small" className="text-white" />
              </button>
            </div>
          </DialogTitle>

          <DialogContent className="bg-slate-50 p-5">
            {detailLoading ? (
              <div className="flex justify-center py-10">
                <CircularProgress />
              </div>
            ) : selectedExpense ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 mt-6">
                  <div className="mb-3 text-base font-semibold text-blue-700">
                    Basic Information
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Amount
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        ${Number(selectedExpense.amount).toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Category
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedExpense.category?.name ?? "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Expense Date
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedExpense.expenseDate
                          ? format(
                              new Date(selectedExpense.expenseDate),
                              "PPpp",
                            )
                          : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Payment Method
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedExpense.payment?.method ?? "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Vendor
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedExpense.vendor?.name ||
                          selectedExpense.vendorName ||
                          "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Status
                      </div>
                      <div className="mt-2">
                        <Chip
                          label={selectedExpense.status}
                          color={getStatusColor(selectedExpense.status)}
                          size="small"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="mb-3 text-base font-semibold text-emerald-700">
                    Assignment
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Truck
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedExpense.truck?.truckNumber ?? "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Driver
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedExpense.driver?.fullName ?? "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Trip
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedExpense.trip?.tripId ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                  <div className="mb-3 text-base font-semibold text-violet-700">
                    Notes & Receipts
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Notes
                      </div>
                      <div className="mt-1 text-sm text-slate-900">
                        {selectedExpense.notes || "—"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">
                        Receipts
                      </div>
                      {selectedExpense.receipts?.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {selectedExpense.receipts.map((r, i) => (
                            <a
                              key={i}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm font-medium text-blue-700 hover:underline"
                            >
                              {r.fileName || "Receipt"}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-slate-900">—</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">
                      Upload receipts
                    </div>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        multiple
                        onChange={(e) =>
                          setReceiptFiles(Array.from(e.target.files || []))
                        }
                        className="cursor-pointer w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-slate-200"
                      />
                      {receiptFiles.length > 0 && (
                        <button
                          type="button"
                          onClick={handleReceiptUpload}
                          disabled={uploadingReceipts}
                          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {uploadingReceipts ? (
                            <CircularProgress
                              size={16}
                              className="text-white"
                            />
                          ) : (
                            <CloudUpload fontSize="small" />
                          )}
                          Upload {receiptFiles.length} file(s)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {selectedExpense.status === "pending" && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                    <div className="mb-3 text-base font-semibold text-amber-700">
                      Approval
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <div className="flex-1">
                        <TextField
                          fullWidth
                          size="small"
                          label="Reject reason (optional)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={actionLoading}
                          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle fontSize="small" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={actionLoading}
                          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Cancel fontSize="small" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedExpense.status === "approved" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleReimburse}
                      disabled={actionLoading}
                      className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Paid fontSize="small" />
                      Mark as Reimbursed
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load expense.
              </div>
            )}
          </DialogContent>

          <DialogActions className="border-t border-slate-200 bg-white px-5 py-4">
            {/* <button
              type="button"
              onClick={() => setDetailOpen(false)}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-red-600 bg-white px-5 text-sm font-medium text-red-600 hover:bg-slate-50"
            >
              Close
            </button> */}
            {/* {selectedExpense && selectedExpense.status !== "reimbursed" && (
              <button
                type="button"
                onClick={() => { setDetailOpen(false); openEditForm(selectedExpense); }}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Edit
              </button>
            )} */}
            {/* {selectedExpense && (
              <button
                type="button"
                onClick={() => handleDelete(selectedExpense._id)}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            )} */}
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteConfirmOpen}
          onClose={closeDeleteDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              py: 2.5,
              px: 2.5,
              background: brand,
              color: "#fff",
            }}
          >
            <Box
              component="svg"
              sx={{ width: 44, height: 44 }}
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M24 4L2 44h44L24 4z" fill="#F59E0B" />
              <rect x="22.5" y="18" width="3" height="12" fill="#1F2937" />
              <circle cx="24" cy="34" r="2.3" fill="#1F2937" />
            </Box>
            <Typography
              sx={{ fontWeight: 700, color: "#fff", fontSize: "1.25rem" }}
            >
              Confirm Deletion
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography align="center" sx={{ pt: 1.5 }}>
              Are you sure you want to delete this expense?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, justifyContent: "center", gap: 1.5 }}>
            <Button
              onClick={closeDeleteDialog}
              variant="outlined"
              disabled={deleteLoading}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                borderColor: "#111827",
                color: "#111827",
                "&:hover": { backgroundColor: "#111827", color: "#fff" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              color="error"
              disabled={deleteLoading}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                color: "#fff",
              }}
            >
              {deleteLoading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default ExpenseTracking;
