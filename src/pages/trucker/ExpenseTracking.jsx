import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useAuth } from "../../context/AuthContext";
import { BASE_API_URL } from "../../apiConfig";

const TRUCKER_PAYMENT_METHODS = [
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "company_account", label: "Company Account" },
  { value: "check", label: "Check" },
  { value: "other", label: "Other" },
];

const SHIPPER_PAYMENT_METHODS = [
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "check", label: "Check" },
  { value: "online", label: "Online" },
  { value: "company_account", label: "Company Account" },
  { value: "other", label: "Other" },
];

const TRUCKER_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "reimbursed", label: "Reimbursed" },
];

const SHIPPER_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "paid", label: "Paid" },
];

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const getAuthHeadersNoContentType = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const FilterDropdown = ({
  label,
  value,
  onChange,
  options,
  hideLabel = false,
  containerClassName = "",
  buttonClassName = "",
  placeholder = "Select",
  searchable = false,
  searchPlaceholder = "Search...",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const selected = options.find((o) => o.value === value) ?? null;
  const listboxId = `${label.replace(/\s+/g, "-").toLowerCase()}-listbox`;
  const isEmptyValue = value === "" || value === null || value === undefined;
  const selectedLabel = String(selected?.label ?? "").trim();
  const selectedLooksLikePlaceholder =
    selectedLabel.length === 0 ||
    selectedLabel === "—" ||
    selectedLabel === "--" ||
    selectedLabel.toLowerCase().startsWith("select");
  const showPlaceholder = !selected || (isEmptyValue && selectedLooksLikePlaceholder);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions =
    searchable && normalizedQuery.length > 0
      ? options.filter((o) =>
          String(o.label ?? "")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : options;

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e) => {
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      setOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div className={containerClassName || "min-w-[220px] flex-1"}>
      {hideLabel ? null : (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => setOpen((v) => !v)}
          className={`cursor-pointer flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-base text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 ${buttonClassName}`}
        >
          <span className={`truncate ${showPlaceholder ? "text-slate-400" : ""}`}>
            {showPlaceholder ? placeholder : selectedLabel}
          </span>
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
            <div className="flex max-h-72 flex-col">
              {searchable ? (
                <div className="border-b border-slate-200 bg-white p-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                  />
                </div>
              ) : null}

              <ul
                id={listboxId}
                role="listbox"
                aria-label={label}
                className="flex-1 overflow-auto py-1"
              >
                {visibleOptions.length > 0 ? (
                  visibleOptions.map((o) => {
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
                            setQuery("");
                          }}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm cursor-pointer transition ${
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
                  })
                ) : (
                  <li className="px-4 py-2 text-sm text-slate-500">No results</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ExpenseTracking = () => {
  const { userType } = useAuth();
  const isShipper = userType === "shipper" || userType === "shipper_driver";
  const apiBasePath = isShipper ? "/api/v1/shipper-expenses" : "/api/v1/trucking-expenses";
  const apiBaseUrl = `${BASE_API_URL}${apiBasePath}`;

  const statusOptions = useMemo(
    () => (isShipper ? SHIPPER_STATUS_OPTIONS : TRUCKER_STATUS_OPTIONS),
    [isShipper],
  );
  const paymentMethods = useMemo(
    () => (isShipper ? SHIPPER_PAYMENT_METHODS : TRUCKER_PAYMENT_METHODS),
    [isShipper],
  );

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
  const [loads, setLoads] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    vendor: "",
    truck: "",
    driver: "",
    trip: "",
    load: "",
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
    currency: "USD",
    category: "",
    expenseDate: new Date(),
    payment: { method: "card", cardLastFour: "", companyAccountRef: "" },
    truck: "",
    driver: "",
    trip: "",
    load: "",
    vendor: "",
    vendorName: "",
    notes: "",
    remarks: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formReceiptFiles, setFormReceiptFiles] = useState([]);
  const [formExistingReceipts, setFormExistingReceipts] = useState([]);
  const [formReceiptPreviews, setFormReceiptPreviews] = useState([]);
  const [categoryCreateOpen, setCategoryCreateOpen] = useState(false);
  const [vendorCreateOpen, setVendorCreateOpen] = useState(false);
  const [categoryCreateLoading, setCategoryCreateLoading] = useState(false);
  const [vendorCreateLoading, setVendorCreateLoading] = useState(false);
  const [categoryCreateError, setCategoryCreateError] = useState("");
  const [vendorCreateError, setVendorCreateError] = useState("");
  const [categoryDraft, setCategoryDraft] = useState({ name: "", code: "" });
  const [vendorDraft, setVendorDraft] = useState({
    name: "",
    phone: "",
    email: "",
    contactPerson: "",
    address: "",
    notes: "",
  });

  // Detail view
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { themeConfig } = useThemeConfig();
  const brand = themeConfig?.tokens?.primary || "#1976d2";

  useEffect(() => {
    if (!formReceiptFiles || formReceiptFiles.length === 0) {
      setFormReceiptPreviews([]);
      return;
    }

    const urls = [];
    const next = formReceiptFiles.map((file) => {
      const url = URL.createObjectURL(file);
      urls.push(url);
      const name = file?.name || "Receipt";
      const isPdf =
        String(file?.type || "").toLowerCase() === "application/pdf" ||
        String(name).toLowerCase().endsWith(".pdf");
      return {
        key: `${name}-${file?.size || 0}-${file?.lastModified || 0}`,
        url,
        name,
        isPdf,
      };
    });

    setFormReceiptPreviews(next);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [formReceiptFiles]);

  // Fetch reference data
  const fetchReferenceData = useCallback(async () => {
    try {
      if (isShipper) {
        const [catRes, venRes, loadRes] = await Promise.all([
          fetch(`${apiBaseUrl}/categories`, { headers: getAuthHeaders(), credentials: "include" }),
          fetch(`${apiBaseUrl}/vendors`, { headers: getAuthHeaders(), credentials: "include" }),
          fetch(`${BASE_API_URL}/api/v1/load/shipper/my-loads-detailed`, {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
        ]);

        const catData = catRes.ok ? await catRes.json() : {};
        const venData = venRes.ok ? await venRes.json() : {};
        const loadData = loadRes.ok ? await loadRes.json() : {};

        const incomingCategories =
          catData?.data?.categories ?? catData?.data?.data?.categories ?? catData?.categories ?? [];
        const incomingVendors =
          venData?.data?.vendors ?? venData?.data?.data?.vendors ?? venData?.vendors ?? [];
        setCategories(Array.isArray(incomingCategories) ? incomingCategories : []);
        setVendors(Array.isArray(incomingVendors) ? incomingVendors : []);
        const incomingLoads =
          loadData?.data?.loads || loadData?.data?.data?.loads || loadData?.data || loadData?.loads || [];
        setLoads(Array.isArray(incomingLoads) ? incomingLoads : []);
        setTrucks([]);
        setTrips([]);
        setDrivers([]);
      } else {
        const [catRes, venRes, truckRes, tripRes, driverRes] = await Promise.all([
          fetch(`${apiBaseUrl}/categories`, {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
          fetch(`${apiBaseUrl}/vendors`, { headers: getAuthHeaders(), credentials: "include" }),
          fetch(`${apiBaseUrl}/trucks`, { headers: getAuthHeaders(), credentials: "include" }),
          fetch(`${apiBaseUrl}/trips`, { headers: getAuthHeaders(), credentials: "include" }),
          fetch(`${BASE_API_URL}/api/v1/driver/my-drivers`, { headers: getAuthHeaders(), credentials: "include" }),
        ]);

        const catData = catRes.ok ? await catRes.json() : {};
        const venData = venRes.ok ? await venRes.json() : {};
        const truckData = truckRes.ok ? await truckRes.json() : {};
        const tripData = tripRes.ok ? await tripRes.json() : {};
        const driverData = driverRes.ok ? await driverRes.json() : {};

        const incomingCategories =
          catData?.data?.categories ?? catData?.data?.data?.categories ?? catData?.categories ?? [];
        const incomingVendors =
          venData?.data?.vendors ?? venData?.data?.data?.vendors ?? venData?.vendors ?? [];
        setCategories(Array.isArray(incomingCategories) ? incomingCategories : []);
        setVendors(Array.isArray(incomingVendors) ? incomingVendors : []);
        setTrucks(truckData?.data?.trucks || []);
        setTrips(tripData?.data?.trips || []);
        setDrivers(Array.isArray(driverData) ? driverData : driverData?.drivers || []);
        setLoads([]);
      }
    } catch (e) {
      console.error("Error fetching reference data:", e);
    }
  }, [apiBaseUrl, isShipper]);

  const createCategory = async () => {
    setCategoryCreateError("");
    if (!categoryDraft.name.trim() || !categoryDraft.code.trim()) {
      setCategoryCreateError("Name and code are required.");
      return;
    }
    setCategoryCreateLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name: categoryDraft.name.trim(),
          code: categoryDraft.code.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setCategoryCreateError(data?.message || "Failed to create category");
        return;
      }
      setCategoryCreateOpen(false);
      setCategoryDraft({ name: "", code: "" });
      await fetchReferenceData();
    } catch (e) {
      setCategoryCreateError(e?.message || "Failed to create category");
    } finally {
      setCategoryCreateLoading(false);
    }
  };

  const createVendor = async () => {
    setVendorCreateError("");
    if (!vendorDraft.name.trim()) {
      setVendorCreateError("Vendor name is required.");
      return;
    }
    setVendorCreateLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/vendors`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name: vendorDraft.name.trim(),
          phone: vendorDraft.phone.trim() || undefined,
          email: vendorDraft.email.trim() || undefined,
          contactPerson: vendorDraft.contactPerson.trim() || undefined,
          address: vendorDraft.address.trim() || undefined,
          notes: vendorDraft.notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setVendorCreateError(data?.message || "Failed to create vendor");
        return;
      }
      setVendorCreateOpen(false);
      setVendorDraft({
        name: "",
        phone: "",
        email: "",
        contactPerson: "",
        address: "",
        notes: "",
      });
      await fetchReferenceData();
    } catch (e) {
      setVendorCreateError(e?.message || "Failed to create vendor");
    } finally {
      setVendorCreateLoading(false);
    }
  };

  // Fetch expenses list
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      if (!isShipper) {
        params.set("sortBy", filters.sortBy);
        params.set("sortOrder", filters.sortOrder);
      }
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (isShipper) {
        if (filters.vendor) params.set("vendor", filters.vendor);
        if (filters.load) params.set("load", filters.load);
        if (filters.startDate) params.set("from", format(filters.startDate, "yyyy-MM-dd"));
        if (filters.endDate) params.set("to", format(filters.endDate, "yyyy-MM-dd"));
      } else {
        if (filters.truck) params.set("truck", filters.truck);
        if (filters.driver) params.set("driver", filters.driver);
        if (filters.trip) params.set("trip", filters.trip);
        if (filters.startDate) params.set("startDate", format(filters.startDate, "yyyy-MM-dd"));
        if (filters.endDate) params.set("endDate", format(filters.endDate, "yyyy-MM-dd"));
      }

      const res = await fetch(
        `${apiBaseUrl}?${params.toString()}`,
        { headers: getAuthHeaders(), credentials: "include" },
      );
      const data = await res.json();
      if (data.success && data.data) {
        setExpenses(data.data.expenses || []);
        setPagination((prev) => ({
          ...prev,
          total: data.data.pagination?.total ?? 0,
          totalPages: data.data.pagination?.totalPages ?? data.data.pagination?.pages ?? 1,
        }));
      }
    } catch (e) {
      console.error("Error fetching expenses:", e);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, filters, isShipper, pagination.limit, pagination.page]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.set(isShipper ? "from" : "startDate", format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate) params.set(isShipper ? "to" : "endDate", format(filters.endDate, "yyyy-MM-dd"));
      if (filters.status) params.set("status", filters.status);
      if (isShipper) {
        if (filters.vendor) params.set("vendor", filters.vendor);
        if (filters.load) params.set("load", filters.load);
      } else {
        if (filters.truck) params.set("truck", filters.truck);
        if (filters.driver) params.set("driver", filters.driver);
        if (filters.trip) params.set("trip", filters.trip);
      }
      if (filters.category) params.set("category", filters.category);

      const res = await fetch(
        `${apiBaseUrl}/summary?${params.toString()}`,
        { headers: getAuthHeaders(), credentials: "include" },
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
  }, [apiBaseUrl, filters, isShipper]);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

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
      vendor: "",
      truck: "",
      driver: "",
      trip: "",
      load: "",
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
      currency: "USD",
      category: "",
      expenseDate: new Date(),
      payment: { method: "card", cardLastFour: "", companyAccountRef: "" },
      truck: "",
      driver: "",
      trip: "",
      load: "",
      vendor: "",
      vendorName: "",
      notes: "",
      remarks: "",
    });
    setFormErrors({});
    setFormReceiptFiles([]);
    setFormExistingReceipts([]);
    setFormOpen(true);
  };

  const openEditForm = (expense) => {
    setEditingId(expense._id);
    setForm({
      amount: expense.amount ?? "",
      currency: expense.currency ?? "USD",
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
      load: expense.load?._id ?? expense.load ?? "",
      vendor: expense.vendor?._id ?? "",
      vendorName: expense.vendorName ?? "",
      notes: expense.notes ?? "",
      remarks: expense.remarks ?? "",
    });
    setFormErrors({});
    setFormReceiptFiles([]);
    setFormExistingReceipts(expense.receipts || []);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormReceiptFiles([]);
    setFormErrors({});
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

  const uploadReceipts = async (expenseId, files) => {
    if (!expenseId || !files?.length) return null;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("receipts", f));
    const res = await fetch(
      `${apiBaseUrl}/${expenseId}/receipts`,
      {
        method: "PATCH",
        headers: getAuthHeadersNoContentType(),
        credentials: "include",
        body: formData,
      },
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Receipt upload failed");
    return data.data?.expense || null;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    setFormLoading(true);
    try {
      const payload = {
        amount: Number(form.amount),
        ...(isShipper ? { currency: form.currency || "USD" } : {}),
        category: form.category,
        expenseDate:
          form.expenseDate instanceof Date
            ? form.expenseDate.toISOString()
            : form.expenseDate,
        payment: form.payment,
        ...(isShipper
          ? { load: form.load || undefined }
          : {
              truck: form.truck || undefined,
              driver: form.driver || undefined,
              trip: form.trip || undefined,
            }),
        vendor: form.vendor || undefined,
        vendorName: form.vendorName || undefined,
        notes: form.notes || undefined,
        remarks: form.remarks || undefined,
      };

      const url = editingId
        ? `${apiBaseUrl}/${editingId}`
        : `${apiBaseUrl}`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        let savedExpense = data.data?.expense || null;
        const savedId = savedExpense?._id || savedExpense?.id || (editingId ? editingId : null);
        if (savedId && formReceiptFiles.length > 0) {
          const updated = await uploadReceipts(savedId, formReceiptFiles);
          if (updated) savedExpense = updated;
        }
        setFormReceiptFiles([]);
        setFormExistingReceipts(savedExpense?.receipts || []);
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
        `${apiBaseUrl}/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: "include",
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
    } catch {
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
    try {
      const res = await fetch(
        `${apiBaseUrl}/${expense._id}`,
        {
          headers: getAuthHeaders(),
          credentials: "include",
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
    if (isShipper) return;
    if (!selectedExpense) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/${selectedExpense._id}/approve`,
        { method: "PATCH", headers: getAuthHeaders(), credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setSelectedExpense(
          data.data?.expense || { ...selectedExpense, status: "approved" },
        );
        fetchExpenses();
        fetchSummary();
      } else alert(data.message || "Approve failed");
    } catch {
      alert("Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (isShipper) return;
    if (!selectedExpense) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/${selectedExpense._id}/reject`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          credentials: "include",
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
    } catch {
      alert("Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReimburse = async () => {
    if (isShipper) return;
    if (!selectedExpense) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/${selectedExpense._id}/reimburse`,
        { method: "PATCH", headers: getAuthHeaders(), credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setSelectedExpense(
          data.data?.expense || { ...selectedExpense, status: "reimbursed" },
        );
        fetchExpenses();
        fetchSummary();
      } else alert(data.message || "Reimburse failed");
    } catch {
      alert("Reimburse failed");
    } finally {
      setActionLoading(false);
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
      case "paid":
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
    if (normalized === "paid")
      return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleExpenses = normalizedSearchQuery
    ? expenses.filter((row) => {
        const haystack = [
          row.status,
          row.category?.name,
          row.vendor?.name,
          row.vendorName,
          ...(isShipper
            ? [
                row.load?.shipmentNumber,
                row.load?.loadNumber,
                row.load?.referenceNumber,
                row.load?.tripId,
                row.load?._id,
              ]
            : [row.truck?.truckNumber, row.driver?.fullName, row.trip?.tripId]),
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
    const totals = summary?.totals || summary || {};
    const totalCount = Number(totals?.count ?? totals?.totalCount ?? totals?.total ?? summary?.count ?? summary?.totalCount ?? 0);
    const totalAmount = Number(totals?.totalAmount ?? totals?.amount ?? summary?.totalAmount ?? summary?.amount ?? 0);
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
      byStatus: summary?.byStatus || {},
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
          <h1 className="text-2xl font-semibold text-gray-700">
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
                  {isShipper ? "Paid" : "IFTA Fuel"}
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {summaryLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    isShipper
                      ? Number(effectiveSummary.byStatus?.paid ?? 0).toLocaleString()
                      : `$${Number(effectiveSummary.iftaFuel?.totalFuelAmount ?? 0).toLocaleString()}`
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
              placeholder={isShipper ? "Search category, load, vendor, status..." : "Search category, truck, driver, vendor, status..."}
              className="h-12 w-full flex-1 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
            />
           <button
  type="button"
  onClick={openAddForm}
  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-base font-medium text-white"
  style={{
    backgroundColor: "#1976d2",
    border: "1px solid #1976d2",
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.backgroundColor = "#1565c0")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.backgroundColor = "#1976d2")
  }
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
              options={statusOptions}
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

            {isShipper ? (
              <>
                <FilterDropdown
                  label="Vendor"
                  value={filters.vendor}
                  onChange={(v) => handleFilterChange("vendor", v)}
                  options={[
                    { value: "", label: "All" },
                    ...vendors.map((v) => ({ value: v._id, label: v.name })),
                  ]}
                />
                <FilterDropdown
                  label="Load"
                  value={filters.load}
                  onChange={(v) => handleFilterChange("load", v)}
                  options={[
                    { value: "", label: "All" },
                    ...loads.map((l) => ({
                      value: l._id,
                      label: l.shipmentNumber || l.loadNumber || l.referenceNumber || l._id,
                    })),
                  ]}
                />
              </>
            ) : (
              <FilterDropdown
                label="Truck"
                value={filters.truck}
                onChange={(v) => handleFilterChange("truck", v)}
                options={[
                  { value: "", label: "All" },
                  ...trucks.map((t) => ({ value: t._id, label: t.truckNumber })),
                ]}
              />
            )}

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
                      {isShipper ? (
                        <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                          Load
                        </th>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                            Truck
                          </th>
                          <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                            Driver
                          </th>
                        </>
                      )}
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
                          colSpan={isShipper ? 7 : 8}
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
                          {isShipper ? (
                            <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                              {row.load?.shipmentNumber || row.load?.loadNumber || row.load?.referenceNumber || "—"}
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                                {row.truck?.truckNumber ?? "—"}
                              </td>
                              <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                                {row.driver?.fullName ?? "—"}
                              </td>
                            </>
                          )}
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
                              {((isShipper && row.status !== "paid") || (!isShipper && row.status !== "reimbursed")) && (
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
          onClose={closeForm}
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
                <div className="mb-3 text-base font-semibold text-blue-700">Basic Information</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Amount (USD)</div>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => handleFormChange("amount", e.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                    {formErrors.amount ? (
                      <div className="mt-1 text-xs font-medium text-red-600">{formErrors.amount}</div>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Category</div>
                    <div className="mt-2">
                      <FilterDropdown
                        label="Category"
                        value={form.category}
                        onChange={(v) => handleFormChange("category", v)}
                        options={[
                          { value: "", label: "Select category" },
                          ...categories.map((c) => ({ value: c._id, label: c.name })),
                        ]}
                        hideLabel
                        containerClassName="w-full"
                        buttonClassName="h-10 rounded-lg px-3 text-sm"
                        placeholder="Select category"
                        searchable
                        searchPlaceholder="Search category..."
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-600">
                        {categories.length === 0 ? "No categories yet." : `${categories.length} category(ies) available.`}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryCreateError("");
                          setCategoryCreateOpen(true);
                        }}
                        className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-3 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        <Add fontSize="small" />
                        Add Category
                      </button>
                    </div>
                    {formErrors.category ? (
                      <div className="mt-1 text-xs font-medium text-red-600">{formErrors.category}</div>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Expense Date</div>
                    <input
                      type="date"
                      value={
                        form.expenseDate
                          ? format(
                              form.expenseDate instanceof Date ? form.expenseDate : new Date(form.expenseDate),
                              "yyyy-MM-dd",
                            )
                          : ""
                      }
                      onChange={(e) =>
                        handleFormChange("expenseDate", e.target.value ? new Date(e.target.value) : null)
                      }
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                    {formErrors.expenseDate ? (
                      <div className="mt-1 text-xs font-medium text-red-600">{formErrors.expenseDate}</div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="mb-3 text-base font-semibold text-emerald-700">Payment & Assignment</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Payment Method</div>
                    <div className="mt-2">
                      <FilterDropdown
                        label="Payment Method"
                        value={form.payment?.method}
                        onChange={(v) => handlePaymentChange("method", v)}
                        options={paymentMethods.map((p) => ({ value: p.value, label: p.label }))}
                        hideLabel
                        containerClassName="w-full"
                        buttonClassName="h-10 rounded-lg px-3 text-sm"
                        placeholder="Select payment method"
                        searchable
                        searchPlaceholder="Search payment method..."
                      />
                    </div>
                    {formErrors.payment ? (
                      <div className="mt-1 text-xs font-medium text-red-600">{formErrors.payment}</div>
                    ) : null}
                  </div>

                  {form.payment?.method === "card" ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">Card last 4 digits</div>
                      <input
                        value={form.payment?.cardLastFour ?? ""}
                        onChange={(e) => handlePaymentChange("cardLastFour", e.target.value)}
                        maxLength={4}
                        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                      />
                    </div>
                  ) : (
                    <div className="hidden md:block" />
                  )}

                  {isShipper ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">Load</div>
                      <div className="mt-2">
                        <FilterDropdown
                          label="Load"
                          value={form.load}
                          onChange={(v) => handleFormChange("load", v)}
                          options={[
                            { value: "", label: "Select load" },
                            ...loads.map((l) => ({
                              value: l._id,
                              label: l.shipmentNumber || l.loadNumber || l.referenceNumber || l._id,
                            })),
                          ]}
                          hideLabel
                          containerClassName="w-full"
                          buttonClassName="h-10 rounded-lg px-3 text-sm"
                          placeholder="Select load"
                          searchable
                          searchPlaceholder="Search load..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">Truck</div>
                      <div className="mt-2">
                        <FilterDropdown
                          label="Truck"
                          value={form.truck}
                          onChange={(v) => handleFormChange("truck", v)}
                          options={[
                            { value: "", label: "Select truck" },
                            ...trucks.map((t) => ({ value: t._id, label: t.truckNumber })),
                          ]}
                          hideLabel
                          containerClassName="w-full"
                          buttonClassName="h-10 rounded-lg px-3 text-sm"
                          placeholder="Select truck"
                          searchable
                          searchPlaceholder="Search truck..."
                        />
                      </div>
                    </div>
                  )}

                  {!isShipper ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">Driver</div>
                      <div className="mt-2">
                        <FilterDropdown
                          label="Driver"
                          value={form.driver}
                          onChange={(v) => handleFormChange("driver", v)}
                          options={[
                            { value: "", label: "Select driver" },
                            ...drivers.map((d) => ({ value: d._id, label: d.fullName })),
                          ]}
                          hideLabel
                          containerClassName="w-full"
                          buttonClassName="h-10 rounded-lg px-3 text-sm"
                          placeholder="Select driver"
                          searchable
                          searchPlaceholder="Search driver..."
                        />
                      </div>
                    </div>
                  ) : null}

                  {!isShipper ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">Trip</div>
                      <div className="mt-2">
                        <FilterDropdown
                          label="Trip"
                          value={form.trip}
                          onChange={(v) => handleFormChange("trip", v)}
                          options={[
                            { value: "", label: "Select trip" },
                            ...trips.map((t) => ({ value: t._id, label: t.tripId })),
                          ]}
                          hideLabel
                          containerClassName="w-full"
                          buttonClassName="h-10 rounded-lg px-3 text-sm"
                          placeholder="Select trip"
                          searchable
                          searchPlaceholder="Search trip..."
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Vendor</div>
                    <div className="mt-2">
                      <FilterDropdown
                        label="Vendor"
                        value={form.vendor}
                        onChange={(v) => handleFormChange("vendor", v)}
                        options={[
                          { value: "", label: "Select vendor" },
                          ...vendors.map((v) => ({ value: v._id, label: v.name })),
                        ]}
                        hideLabel
                        containerClassName="w-full"
                        buttonClassName="h-10 rounded-lg px-3 text-sm"
                        placeholder="Select vendor"
                        searchable
                        searchPlaceholder="Search vendor..."
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-600">
                        {vendors.length === 0 ? "No vendors yet." : `${vendors.length} vendor(s) available.`}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVendorCreateError("");
                          setVendorCreateOpen(true);
                        }}
                        className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-3 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        <Add fontSize="small" />
                        Add Vendor
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                <div className="mb-3 text-base font-semibold text-violet-700">Notes & Receipts</div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Vendor name (if no vendor)</div>
                    <input
                      value={form.vendorName}
                      onChange={(e) => handleFormChange("vendorName", e.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Notes</div>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => handleFormChange("notes", e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Receipts</div>
                  {formReceiptFiles.length > 0 ? (
                    <div className="mt-2">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {formReceiptPreviews.map((p) => (
                          <a
                            key={p.key}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                          >
                            {p.isPdf ? (
                              <div className="grid h-24 place-items-center text-xs font-semibold text-slate-700">PDF</div>
                            ) : (
                              <img
                                src={p.url}
                                alt={p.name}
                                className="h-24 w-full object-cover transition group-hover:scale-[1.02]"
                              />
                            )}
                            <div className="truncate border-t border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                              {p.name}
                            </div>
                          </a>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-slate-600">These receipts will upload when you click Save.</div>
                    </div>
                  ) : Array.isArray(formExistingReceipts) && formExistingReceipts.length > 0 ? (
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {formExistingReceipts.map((r, i) => {
                        const url = r?.url || "";
                        const fileName = r?.fileName || "Receipt";
                        const isPdf =
                          String(url).toLowerCase().endsWith(".pdf") || String(fileName).toLowerCase().endsWith(".pdf");
                        return (
                          <a
                            key={`${url}-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                          >
                            {isPdf ? (
                              <div className="grid h-24 place-items-center text-xs font-semibold text-slate-700">PDF</div>
                            ) : (
                              <img
                                src={url}
                                alt={fileName}
                                className="h-24 w-full object-cover transition group-hover:scale-[1.02]"
                              />
                            )}
                            <div className="truncate border-t border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                              {fileName}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-slate-600">No receipts added yet</div>
                  )}

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFormReceiptFiles(files);
                        e.target.value = "";
                      }}
                      className="cursor-pointer w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-slate-200"
                    />
                  </div>
                  {formReceiptFiles.length > 0 ? (
                    <div className="mt-2 text-sm font-medium text-slate-700">{formReceiptFiles.length} file(s) selected</div>
                  ) : null}
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
              onClick={closeForm}
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
                  {isShipper ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="text-sm font-semibold text-slate-500">
                          Load
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedExpense.load?.shipmentNumber ||
                            selectedExpense.load?.loadNumber ||
                            selectedExpense.load?.referenceNumber ||
                            "—"}
                        </div>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                  <div className="mb-3 text-base font-semibold text-violet-700">
                    Notes & Receipts
                  </div>
                  <div className="grid grid-cols-1 gap-4">
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
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {selectedExpense.receipts.map((r, i) => {
                            const url = r?.url || "";
                            const fileName = r?.fileName || "Receipt";
                            const isPdf =
                              String(url).toLowerCase().endsWith(".pdf") || String(fileName).toLowerCase().endsWith(".pdf");
                            return (
                              <a
                                key={`${url}-${i}`}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                              >
                                {isPdf ? (
                                  <div className="grid h-24 place-items-center text-xs font-semibold text-slate-700">PDF</div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={fileName}
                                    className="h-24 w-full object-cover transition group-hover:scale-[1.02]"
                                  />
                                )}
                                <div className="truncate border-t border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                                  {fileName}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-slate-900">—</div>
                      )}
                    </div>
                  </div>
                </div>

                {!isShipper && selectedExpense.status === "pending" && (
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

                {!isShipper && selectedExpense.status === "approved" && (
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

        <Dialog
          open={categoryCreateOpen}
          onClose={() => {
            if (!categoryCreateLoading) setCategoryCreateOpen(false);
          }}
          maxWidth="xs"
          fullWidth
          PaperProps={{ className: "overflow-hidden rounded-2xl" }}
        >
          <DialogTitle sx={{ backgroundColor: brand, color: "#fff" }}>
            Add Category
          </DialogTitle>
          <DialogContent className="bg-white p-5">
            <div className="grid grid-cols-1 gap-4">
              <TextField
                fullWidth
                size="small"
                label="Name"
                value={categoryDraft.name}
                onChange={(e) => setCategoryDraft((p) => ({ ...p, name: e.target.value }))}
              />
              <TextField
                fullWidth
                size="small"
                label="Code"
                value={categoryDraft.code}
                onChange={(e) => setCategoryDraft((p) => ({ ...p, code: e.target.value }))}
              />
              {categoryCreateError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {categoryCreateError}
                </div>
              ) : null}
            </div>
          </DialogContent>
          <DialogActions className="border-t border-slate-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={() => setCategoryCreateOpen(false)}
              disabled={categoryCreateLoading}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createCategory}
              disabled={categoryCreateLoading}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {categoryCreateLoading ? <CircularProgress size={18} className="text-white" /> : "Save"}
            </button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={vendorCreateOpen}
          onClose={() => {
            if (!vendorCreateLoading) setVendorCreateOpen(false);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{ className: "overflow-hidden rounded-2xl" }}
        >
          <DialogTitle sx={{ backgroundColor: brand, color: "#fff" }}>
            Add Vendor
          </DialogTitle>
          <DialogContent className="bg-white p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                fullWidth
                size="small"
                label="Name"
                value={vendorDraft.name}
                onChange={(e) => setVendorDraft((p) => ({ ...p, name: e.target.value }))}
              />
              <TextField
                fullWidth
                size="small"
                label="Phone"
                value={vendorDraft.phone}
                onChange={(e) => setVendorDraft((p) => ({ ...p, phone: e.target.value }))}
              />
              <TextField
                fullWidth
                size="small"
                label="Email"
                value={vendorDraft.email}
                onChange={(e) => setVendorDraft((p) => ({ ...p, email: e.target.value }))}
              />
              <TextField
                fullWidth
                size="small"
                label="Contact Person"
                value={vendorDraft.contactPerson}
                onChange={(e) => setVendorDraft((p) => ({ ...p, contactPerson: e.target.value }))}
              />
              <TextField
                fullWidth
                size="small"
                label="Address"
                value={vendorDraft.address}
                onChange={(e) => setVendorDraft((p) => ({ ...p, address: e.target.value }))}
                className="md:col-span-2"
              />
              <TextField
                fullWidth
                size="small"
                label="Notes"
                value={vendorDraft.notes}
                onChange={(e) => setVendorDraft((p) => ({ ...p, notes: e.target.value }))}
                className="md:col-span-2"
              />
              {vendorCreateError ? (
                <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {vendorCreateError}
                </div>
              ) : null}
            </div>
          </DialogContent>
          <DialogActions className="border-t border-slate-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={() => setVendorCreateOpen(false)}
              disabled={vendorCreateLoading}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createVendor}
              disabled={vendorCreateLoading}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {vendorCreateLoading ? <CircularProgress size={18} className="text-white" /> : "Save"}
            </button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default ExpenseTracking;
