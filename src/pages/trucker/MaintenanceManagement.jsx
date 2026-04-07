import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload, X, Eye, Pencil, Trash2, Plus, RefreshCw, LayoutGrid, BarChart3, Zap, Calendar, Clock, CheckCircle2, ZapOff, ChevronDown, Check, AlertTriangle } from "lucide-react";
import { BASE_API_URL } from "../../apiConfig";

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom" },
];

const pad2 = (n) => String(n).padStart(2, "0");

const toYmd = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const ymdToIsoStart = (ymd) => {
  if (!ymd) return "";
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return startOfDay(d);
};

const FilterSelect = ({ label, value, options, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = useMemo(() => options.find((o) => o.value === value) || null, [options, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <div className="mb-1 text-sm font-semibold text-slate-700">{label}</div>
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        className="cursor-pointer flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-base text-slate-900 outline-none transition hover:bg-slate-50 focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="min-w-0 truncate">{selected?.label ?? "All"}</span>
        <ChevronDown size={18} className={`shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="max-h-64 overflow-auto py-1">
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={`${label}-${String(o.value)}`}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-base transition ${
                    active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0 truncate">{o.label}</span>
                  {active ? <Check size={16} className="shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
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
      {hideLabel ? null : <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
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
              <div id={listboxId} role="listbox" className="max-h-72 overflow-auto py-1">
                {visibleOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">No results</div>
                ) : (
                  visibleOptions.map((o) => {
                    const active = o.value === value;
                    return (
                      <button
                        key={`${label}-${String(o.value)}`}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onChange(o.value);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm ${
                          active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{o.label}</span>
                        {active ? <Check size={16} className="shrink-0 text-blue-600" /> : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const endOfWeek = (date) => {
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  return endOfDay(e);
};

const startOfMonth = (date) => startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
const endOfMonth = (date) => endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

const subDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
};

const subMonths = (date, n) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - n);
  return d;
};

const buildRange = (preset) => {
  const now = new Date();
  if (preset === "today") return { from: startOfDay(now), to: endOfDay(now) };
  if (preset === "yesterday") {
    const y = subDays(now, 1);
    return { from: startOfDay(y), to: endOfDay(y) };
  }
  if (preset === "last_7_days") return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
  if (preset === "this_week") return { from: startOfWeek(now), to: endOfWeek(now) };
  if (preset === "last_week") {
    const lastWeek = subDays(now, 7);
    return { from: startOfWeek(lastWeek), to: endOfWeek(lastWeek) };
  }
  if (preset === "this_month") return { from: startOfMonth(now), to: endOfMonth(now) };
  if (preset === "last_month") {
    const lastMonth = subMonths(now, 1);
    return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
  }
  return { from: null, to: null };
};

const badgeClassForStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "in_progress") return "bg-sky-50 text-sky-700 border-sky-200";
  if (s === "cancelled") return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

const badgeClassForPriority = (priority) => {
  const p = String(priority || "").toLowerCase();
  if (p === "critical") return "bg-red-50 text-red-700 border-red-200";
  if (p === "high") return "bg-amber-50 text-amber-700 border-amber-200";
  if (p === "medium") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const ModalShell = ({ open, title, onClose, children, footer, header, bodyClassName = "", panelClassName = "" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className={`relative my-8 w-full max-w-2xl overflow-hidden rounded-xl bg-white ${panelClassName}`}>
          {header ? (
            header
          ) : (
            <div className="flex items-center justify-between bg-blue-600 px-5 py-4">
              <div className="text-base font-semibold text-white">{title}</div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-md p-1 text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className={bodyClassName || "max-h-[60vh] overflow-y-auto px-6 pb-6 pt-7"}>{children}</div>
          {footer ? <div className="border-t border-slate-200 bg-white px-6 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
};

const MaintenanceManagement = () => {

  const [optionsLoading, setOptionsLoading] = useState(false);
  const [options, setOptions] = useState({
    types: ["tyre", "engine", "service", "breakdown"],
    statuses: ["planned", "in_progress", "completed", "cancelled"],
    priorities: ["low", "medium", "high", "critical"],
  });
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const [recordsLoading, setRecordsLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const [filters, setFilters] = useState({
    type: "",
    status: "",
    priority: "",
    truck: "",
    q: "",
    from: "",
    to: "",
  });
  const [dateRangePreset, setDateRangePreset] = useState("all");

  const [toast, setToast] = useState({ open: false, type: "success", message: "" });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [activeId, setActiveId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    truck: "",
    driver: "",
    vendor: "",
    vendorName: "",
    type: "service",
    title: "",
    description: "",
    serviceDate: "",
    status: "planned",
    priority: "medium",
    costAmount: "",
    costCurrency: "USD",
    odometer: "",
    nextDueDate: "",
    nextDueOdometer: "",
    position: "",
    action: "",
    workDone: "",
    serviceType: "",
    checklist: "",
    breakdownType: "",
    severity: "",
    pendingAttachments: [],
  });
  const [pendingAttachmentPreviews, setPendingAttachmentPreviews] = useState([]);
  const [formExistingAttachments, setFormExistingAttachments] = useState([]);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ open: true, type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast((p) => ({ ...p, open: false })), 3500);
  }, []);

  useEffect(() => {
    const files = form.pendingAttachments || [];
    if (!files.length) {
      setPendingAttachmentPreviews([]);
      return;
    }

    const urls = [];
    const next = files.map((file) => {
      const url = URL.createObjectURL(file);
      urls.push(url);
      const name = file?.name || "Attachment";
      const type = String(file?.type || "").toLowerCase();
      const isImage = type.startsWith("image/");
      const isPdf = type === "application/pdf" || String(name).toLowerCase().endsWith(".pdf");
      return {
        key: `${name}-${file?.size || 0}-${file?.lastModified || 0}`,
        url,
        name,
        isImage,
        isPdf,
      };
    });

    setPendingAttachmentPreviews(next);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [form.pendingAttachments]);

  const request = useCallback(async (path, optionsArg = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      ...(optionsArg.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(`${BASE_API_URL}/api/v1/maintenance-management${path}`, {
      ...optionsArg,
      headers,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      const message = json?.message || `HTTP error! status: ${res.status}`;
      throw new Error(message);
    }
    return json;
  }, []);

  const loadDropdowns = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [opt, tr, dr, ve] = await Promise.all([
        request("/options", { method: "GET" }),
        request("/trucks", { method: "GET" }),
        request("/drivers", { method: "GET" }),
        request("/vendors", { method: "GET" }),
      ]);
      const nextOptions = opt?.data || {};
      setOptions((prev) => ({
        types: Array.isArray(nextOptions.types) ? nextOptions.types : prev.types,
        statuses: Array.isArray(nextOptions.statuses) ? nextOptions.statuses : prev.statuses,
        priorities: Array.isArray(nextOptions.priorities) ? nextOptions.priorities : prev.priorities,
      }));
      setTrucks(tr?.data?.trucks || []);
      setDrivers(dr?.data?.drivers || []);
      setVendors(ve?.data?.vendors || []);
    } catch (e) {
      showToast(e.message || "Failed to load dropdowns", "error");
    } finally {
      setOptionsLoading(false);
    }
  }, [request, showToast]);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await request("/summary", { method: "GET" });
      setSummary(res?.data || null);
    } catch (e) {
      showToast(e.message || "Failed to load summary", "error");
    } finally {
      setSummaryLoading(false);
    }
  }, [request, showToast]);

  const listQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.truck) params.set("truck", filters.truck);
    if (filters.q?.trim()) params.set("q", filters.q.trim());
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [filters, pagination.limit, pagination.page]);

  const loadRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const res = await request(`${listQuery}`, { method: "GET" });
      const data = res?.data || {};
      setRecords(data.records || []);
      const pg = data.pagination || {};
      setPagination((prev) => ({
        ...prev,
        page: pg.page || prev.page,
        limit: pg.limit || prev.limit,
        total: pg.total || 0,
      }));
    } catch (e) {
      showToast(e.message || "Failed to load records", "error");
    } finally {
      setRecordsLoading(false);
    }
  }, [listQuery, request, showToast]);

  useEffect(() => {
    loadDropdowns();
    loadSummary();
  }, [loadDropdowns, loadSummary]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const applyDatePreset = useCallback((preset) => {
    setDateRangePreset(preset);
    if (preset === "all") {
      setFilters((prev) => ({ ...prev, from: "", to: "" }));
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    if (preset === "custom") {
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    const { from, to } = buildRange(preset);
    setFilters((prev) => ({ ...prev, from: toYmd(from), to: toYmd(to) }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ type: "", status: "", priority: "", truck: "", q: "", from: "", to: "" });
    setDateRangePreset("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      truck: "",
      driver: "",
      vendor: "",
      vendorName: "",
      type: "service",
      title: "",
      description: "",
      serviceDate: "",
      status: "planned",
      priority: "medium",
      costAmount: "",
      costCurrency: "USD",
      odometer: "",
      nextDueDate: "",
      nextDueOdometer: "",
      position: "",
      action: "",
      workDone: "",
      serviceType: "",
      checklist: "",
      breakdownType: "",
      severity: "",
      pendingAttachments: [],
    });
    setFormExistingAttachments([]);
  }, []);

  const openCreate = useCallback(() => {
    setFormMode("create");
    setActiveId(null);
    resetForm();
    setFormOpen(true);
  }, [resetForm]);

  const openEdit = useCallback(
    async (id) => {
      setFormMode("edit");
      setActiveId(id);
      setFormOpen(true);
      setFormLoading(true);
      try {
        const res = await request(`/${id}`, { method: "GET" });
        const record = res?.data?.record || null;
        if (!record) throw new Error("Record not found");
        setFormExistingAttachments(Array.isArray(record.attachments) ? record.attachments : []);
        setForm((prev) => ({
          ...prev,
          truck: record?.truck?._id || record?.truck || "",
          driver: record?.driver?._id || record?.driver || "",
          vendor: record?.vendor?._id || record?.vendor || "",
          vendorName: record?.vendorName || "",
          type: record?.type || "service",
          title: record?.title || "",
          description: record?.description || "",
          serviceDate: record?.serviceDate ? String(record.serviceDate).slice(0, 10) : "",
          status: record?.status || "planned",
          priority: record?.priority || "medium",
          costAmount: record?.cost?.amount != null ? String(record.cost.amount) : "",
          costCurrency: record?.cost?.currency || "USD",
          odometer: record?.odometer != null ? String(record.odometer) : "",
          nextDueDate: record?.nextDue?.date ? String(record.nextDue.date).slice(0, 10) : "",
          nextDueOdometer: record?.nextDue?.odometer != null ? String(record.nextDue.odometer) : "",
          position: record?.position || "",
          action: record?.action || "",
          workDone: record?.workDone || "",
          serviceType: record?.serviceType || "",
          checklist: Array.isArray(record?.checklist) ? record.checklist.join(", ") : "",
          breakdownType: record?.breakdownType || "",
          severity: record?.severity || "",
          pendingAttachments: [],
        }));
      } catch (e) {
        showToast(e.message || "Failed to load record", "error");
      } finally {
        setFormLoading(false);
      }
    },
    [request, showToast]
  );

  const openView = useCallback(
    async (id) => {
      setViewOpen(true);
      setViewLoading(true);
      setViewRecord(null);
      try {
        const res = await request(`/${id}`, { method: "GET" });
        setViewRecord(res?.data?.record || null);
      } catch (e) {
        showToast(e.message || "Failed to load record", "error");
      } finally {
        setViewLoading(false);
      }
    },
    [request, showToast]
  );

  const openDelete = useCallback((id) => {
    setActiveId(id);
    setDeleteOpen(true);
  }, []);

  const uploadAttachments = useCallback(
    async (id, fileList, showToastMessage = true) => {
      if (!id || !fileList?.length) return false;
      const fd = new FormData();
      Array.from(fileList).forEach((f) => fd.append("attachments", f));
      try {
        await request(`/${id}/attachments`, { method: "PATCH", body: fd });
        if (showToastMessage) showToast("Attachments uploaded");
        if (viewOpen) {
          const res = await request(`/${id}`, { method: "GET" });
          setViewRecord(res?.data?.record || null);
        }
        return true;
      } catch (e) {
        showToast(e.message || "Failed to upload attachments", "error");
        return false;
      } finally {
        await Promise.all([loadRecords(), loadSummary()]);
      }
    },
    [loadRecords, loadSummary, request, showToast, viewOpen]
  );

  const saveRecord = useCallback(async () => {
    if (!form.truck || !form.type || !form.title?.trim() || !form.serviceDate) {
      showToast("Truck, Type, Title, and Service Date are required", "error");
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        truck: form.truck,
        type: form.type,
        title: form.title.trim(),
        serviceDate: ymdToIsoStart(form.serviceDate),
      };

      if (form.driver) payload.driver = form.driver;
      if (form.description?.trim()) payload.description = form.description.trim();
      if (form.status) payload.status = form.status;
      if (form.priority) payload.priority = form.priority;
      if (form.vendor) payload.vendor = form.vendor;
      if (!form.vendor && form.vendorName?.trim()) payload.vendorName = form.vendorName.trim();

      if (form.costAmount !== "") {
        const amount = Number(form.costAmount);
        if (!Number.isNaN(amount)) payload.cost = { amount, currency: form.costCurrency || "USD" };
      }
      if (form.odometer !== "") {
        const odometer = Number(form.odometer);
        if (!Number.isNaN(odometer)) payload.odometer = odometer;
      }
      if (form.nextDueDate || form.nextDueOdometer !== "") {
        const nextDue = {};
        if (form.nextDueDate) nextDue.date = ymdToIsoStart(form.nextDueDate);
        if (form.nextDueOdometer !== "") {
          const od = Number(form.nextDueOdometer);
          if (!Number.isNaN(od)) nextDue.odometer = od;
        }
        if (Object.keys(nextDue).length) payload.nextDue = nextDue;
      }

      if (form.type === "tyre") {
        if (form.position) payload.position = form.position;
        if (form.action) payload.action = form.action;
      } else if (form.type === "engine") {
        if (form.action) payload.action = form.action;
        if (form.workDone) payload.workDone = form.workDone;
      } else if (form.type === "service") {
        if (form.serviceType) payload.serviceType = form.serviceType;
        if (form.checklist?.trim()) {
          payload.checklist = form.checklist
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else if (form.type === "breakdown") {
        if (form.breakdownType) payload.breakdownType = form.breakdownType;
        if (form.severity) payload.severity = form.severity;
      }

      if (formMode === "create") {
          const res = await request("", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          
          const newRecordId = res?.data?.record?._id || res?.data?._id;
          
          let uploaded = false;
          if (newRecordId && form.pendingAttachments && form.pendingAttachments.length > 0) {
            uploaded = await uploadAttachments(newRecordId, form.pendingAttachments, false);
          }
          
          showToast(uploaded ? "Record created and attachments uploaded" : "Record created");
        } else {
        await request(`/${activeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        let uploaded = false;
        if (activeId && form.pendingAttachments && form.pendingAttachments.length > 0) {
          uploaded = await uploadAttachments(activeId, form.pendingAttachments, false);
        }
        showToast(uploaded ? "Record updated and attachments uploaded" : "Record updated");
      }

      setFormOpen(false);
      setActiveId(null);
      setForm((prev) => ({ ...prev, pendingAttachments: [] }));
      await Promise.all([loadRecords(), loadSummary()]);
    } catch (e) {
      showToast(e.message || "Failed to save record", "error");
    } finally {
      setFormLoading(false);
    }
  }, [activeId, form, formMode, loadRecords, loadSummary, request, showToast, uploadAttachments]);

  const confirmDelete = useCallback(async () => {
    if (!activeId) return;
    setDeleteLoading(true);
    try {
      await request(`/${activeId}`, { method: "DELETE" });
      showToast("Record deleted");
      setDeleteOpen(false);
      setActiveId(null);
      await Promise.all([loadRecords(), loadSummary()]);
    } catch (e) {
      showToast(e.message || "Failed to delete record", "error");
    } finally {
      setDeleteLoading(false);
    }
  }, [activeId, loadRecords, loadSummary, request, showToast]);

  const summaryCards = useMemo(() => {
    const byStatus = summary?.countsByStatus || {};
    const due = summary?.due || {};
    const planned = byStatus.planned || 0;
    const inProgress = byStatus.in_progress || 0;
    const completed = byStatus.completed || 0;
    const cancelled = byStatus.cancelled || 0;
    const totalFromStatuses = Object.values(byStatus).reduce((acc, v) => acc + (Number(v) || 0), 0);
    const total = Number(summary?.totalCount) || totalFromStatuses || planned + inProgress + completed + cancelled;
    return {
      top: [
        { label: "Total Count", value: total, icon: LayoutGrid, iconWrapClass: "bg-emerald-50 text-emerald-700" },
        { label: "Upcoming (7d)", value: due.upcomingIn7Days || 0, icon: BarChart3, iconWrapClass: "bg-blue-50 text-blue-700" },
        { label: "Overdue", value: due.overdue || 0, icon: Zap, iconWrapClass: "bg-red-50 text-red-700" },
      ],
      bottom: [
        { label: "Planned", value: planned, icon: Calendar, iconWrapClass: "bg-amber-50 text-amber-700" },
        { label: "In Progress", value: inProgress, icon: Clock, iconWrapClass: "bg-sky-50 text-sky-700" },
        { label: "Completed", value: completed, icon: CheckCircle2, iconWrapClass: "bg-green-50 text-green-700" },
        { label: "Cancelled", value: cancelled, icon: ZapOff, iconWrapClass: "bg-slate-100 text-slate-700" },
      ],
    };
  }, [summary]);

  const totalPages = useMemo(() => {
    const limit = pagination.limit || 20;
    const total = pagination.total || 0;
    return Math.max(1, Math.ceil(total / limit));
  }, [pagination.limit, pagination.total]);

  const onChangePage = (nextPage) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    setPagination((prev) => ({ ...prev, page: clamped }));
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-gray-700">Maintenance Management</div>
          <div className="text-sm text-slate-500">Track scheduled service, breakdowns, costs, and due maintenance</div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {summaryCards.top.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="flex min-h-[110px] items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="min-w-0">
                  <div className="text-base font-semibold text-gray-600">{c.label}</div>
                  <div className="mt-3 text-2xl font-bold leading-none text-slate-900 sm:text-2xl">{summaryLoading ? "…" : c.value}</div>
                </div>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-1 ring-black/5 ${c.iconWrapClass}`}>
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryCards.bottom.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="flex min-h-[110px] items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="min-w-0">
                  <div className="text-base font-semibold text-gray-600">{c.label}</div>
                  <div className="mt-3 text-2xl font-bold leading-none text-slate-900 sm:text-2xl">{summaryLoading ? "…" : c.value}</div>
                </div>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-1 ring-black/5 ${c.iconWrapClass}`}>
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:flex-1">
            <input
              value={filters.q}
              onChange={(e) => {
                setFilters((p) => ({ ...p, q: e.target.value }));
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
            <button
              type="button"
              onClick={() => {
                loadSummary();
                loadRecords();
              }}
              disabled={summaryLoading || recordsLoading}
              className="cursor-pointer inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={summaryLoading || recordsLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="cursor-pointer inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-base font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={20} />
              New Record
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-2">
            <FilterSelect
              label="Type"
              value={filters.type}
              options={[{ value: "", label: "All" }, ...options.types.map((t) => ({ value: t, label: t }))]}
              onChange={(next) => {
                setFilters((p) => ({ ...p, type: next }));
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              disabled={optionsLoading}
            />
          </div>

          <div className="md:col-span-2">
            <FilterSelect
              label="Status"
              value={filters.status}
              options={[{ value: "", label: "All" }, ...options.statuses.map((s) => ({ value: s, label: s }))]}
              onChange={(next) => {
                setFilters((p) => ({ ...p, status: next }));
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              disabled={optionsLoading}
            />
          </div>

          <div className="md:col-span-2">
            <FilterSelect
              label="Priority"
              value={filters.priority}
              options={[{ value: "", label: "All" }, ...options.priorities.map((p) => ({ value: p, label: p }))]}
              onChange={(next) => {
                setFilters((p) => ({ ...p, priority: next }));
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              disabled={optionsLoading}
            />
          </div>

          <div className="md:col-span-3">
            <FilterSelect
              label="Truck"
              value={filters.truck}
              options={[
                { value: "", label: "All" },
                ...trucks.map((t) => ({
                  value: t._id,
                  label: t.truckNumber || t._id,
                })),
              ]}
              onChange={(next) => {
                setFilters((p) => ({ ...p, truck: next }));
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              disabled={optionsLoading}
            />
          </div>

          <div className="md:col-span-2">
            <FilterSelect
              label="Date Range"
              value={dateRangePreset}
              options={DATE_RANGE_OPTIONS}
              onChange={(next) => applyDatePreset(next)}
              disabled={false}
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-black"
            >
              Clear
            </button>
          </div>

          {dateRangePreset === "custom" ? (
            <>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">From</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => {
                    setFilters((p) => ({ ...p, from: e.target.value }));
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="cursor-pointer h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">To</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => {
                    setFilters((p) => ({ ...p, to: e.target.value }));
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="cursor-pointer h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </>
          ) : null}

          <div className="md:col-span-12">
            <div className="text-xs text-slate-500">{optionsLoading ? "Loading dropdown options…" : ""}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="grid grid-cols-[120px_1.6fr_120px_140px_120px_140px_120px_220px] items-center gap-4 text-base font-semibold text-slate-600">
                <div>Type</div>
                <div>Title</div>
                <div>Truck</div>
                <div>Status</div>
                <div>Priority</div>
                <div>Service Date</div>
                <div>Cost</div>
                <div className="text-center">Actions</div>
              </div>
            </div>

            {recordsLoading ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">Loading…</div>
            ) : records.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No records found</div>
            ) : (
              <div className="mt-4 space-y-4">
                {records.map((r) => (
                  <div
                    key={r._id}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-5 transition hover:bg-slate-50"
                  >
                    <div className="grid grid-cols-[120px_1.6fr_120px_140px_120px_140px_120px_220px] items-center gap-4">
                      <div>
                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 font-medium text-gray-700">
                          {r.type || "—"}
                        </span>
                      </div>
                      <div className="min-w-0 truncate font-medium text-gray-700">{r.title || "—"}</div>
                      <div className="font-medium text-gray-700">{r.truck?.truckNumber || "—"}</div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-4 py-1 font-medium text-gray-700 ${badgeClassForStatus(r.status)}`}
                        >
                          {r.status || "planned"}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-4 py-1 font-medium text-gray-700 ${badgeClassForPriority(r.priority)}`}
                        >
                          {r.priority || "medium"}
                        </span>
                      </div>
                      <div className="font-medium text-gray-700">{r.serviceDate ? String(r.serviceDate).slice(0, 10) : "—"}</div>
                      <div className="font-medium text-gray-700">
                        {r.cost?.amount != null ? `${r.cost.currency || ""} ${r.cost.amount}` : "—"}
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => openView(r._id)}
                          className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md border border-blue-500 bg-white px-4 text-base font-medium text-blue-600 hover:bg-blue-500 hover:text-white"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(r._id)}
                          className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md border border-cyan-500 bg-white px-4 text-base font-medium text-cyan-700 hover:bg-cyan-500 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(r._id)}
                          className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md border border-red-500 bg-white px-4 text-base font-medium text-red-600 hover:bg-red-500 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            {(() => {
              const total = pagination.total || 0;
              if (!total) return "Showing 0 to 0 of 0 records";
              const start = (pagination.page - 1) * pagination.limit + 1;
              const end = Math.min(total, pagination.page * pagination.limit);
              return `Showing ${start} to ${end} of ${total} records`;
            })()}
          </div>

          <div className="flex flex-wrap items-center gap-4 mr-45">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="font-semibold">Rows per page</div>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                className="cursor-pointer h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-black"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => onChangePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="cursor-pointer text-sm font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700">
              {pagination.page}
            </div>

            <button
              type="button"
              onClick={() => onChangePage(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="cursor-pointer text-sm font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ModalShell
       open={formOpen}
title={
  <span style={{ fontSize: "22px", fontWeight: "600" }}>
    {formMode === "create" ? "Create Maintenance Record" : "Edit Maintenance Record"}
  </span>
}
onClose={() => {
  if (!formLoading) setFormOpen(false);
}}
        panelClassName="max-w-4xl"
        bodyClassName="max-h-[60vh] overflow-y-auto bg-slate-50 p-5"
        header={
        <div className="flex items-center justify-between bg-[rgb(25,118,210)] px-5 py-4 text-white">
            <div>
              <div className="text-lg font-semibold leading-tight">
                {formMode === "create" ? "Create Maintenance Record" : "Edit Maintenance Record"}
              </div>
              <div className="text-base text-white/80">Enter maintenance details below</div>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl bg-white/10 hover:bg-white/20"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={formLoading}
              className="cursor-pointer h-10 rounded-md border border-red-600 bg-white px-4 text-sm font-semibold text-red-500 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveRecord}
              disabled={formLoading}
              className="cursor-pointer h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formLoading ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        {formLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">Loading…</div>
        ) : (
          <div className="space-y-4">
            <div className="mt-1 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="mb-3 text-base font-semibold text-blue-700">Basic Information</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Truck *</div>
                  <div className="mt-2">
                    <FilterDropdown
                      label="Truck *"
                      value={form.truck}
                      onChange={(v) => setForm((p) => ({ ...p, truck: v }))}
                      options={[
                        { value: "", label: "Select truck" },
                        ...trucks.map((t) => ({ value: t._id, label: t.truckNumber || t._id })),
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

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Driver</div>
                  <div className="mt-2">
                    <FilterDropdown
                      label="Driver"
                      value={form.driver}
                      onChange={(v) => setForm((p) => ({ ...p, driver: v }))}
                      options={[
                        { value: "", label: "Select driver" },
                        ...drivers.map((d) => ({ value: d._id, label: d.fullName || d._id })),
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

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Type *</div>
                  <div className="mt-2">
                    <FilterDropdown
                      label="Type *"
                      value={form.type}
                      onChange={(v) => setForm((p) => ({ ...p, type: v }))}
                      options={options.types.map((t) => ({ value: t, label: t }))}
                      hideLabel
                      containerClassName="w-full"
                      buttonClassName="h-10 rounded-lg px-3 text-sm"
                      placeholder="Select type"
                      searchable
                      searchPlaceholder="Search type..."
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Status</div>
                  <div className="mt-2">
                    <FilterDropdown
                      label="Status"
                      value={form.status}
                      onChange={(v) => setForm((p) => ({ ...p, status: v }))}
                      options={options.statuses.map((s) => ({ value: s, label: s }))}
                      hideLabel
                      containerClassName="w-full"
                      buttonClassName="h-10 rounded-lg px-3 text-sm"
                      placeholder="Select status"
                      searchable
                      searchPlaceholder="Search status..."
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Priority</div>
                  <div className="mt-2">
                    <FilterDropdown
                      label="Priority"
                      value={form.priority}
                      onChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                      options={options.priorities.map((p0) => ({ value: p0, label: p0 }))}
                      hideLabel
                      containerClassName="w-full"
                      buttonClassName="h-10 rounded-lg px-3 text-sm"
                      placeholder="Select priority"
                      searchable
                      searchPlaceholder="Search priority..."
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 md:col-span-2">
                  <div className="text-sm font-semibold text-slate-500">Title *</div>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    placeholder="Oil Change"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Service Date *</div>
                  <input
                    type="date"
                    value={form.serviceDate}
                    onChange={(e) => setForm((p) => ({ ...p, serviceDate: e.target.value }))}
                    className="mt-2 cursor-pointer h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 md:col-span-3">
                  <div className="text-sm font-semibold text-slate-500">Description</div>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
              <div className="mb-3 text-base font-semibold text-emerald-700">Cost & Vendor</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Cost Amount</div>
                  <input
                    value={form.costAmount}
                    onChange={(e) => setForm((p) => ({ ...p, costAmount: e.target.value }))}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                  />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Currency</div>
                  <input
                    value={form.costCurrency}
                    onChange={(e) => setForm((p) => ({ ...p, costCurrency: e.target.value }))}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                  />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Odometer</div>
                  <input
                    value={form.odometer}
                    onChange={(e) => setForm((p) => ({ ...p, odometer: e.target.value }))}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Vendor</div>
                  <div className="mt-2">
                    <FilterDropdown
                      label="Vendor"
                      value={form.vendor}
                      onChange={(v) => setForm((p) => ({ ...p, vendor: v }))}
                      options={[
                        { value: "", label: "Select vendor" },
                        ...vendors.map((v) => ({ value: v._id, label: v.name || v._id })),
                      ]}
                      hideLabel
                      containerClassName="w-full"
                      buttonClassName="h-10 rounded-lg px-3 text-sm"
                      placeholder="Select vendor"
                      searchable
                      searchPlaceholder="Search vendor..."
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 md:col-span-2">
                  <div className="text-sm font-semibold text-slate-500">Vendor Name (if not in list)</div>
                  <input
                    value={form.vendorName}
                    onChange={(e) => setForm((p) => ({ ...p, vendorName: e.target.value }))}
                    disabled={Boolean(form.vendor)}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 disabled:bg-slate-100 disabled:text-slate-500 disabled:hover:border-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
              <div className="mb-3 text-base font-semibold text-amber-700">Next Due</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Next Due Date</div>
                  <input
                    type="date"
                    value={form.nextDueDate}
                    onChange={(e) => setForm((p) => ({ ...p, nextDueDate: e.target.value }))}
                    className="mt-2 cursor-pointer h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                  />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Next Due Odometer</div>
                  <input
                    value={form.nextDueOdometer}
                    onChange={(e) => setForm((p) => ({ ...p, nextDueOdometer: e.target.value }))}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                  />
                </div>
              </div>
            </div>

            {form.type === "tyre" ? (
              <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/40 p-4">
                <div className="mb-3 text-base font-semibold text-fuchsia-700">Tyre Details</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Position</div>
                    <input
                      value={form.position}
                      onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Action</div>
                    <input
                      value={form.action}
                      onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {form.type === "engine" ? (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                <div className="mb-3 text-base font-semibold text-indigo-700">Engine Details</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Action</div>
                    <input
                      value={form.action}
                      onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 md:col-span-2">
                    <div className="text-sm font-semibold text-slate-500">Work Done</div>
                    <input
                      value={form.workDone}
                      onChange={(e) => setForm((p) => ({ ...p, workDone: e.target.value }))}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {form.type === "service" ? (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
                <div className="mb-3 text-base font-semibold text-sky-700">Service Details</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Service Type</div>
                    <input
                      value={form.serviceType}
                      onChange={(e) => setForm((p) => ({ ...p, serviceType: e.target.value }))}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 md:col-span-2">
                    <div className="text-sm font-semibold text-slate-500">Checklist (comma separated)</div>
                    <input
                      value={form.checklist}
                      onChange={(e) => setForm((p) => ({ ...p, checklist: e.target.value }))}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {form.type === "breakdown" ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="mb-3 text-base font-semibold text-rose-700">Breakdown Details</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 md:col-span-2">
                    <div className="text-sm font-semibold text-slate-500">Breakdown Type</div>
                    <input
                      value={form.breakdownType}
                      onChange={(e) => setForm((p) => ({ ...p, breakdownType: e.target.value }))}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-500">Severity</div>
                    <input
                      value={form.severity}
                      onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
              <div className="mb-3 text-base font-semibold text-violet-700">Notes & Attachments</div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="text-sm font-semibold text-slate-500">Attachments</div>
              {form.pendingAttachments.length > 0 ? (
                <div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {pendingAttachmentPreviews.map((p) => (
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
                  <div className="mt-2 text-xs text-slate-600">These attachments will upload when you click Save.</div>
                </div>
              ) : Array.isArray(formExistingAttachments) && formExistingAttachments.length > 0 ? (
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {formExistingAttachments.map((a, i) => {
                    const url = a?.url || "";
                    const fileName = a?.fileName || "Attachment";
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
                <div className="text-sm text-slate-600">No attachments added yet</div>
              )}

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setForm((prev) => ({ ...prev, pendingAttachments: files }));
                    e.target.value = "";
                  }}
                  className="cursor-pointer w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-slate-200"
                />
              </div>
              {form.pendingAttachments.length > 0 ? (
                <div className="mt-2 text-sm font-medium text-slate-700">{form.pendingAttachments.length} file(s) selected</div>
              ) : null}
              </div>
            </div>
          </div>
        )}
      </ModalShell>

      <ModalShell
       open={viewOpen}
title={
  <span style={{ fontSize: "22px", fontWeight: "600" }}>
    Maintenance Record
  </span>
}
onClose={() => setViewOpen(false)}
        panelClassName="max-w-4xl"
        bodyClassName="max-h-[60vh] overflow-y-auto bg-slate-50 p-5"
        header={
          <div className="flex items-center justify-between bg-[rgb(25,118,210)] px-5 py-4 text-white">
            <div>
              <div className="text-lg font-semibold leading-tight">Maintenance Record</div>
              <div className="text-base text-white/80">Review details below</div>
            </div>
            <button
              type="button"
              onClick={() => setViewOpen(false)}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl bg-white/10 hover:bg-white/20"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        }
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setViewOpen(false)}
              className="cursor-pointer h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        }
      >
        {viewLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">Loading…</div>
        ) : !viewRecord ? (
          <div className="py-6 text-sm text-slate-500">No data</div>
        ) : (
          <div className="space-y-4">
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="mb-3 text-base font-semibold text-blue-700">Basic Information</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 md:col-span-3">
                  <div className="text-sm font-semibold text-slate-500">Title</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{viewRecord.title || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Type</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{viewRecord.type || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Status</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{viewRecord.status || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Priority</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{viewRecord.priority || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Truck</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {viewRecord.truck?.truckNumber || viewRecord.truck?._id || "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Service Date</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {viewRecord.serviceDate ? String(viewRecord.serviceDate).slice(0, 10) : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Cost</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {viewRecord.cost?.amount != null ? `${viewRecord.cost.currency || ""} ${viewRecord.cost.amount}` : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Odometer</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {viewRecord.odometer != null ? viewRecord.odometer : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
              <div className="mb-3 text-base font-semibold text-violet-700">Notes & Attachments</div>
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Description</div>
                  <div className="mt-1 text-sm text-slate-900">{viewRecord.description || "—"}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Attachments</div>
                  {Array.isArray(viewRecord.attachments) && viewRecord.attachments.length ? (
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {viewRecord.attachments.map((a, i) => {
                        const url = a?.url || "";
                        const fileName = a?.fileName || "Attachment";
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
          </div>
        )}
      </ModalShell>

      <ModalShell
        open={deleteOpen}
        title=""
        onClose={() => {
          if (!deleteLoading) setDeleteOpen(false);
        }}
        header={
          <div className="flex flex-col items-center justify-center gap-1 bg-blue-600 px-6 py-6">
            <AlertTriangle size={44} className="text-amber-400" />
            <div className="text-lg font-bold text-white">Confirm Deletion</div>
          </div>
        }
        footer={
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
              className="h-11 rounded-xl border border-slate-900 bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="h-11 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </button>
          </div>
        }
      >
        <div className="text-center text-sm text-slate-700">Are you sure you want to delete this record?</div>
      </ModalShell>

      {toast.open ? (
        <div className="fixed right-4 top-4 z-[60] w-[340px] max-w-[calc(100vw-2rem)]">
          <div
            className={`rounded-xl border px-4 py-3 ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold">{toast.message}</div>
              <button
                type="button"
                onClick={() => setToast((p) => ({ ...p, open: false }))}
                className="rounded-md p-1 hover:bg-black/5"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MaintenanceManagement;
