import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  Stack,
  Chip,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
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
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
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

const ExpenseTracking = () => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

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
        fetch(`${BASE_API_URL}/api/v1/trucking-expenses/categories`, { headers }),
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
      setDrivers(Array.isArray(driverData) ? driverData : driverData?.drivers || []);
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
      if (filters.startDate) params.set("startDate", format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate) params.set("endDate", format(filters.endDate, "yyyy-MM-dd"));

      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses?${params.toString()}`,
        { headers: getAuthHeaders() }
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
      if (filters.startDate) params.set("startDate", format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate) params.set("endDate", format(filters.endDate, "yyyy-MM-dd"));
      if (filters.truck) params.set("truck", filters.truck);
      if (filters.driver) params.set("driver", filters.driver);
      if (filters.trip) params.set("trip", filters.trip);
      if (filters.category) params.set("category", filters.category);

      const res = await fetch(
        `${BASE_API_URL}/api/v1/trucking-expenses/summary?${params.toString()}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (data.success && data.data) setSummary(data.data);
    } catch (e) {
      console.error("Error fetching summary:", e);
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
  }, [filters.startDate, filters.endDate, filters.truck, filters.driver, filters.trip, filters.category]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
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
      expenseDate: expense.expenseDate ? new Date(expense.expenseDate) : new Date(),
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
    if (!form.amount || Number(form.amount) < 0) err.amount = "Amount is required and must be ≥ 0";
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
        expenseDate: form.expenseDate instanceof Date ? form.expenseDate.toISOString() : form.expenseDate,
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      const res = await fetch(`${BASE_API_URL}/api/v1/trucking-expenses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        fetchExpenses();
        fetchSummary();
        if (selectedExpense?._id === id) setDetailOpen(false);
      } else alert(data.message || "Delete failed");
    } catch (e) {
      alert("Delete failed");
    }
  };

  const openDetail = async (expense) => {
    setSelectedExpense(null);
    setDetailOpen(true);
    setDetailLoading(true);
    setRejectReason("");
    setReceiptFiles([]);
    try {
      const res = await fetch(`${BASE_API_URL}/api/v1/trucking-expenses/${expense._id}`, {
        headers: getAuthHeaders(),
      });
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
        { method: "PATCH", headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (data.success) {
        setSelectedExpense(data.data?.expense || { ...selectedExpense, status: "approved" });
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
        }
      );
      const data = await res.json();
      if (data.success) {
        setSelectedExpense(data.data?.expense || { ...selectedExpense, status: "rejected" });
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
        { method: "PATCH", headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (data.success) {
        setSelectedExpense(data.data?.expense || { ...selectedExpense, status: "reimbursed" });
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
        }
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
      case "pending": return "warning";
      case "approved": return "success";
      case "rejected": return "error";
      case "reimbursed": return "info";
      default: return "default";
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            Expense Tracking
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAddForm}
            sx={{ bgcolor: brand, "&:hover": { bgcolor: brand, opacity: 0.9 } }}
          >
            Add Expense
          </Button>
        </Stack>

        {/* Summary cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Amount</Typography>
                {summaryLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h6">${summary?.totalAmount?.toLocaleString() ?? "0"}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Count</Typography>
                {summaryLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h6">{summary?.totalCount ?? 0}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>IFTA Fuel</Typography>
                {summaryLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h6">${summary?.iftaFuel?.totalFuelAmount?.toLocaleString() ?? "0"}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2} sx={{ minWidth: 220 }}>
              <FormControl fullWidth size="small" sx={{ width: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  sx={{ width: 1 }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <MenuItem key={o.value || "all"} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2} sx={{ minWidth: 220 }}>
              <FormControl fullWidth size="small" sx={{ width: 1 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  sx={{ width: 1 }}
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2} sx={{ minWidth: 220 }}>
              <FormControl fullWidth size="small" sx={{ width: 1 }}>
                <InputLabel>Truck</InputLabel>
                <Select
                  value={filters.truck}
                  label="Truck"
                  onChange={(e) => handleFilterChange("truck", e.target.value)}
                  sx={{ width: 1 }}
                >
                  <MenuItem value="">All</MenuItem>
                  {trucks.map((t) => (
                    <MenuItem key={t._id} value={t._id}>{t.truckNumber}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2} sx={{ minWidth: 220 }}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(d) => handleFilterChange("startDate", d)}
                slotProps={{ textField: { size: "small", fullWidth: true, sx: { width: 1 } } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2} sx={{ minWidth: 220 }}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(d) => handleFilterChange("endDate", d)}
                slotProps={{ textField: { size: "small", fullWidth: true, sx: { width: 1 } } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button startIcon={<Clear />} onClick={handleClearFilters} size="small">
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <Paper>
          {loading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Truck</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell>{row.expenseDate ? format(new Date(row.expenseDate), "MMM dd, yyyy") : "—"}</TableCell>
                        <TableCell>${Number(row.amount).toLocaleString()}</TableCell>
                        <TableCell>{row.category?.name ?? "—"}</TableCell>
                        <TableCell>{row.truck?.truckNumber ?? "—"}</TableCell>
                        <TableCell>{row.driver?.fullName ?? "—"}</TableCell>
                        <TableCell>{row.vendor?.name || row.vendorName || "—"}</TableCell>
                        <TableCell>
                          <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openDetail(row)} title="View">
                            <Visibility fontSize="small" />
                          </IconButton>
                          {row.status !== "reimbursed" && (
                            <IconButton size="small" onClick={() => openEditForm(row)} title="Edit">
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton size="small" onClick={() => handleDelete(row._id)} title="Delete" color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={pagination.total}
                page={pagination.page - 1}
                onPageChange={(_, p) => setPagination((prev) => ({ ...prev, page: p + 1 }))}
                rowsPerPage={pagination.limit}
                onRowsPerPageChange={(e) =>
                  setPagination((prev) => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }))
                }
                rowsPerPageOptions={[10, 20, 50]}
              />
            </>
          )}
        </Paper>

        {/* Add/Edit dialog */}
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6} sx={{ minWidth: 240 }}>
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
              </Grid>
              <Grid item xs={12} sm={6} sx={{ minWidth: 240 }}>
                <FormControl fullWidth size="small" error={!!formErrors.category} sx={{ width: 1 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={form.category}
                    label="Category"
                    onChange={(e) => handleFormChange("category", e.target.value)}
                    sx={{ width: 1 }}
                  >
                    {categories.map((c) => (
                      <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ minWidth: 240 }}>
                <DatePicker
                  label="Expense Date"
                  value={form.expenseDate}
                  onChange={(d) => handleFormChange("expenseDate", d)}
                  slotProps={{ textField: { fullWidth: true, size: "small", sx: { width: 1 } } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ minWidth: 240 }}>
                <FormControl fullWidth size="small" sx={{ width: 1 }}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={form.payment?.method}
                    label="Payment Method"
                    onChange={(e) => handlePaymentChange("method", e.target.value)}
                    sx={{ width: 1 }}
                  >
                    {PAYMENT_METHODS.map((p) => (
                      <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {form.payment?.method === "card" && (
                <Grid item xs={12} sm={6} sx={{ minWidth: 240 }}>
                  <TextField
                    fullWidth
                    label="Card last 4"
                    value={form.payment?.cardLastFour ?? ""}
                    onChange={(e) => handlePaymentChange("cardLastFour", e.target.value)}
                    size="small"
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6} sx={{ minWidth: 240 }}>
                <FormControl fullWidth size="small" sx={{ width: 1 }}>
                  <InputLabel>Truck</InputLabel>
                  <Select
                    value={form.truck}
                    label="Truck"
                    onChange={(e) => handleFormChange("truck", e.target.value)}
                    sx={{ width: 1 }}
                  >
                    <MenuItem value="">—</MenuItem>
                    {trucks.map((t) => (
                      <MenuItem key={t._id} value={t._id}>{t.truckNumber}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ minWidth: 240 }}>
                <FormControl fullWidth size="small" sx={{ width: 1 }}>
                  <InputLabel>Driver</InputLabel>
                  <Select
                    value={form.driver}
                    label="Driver"
                    onChange={(e) => handleFormChange("driver", e.target.value)}
                    sx={{ width: 1 }}
                  >
                    <MenuItem value="">—</MenuItem>
                    {drivers.map((d) => (
                      <MenuItem key={d._id} value={d._id}>{d.fullName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ minWidth: 240 }}>
                <FormControl fullWidth size="small" sx={{ width: 1 }}>
                  <InputLabel>Trip</InputLabel>
                  <Select
                    value={form.trip}
                    label="Trip"
                    onChange={(e) => handleFormChange("trip", e.target.value)}
                    sx={{ width: 1 }}
                  >
                    <MenuItem value="">—</MenuItem>
                    {trips.map((t) => (
                      <MenuItem key={t._id} value={t._id}>{t.tripId}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ minWidth: 240 }}>
                <FormControl fullWidth size="small" sx={{ width: 1 }}>
                  <InputLabel>Vendor</InputLabel>
                  <Select
                    value={form.vendor}
                    label="Vendor"
                    onChange={(e) => handleFormChange("vendor", e.target.value)}
                    sx={{ width: 1 }}
                  >
                    <MenuItem value="">—</MenuItem>
                    {vendors.map((v) => (
                      <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vendor name (if no vendor)"
                  value={form.vendorName}
                  onChange={(e) => handleFormChange("vendorName", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={form.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  size="small"
                />
              </Grid>
              {formErrors.submit && (
                <Grid item xs={12}>
                  <Typography color="error">{formErrors.submit}</Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitForm} disabled={formLoading} sx={{ bgcolor: brand }}>
              {formLoading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Detail dialog */}
        <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Expense Detail</DialogTitle>
          <DialogContent>
            {detailLoading ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <CircularProgress />
              </Box>
            ) : selectedExpense ? (
              <Stack spacing={2}>
                <Typography><strong>Amount:</strong> ${Number(selectedExpense.amount).toLocaleString()}</Typography>
                <Typography><strong>Category:</strong> {selectedExpense.category?.name ?? "—"}</Typography>
                <Typography><strong>Date:</strong> {selectedExpense.expenseDate ? format(new Date(selectedExpense.expenseDate), "PPpp") : "—"}</Typography>
                <Typography><strong>Payment:</strong> {selectedExpense.payment?.method ?? "—"}</Typography>
                <Typography><strong>Truck:</strong> {selectedExpense.truck?.truckNumber ?? "—"}</Typography>
                <Typography><strong>Driver:</strong> {selectedExpense.driver?.fullName ?? "—"}</Typography>
                <Typography><strong>Trip:</strong> {selectedExpense.trip?.tripId ?? "—"}</Typography>
                <Typography><strong>Vendor:</strong> {selectedExpense.vendor?.name || selectedExpense.vendorName || "—"}</Typography>
                <Typography><strong>Status:</strong> <Chip label={selectedExpense.status} color={getStatusColor(selectedExpense.status)} size="small" /></Typography>
                {selectedExpense.notes && <Typography><strong>Notes:</strong> {selectedExpense.notes}</Typography>}
                {selectedExpense.receipts?.length > 0 && (
                  <Box>
                    <Typography fontWeight={600}>Receipts</Typography>
                    {selectedExpense.receipts.map((r, i) => (
                      <Typography key={i} component="a" href={r.url} target="_blank" rel="noopener noreferrer" sx={{ display: "block" }}>
                        {r.fileName || "Receipt"}
                      </Typography>
                    ))}
                  </Box>
                )}
                <Box>
                  <Typography fontWeight={600} sx={{ mb: 1 }}>Upload receipts</Typography>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    multiple
                    onChange={(e) => setReceiptFiles(Array.from(e.target.files || []))}
                  />
                  {receiptFiles.length > 0 && (
                    <Button
                      startIcon={uploadingReceipts ? <CircularProgress size={16} /> : <CloudUpload />}
                      onClick={handleReceiptUpload}
                      disabled={uploadingReceipts}
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Upload {receiptFiles.length} file(s)
                    </Button>
                  )}
                </Box>
                {selectedExpense.status === "pending" && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      label="Reject reason (optional)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <Button startIcon={<CheckCircle />} color="success" onClick={handleApprove} disabled={actionLoading}>
                      Approve
                    </Button>
                    <Button startIcon={<Cancel />} color="error" onClick={handleReject} disabled={actionLoading}>
                      Reject
                    </Button>
                  </Stack>
                )}
                {selectedExpense.status === "approved" && (
                  <Button startIcon={<Paid />} variant="contained" onClick={handleReimburse} disabled={actionLoading}>
                    Mark as Reimbursed
                  </Button>
                )}
              </Stack>
            ) : (
              <Typography>Failed to load expense.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailOpen(false)}>Close</Button>
            {selectedExpense && (
              <>
                {selectedExpense.status !== "reimbursed" && (
                  <Button onClick={() => { setDetailOpen(false); openEditForm(selectedExpense); }}>Edit</Button>
                )}
                <Button color="error" onClick={() => handleDelete(selectedExpense._id)}>Delete</Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ExpenseTracking;
