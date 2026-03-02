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
  Popover,
  Menu,
  InputAdornment,
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
  Skeleton,
} from "@mui/material";
import {
  Receipt,
  Download,
  DateRange,
  Clear,
  Search,
  Add,
  Close,
  Business,
  AttachMoney,
  LocationOn,
  CalendarToday,
  Visibility,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { format, isWithinInterval, startOfDay, endOfDay, addDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import axios from "axios";
import { useThemeConfig } from "../../context/ThemeContext";
import { BASE_API_URL } from "../../apiConfig";

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState([null, null]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [rangeAnchorEl, setRangeAnchorEl] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bill generation popup state
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billForm, setBillForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    invoiceDate: null,
    pickUpAddress: "",
    pickUpCity: "",
    weight: "",
    container: "",
    containerType: "",
    quantity: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryDate: null,
    workOrder: "",
    lineHaul: "",
    fsc: "",
    otherNotes: "",
    notes: "",
    loadReference: "",
    paymentTermsDays: 30,
    paymentTermsDescription: "Net 30 days",
  });
  const [billErrors, setBillErrors] = useState({});
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);
  const { themeConfig } = useThemeConfig();
  const brand =
    themeConfig.header?.bg && themeConfig.header.bg !== "white"
      ? themeConfig.header.bg
      : themeConfig.tokens?.primary || "#1976d2";
  const headerTextColor = themeConfig.header?.text || "#ffffff";
  const textColor = themeConfig.tokens?.text || "#333333";
  const buttonTextColor =
    themeConfig.tokens?.buttonText || textColor || "#ffffff";
  const highlight = themeConfig.tokens?.highlight || "#e3f2fd";

  // View bill modal state
  const [viewBillModalOpen, setViewBillModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [viewBillLoading, setViewBillLoading] = useState(false);

  // Mark as paid popup state
  const [markPaidModalOpen, setMarkPaidModalOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "bank_transfer",
    paymentReference: "",
    paymentNotes: "",
  });
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const [billingData, setBillingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch bills from API
  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_API_URL}/api/v1/bill/my-bills`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success && response.data.bills) {
        // Transform API data to match table format
        const transformedBills = response.data.bills.map((bill) => {
          const billDate = new Date(bill.invoiceDate);
          const dueDate = new Date(billDate);
          // Use payment terms days if available, otherwise default to 30 days
          const paymentDays = bill.paymentTerms?.days || 30;
          dueDate.setDate(dueDate.getDate() + paymentDays);

          return {
            billId: bill.billNumber,
            billDate: billDate.toISOString().split("T")[0],
            dueDate: dueDate.toISOString().split("T")[0],
            pickupAddress: bill.pickup.address,
            deliveryAddress: bill.delivery.address,
            amount: bill.billing.total,
            status: bill.status,
            customerName: bill.billTo.customerName,
            pickupCity: bill.pickup.city,
            deliveryCity: bill.delivery.city,
            createdAt: bill.createdAt,
            _id: bill._id,
            paymentTerms: bill.paymentTerms,
          };
        });

        setBillingData(transformedBills);
        setFilteredData(transformedBills);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      setBillingData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bills on component mount
  useEffect(() => {
    fetchBills();
  }, []);

  // Filter data based on date range and search term
  useEffect(() => {
    let filtered = billingData;

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((bill) => {
        const billDate = new Date(bill.billDate);
        return isWithinInterval(billDate, {
          start: startOfDay(dateRange[0]),
          end: endOfDay(dateRange[1]),
        });
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (bill) =>
          bill.billId?.toLowerCase().includes(searchLower) ||
          bill.pickupAddress?.toLowerCase().includes(searchLower) ||
          bill.deliveryAddress?.toLowerCase().includes(searchLower) ||
          bill.customerName?.toLowerCase().includes(searchLower) ||
          bill.status?.toLowerCase().includes(searchLower),
      );
    }

    setFilteredData(filtered);
    setPage(0);
  }, [dateRange, billingData, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateRangeClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setRangeAnchorEl(null);
  };

  const handleDateChange = (index) => (newValue) => {
    const newDateRange = [...dateRange];
    newDateRange[index] = newValue;
    setDateRange(newDateRange);
  };

  const clearDateRange = () => {
    setDateRange([null, null]);
    setRangeAnchorEl(null);
    setMenuAnchorEl(null);
  };

  const handleDateMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const setQuickRange = (type) => {
    const now = new Date();
    let start = null;
    let end = null;
    if (type === 'today') {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (type === 'yesterday') {
      const y = addDays(now, -1);
      start = startOfDay(y);
      end = endOfDay(y);
    } else if (type === 'last7') {
      start = startOfDay(addDays(now, -6));
      end = endOfDay(now);
    } else if (type === 'last30') {
      start = startOfDay(addDays(now, -29));
      end = endOfDay(now);
    } else if (type === 'thisMonth') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (type === 'lastMonth') {
      const lm = subMonths(now, 1);
      start = startOfMonth(lm);
      end = endOfMonth(lm);
    }
    setDateRange([start, end]);
    handleDateMenuClose();
  };

  const handleCustomRange = () => {
    setRangeAnchorEl(menuAnchorEl);
    handleDateMenuClose();
  };

  const getDateRangeText = () => {
    if (dateRange[0] && dateRange[1]) {
      return `${format(dateRange[0], "MMM dd, yyyy")} - ${format(dateRange[1], "MMM dd, yyyy")}`;
    }
    return "Select Date Range";
  };

  const exportToCSV = () => {
    const headers = ["Bill Id", "Date", "Amount", "Status"];
    const csvRows = [headers.join(",")];

    filteredData.forEach((row) => {
      const values = [row.billId, row.billDate, row.amount, row.status];
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "billing_data.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "paid":
        return "success";
      case "overdue":
        return "error";
      case "draft":
        return "default";
      default:
        return "default";
    }
  };

  // Bill generation handlers
  const handleBillFormChange = (field) => (event) => {
    setBillForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error when user starts typing
    if (billErrors[field]) {
      setBillErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleBillDateChange = (field) => (newValue) => {
    setBillForm((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleGenerateBill = () => {
    setBillModalOpen(true);
  };

  const handleCloseBillModal = () => {
    setBillModalOpen(false);
    setBillForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      invoiceDate: null,
      pickUpAddress: "",
      pickUpCity: "",
      weight: "",
      container: "",
      containerType: "",
      quantity: "",
      deliveryAddress: "",
      deliveryCity: "",
      deliveryDate: null,
      workOrder: "",
      lineHaul: "",
      fsc: "",
      otherNotes: "",
      notes: "",
      loadReference: "",
      paymentTermsDays: 30,
      paymentTermsDescription: "Net 30 days",
    });
    setBillErrors({});
  };

  const handleSubmitBill = async () => {
    // Basic validation
    const newErrors = {};

    if (!billForm.customerName.trim())
      newErrors.customerName = "Customer Name is required";
    if (!billForm.pickUpCity.trim())
      newErrors.pickUpCity = "Pick Up City is required";
    if (!billForm.pickUpAddress.trim())
      newErrors.pickUpAddress = "Pick Up Address is required";
    if (!billForm.weight.trim()) newErrors.weight = "Weight is required";
    if (!billForm.container.trim())
      newErrors.container = "Container is required";
    if (!billForm.containerType.trim())
      newErrors.containerType = "Container Type is required";
    if (!billForm.deliveryDate)
      newErrors.deliveryDate = "Delivery Date is required";
    if (!billForm.deliveryCity.trim())
      newErrors.deliveryCity = "Delivery City is required";
    if (!billForm.deliveryAddress.trim())
      newErrors.deliveryAddress = "Delivery Address is required";
    if (!billForm.lineHaul.trim()) newErrors.lineHaul = "Line Haul is required";

    if (Object.keys(newErrors).length > 0) {
      setBillErrors(newErrors);
      return;
    }

    setIsSubmittingBill(true);

    try {
      const token = localStorage.getItem("token");

      // Prepare the API payload according to the provided structure
      const billPayload = {
        billTo: {
          customerName: billForm.customerName,
          customerEmail: billForm.customerEmail || undefined,
          customerPhone: billForm.customerPhone || undefined,
          customerAddress: {
            addressLine1: billForm.customerAddress || undefined,
            addressLine2: billForm.addressLine2 || undefined,
            city: billForm.city || undefined,
            state: billForm.state || undefined,
            zipCode: billForm.zipCode || undefined,
            country: billForm.country || "USA",
          },
        },
        invoiceDate: billForm.invoiceDate
          ? billForm.invoiceDate.toISOString()
          : new Date().toISOString(),
        pickup: {
          city: billForm.pickUpCity,
          address: billForm.pickUpAddress,
          weight: parseFloat(billForm.weight) || 0,
          container: billForm.container,
          containerType: billForm.containerType,
          quantity: parseInt(billForm.quantity) || 1,
        },
        delivery: {
          date: billForm.deliveryDate.toISOString(),
          city: billForm.deliveryCity,
          address: billForm.deliveryAddress,
        },
        billing: {
          wO: parseFloat(billForm.workOrder) || 0,
          lineHaul: parseFloat(billForm.lineHaul) || 0,
          fsc: parseFloat(billForm.fsc) || 0,
          other: parseFloat(billForm.otherNotes) || 0,
        },
        paymentTerms: {
          days: parseInt(billForm.paymentTermsDays) || 30,
          description: billForm.paymentTermsDescription || "Net 30 days",
        },
        notes: billForm.notes || undefined,
        loadReference: billForm.loadReference || undefined,
      };

      const response = await axios.post(
        `${BASE_API_URL}/api/v1/bill/create`,
        billPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        alert("Bill generated successfully!");
        handleCloseBillModal();
        // Refresh the billing data
        fetchBills();
      }
    } catch (error) {
      console.error("Error creating bill:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create bill";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // View bill handler
  const handleViewBill = async (billId) => {
    setSelectedBill(null);
    setViewBillModalOpen(true);
    setViewBillLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_API_URL}/api/v1/bill/trucker/${billId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        setSelectedBill(response.data.bill);
      }
    } catch (error) {
      console.error("Error fetching bill details:", error);
      alert("Failed to fetch bill details");
    } finally {
      setViewBillLoading(false);
    }
  };

  const handleCloseViewBillModal = () => {
    setViewBillModalOpen(false);
    setSelectedBill(null);
  };

  // Mark as paid handlers
  const handleMarkAsPaid = (bill) => {
    setSelectedBillForPayment(bill);
    setMarkPaidModalOpen(true);
  };

  const handleCloseMarkPaidModal = () => {
    setMarkPaidModalOpen(false);
    setSelectedBillForPayment(null);
    setPaymentForm({
      paymentMethod: "bank_transfer",
      paymentReference: "",
      paymentNotes: "",
    });
  };

  const handlePaymentFormChange = (field) => (event) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmitMarkAsPaid = async () => {
    if (!selectedBillForPayment) return;

    setIsMarkingPaid(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_API_URL}/api/v1/bill/trucker/${selectedBillForPayment._id}/mark-paid`,
        paymentForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        alert("Bill marked as paid successfully!");
        handleCloseMarkPaidModal();
        fetchBills(); // Refresh the bills list
      }
    } catch (error) {
      console.error("Error marking bill as paid:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark bill as paid";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const menuOpen = Boolean(menuAnchorEl);
  const rangeOpen = Boolean(rangeAnchorEl);
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageStart = clampedPage * rowsPerPage;
  const pageEnd = Math.min(totalItems, pageStart + rowsPerPage);
  const visibleRows = filteredData.slice(pageStart, pageEnd);
  const getPageNumbers = () => {
    const pages = totalPages;
    const current = clampedPage + 1;
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }
    const nums = [];
    nums.push(1);
    if (current > 4) nums.push("…");
    const start = Math.max(2, current - 1);
    const end = Math.min(pages - 1, current + 1);
    for (let i = start; i <= end; i++) nums.push(i);
    if (current < pages - 3) nums.push("…");
    nums.push(pages);
    return nums;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <div className="mb-2 flex items-center gap-2">
          <div className="text-2xl font-semibold text-gray-700">
            Billing Overview
          </div>
          <span
            className="inline-block rounded-full text-white text-base font-semibold px-3 py-1"
            style={{ backgroundColor: "#1976d2" }}
          >
            {billingData.length} {billingData.length === 1 ? "Bill" : "Bills"}
          </span>
        </div>
        <div className="mb-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 w-full">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full h-11 rounded-md border border-gray-200 pl-10 pr-3 text-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleDateRangeClick}
                className="h-11 px-3 rounded-md font-medium text-black border border-gray-200 text-base cursor-pointer flex items-center justify-between min-w-[220px]"
              >
                <span className="flex-1 text-left">{getDateRangeText()}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <Menu
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleDateMenuClose}
                MenuListProps={{ dense: true }}
              >
                <MenuItem onClick={clearDateRange} sx={{borderBottom: '1px solid #e0e0e0'}}>Clear Filter</MenuItem>
                <MenuItem onClick={() => setQuickRange('today')}>Today</MenuItem>
                <MenuItem onClick={() => setQuickRange('yesterday')}>Yesterday</MenuItem>
                <MenuItem onClick={() => setQuickRange('last7')}>Last 7 Days</MenuItem>
                <MenuItem onClick={() => setQuickRange('last30')}>Last 30 Days</MenuItem>
                <MenuItem onClick={() => setQuickRange('thisMonth')}>This Month</MenuItem>
                <MenuItem onClick={() => setQuickRange('lastMonth')}>Last Month</MenuItem>
                <MenuItem onClick={handleCustomRange} sx={{borderTop: '1px solid #e0e0e0'}}>Custom Range</MenuItem>
              </Menu>
              <button
                onClick={exportToCSV}
                className="h-11 px-4 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
              >
                Export CSV
              </button>
              <button
  onClick={handleGenerateBill}
  className="h-11 px-4 rounded-md text-white text-base font-medium cursor-pointer flex items-center gap-2"
  style={{
    backgroundColor: "#1976d2",
    border: "1px solid #1976d2",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1565c0")}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
  Generate Bill
</button>
            </div>
          </div>
        </div>

        <Popover
          open={rangeOpen}
          anchorEl={rangeAnchorEl}
          onClose={handleDateRangeClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          PaperProps={{
            sx: {
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 300,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Select Date Range
              </Typography>
              <IconButton size="small" onClick={clearDateRange}>
                <Clear />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <DatePicker
                label="From Date"
                value={dateRange[0]}
                onChange={handleDateChange(0)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { minWidth: 140 },
                  },
                }}
              />
              <DatePicker
                label="To Date"
                value={dateRange[1]}
                onChange={handleDateChange(1)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { minWidth: 140 },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                size="small"
                onClick={handleDateRangeClose}
                sx={{
                  fontSize: "1rem",
                  px: 2,
                  py: 0.5,
                  textTransform: "none",
                  border:"1px solid red",
                  color:"red",
                  ":hover":{
                    backgroundColor:"red",
                    color:"white"
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleDateRangeClose}
                sx={{
                  fontSize: "1rem",
                  px: 2,
                  py: 0.5,
                  color: "white",
                  textTransform: "none",
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Popover>

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto p-4">
            <table className="min-w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-left bg-slate-100">
                  {[
                    "Bill Id",
                    "Pickup Address",
                    "Delivery Address",
                    "Amount",
                    "Bill Date",
                    "Due Date",
                    "Payment Terms",
                    "Status",
                    "Actions",
                  ].map((h, idx) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200 ${idx === 0 ? "rounded-l-xl border-l" : ""} ${idx === 8 ? "rounded-r-xl border-r" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-sm text-slate-500"
                      colSpan={9}
                    >
                      Loading…
                    </td>
                  </tr>
                ) : totalItems === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-sm text-slate-500"
                      colSpan={9}
                    >
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Generate your first bill to get started"}
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((bill, i) => {
                    const today = new Date();
                    const dueDate = new Date(bill.dueDate);
                    const isOverdue =
                      today > dueDate && bill.status.toLowerCase() !== "paid";
                    const status = bill.status.toLowerCase();
                    const statusClasses =
                      status === "paid"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : status === "pending"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : status === "overdue"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-slate-100 text-slate-700 border-slate-300";
                    return (
                      <tr
                        key={bill._id || i}
                        className={`hover:bg-slate-50 ${isOverdue ? "bg-red-50" : ""}`}
                      >
                        <td
                          className="px-4 py-4 font-medium text-gray-700 rounded-l-xl 
               border-t border-b border-l border-gray-200"
                        >
                          <div className="relative group max-w-[130px]">
                            <span className="block truncate">
                              {bill.billId}
                            </span>

                            {/* Tooltip */}
                            {bill.billId && (
                              <div
                                className="absolute left-0 top-full mt-1 hidden group-hover:block
                      bg-gray-900 text-white text-sm px-3 py-1.5
                      rounded-md shadow-lg whitespace-nowrap z-50"
                              >
                                {bill.billId}
                              </div>
                            )}
                          </div>
                        </td>
                       <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
  <div className="relative group max-w-[100px]">
    
    <span className="block truncate">
      {bill.pickupAddress || "-"}
    </span>

    {bill.pickupAddress && (
      <div className="absolute left-0 top-full mt-1 hidden group-hover:block 
                      bg-gray-900 text-white text-sm px-3 py-1.5 
                      rounded-md shadow-lg whitespace-nowrap z-50">
        {bill.pickupAddress}
      </div>
    )}

  </div>
</td>

<td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
  <div className="relative group max-w-[100px]">
    
    <span className="block truncate">
      {bill.deliveryAddress || "-"}
    </span>

    {bill.deliveryAddress && (
      <div className="absolute left-0 top-full mt-1 hidden group-hover:block 
                      bg-gray-900 text-white text-sm px-3 py-1.5 
                      rounded-md shadow-lg whitespace-nowrap z-50">
        {bill.deliveryAddress}
      </div>
    )}

  </div>
</td>
                        <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                          ${bill.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                          {new Date(bill.billDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                       <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
  {new Date(bill.dueDate).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })}
  {isOverdue && (
    <div className="mt-0.5">
      <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        Overdue
      </span>
    </div>
  )}
</td>
                        <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                          {bill.paymentTerms?.days || 30} days
                        </td>
                        <td className="px-4 py-4 text-gray-700 border-t border-b border-gray-200">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-base font-medium border ${statusClasses}`}
                          >
                            {bill.status.charAt(0).toUpperCase() +
                              bill.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewBill(bill._id)}
                              className="h-8 px-3 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
                            >
                              View
                            </button>
                            {bill.status.toLowerCase() !== "paid" ? (
                              <button
                                onClick={() => handleMarkAsPaid(bill)}
                                className="h-8 px-3 rounded-md border border-green-600 text-green-600 text-base cursor-pointer font-medium hover:bg-green-600 hover:text-white"
                              >
                                Mark Paid
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-2 border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center justify-between pr-42">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>{`Showing ${totalItems === 0 ? 0 : pageStart + 1} to ${pageEnd} of ${totalItems} bills`}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 font-medium text-gray-700">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                className="h-8 rounded-md border border-slate-300 px-2 text-sm bg-white cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </label>
            <button
              onClick={() => setPage(Math.max(0, clampedPage - 1))}
              disabled={clampedPage === 0}
              className={`h-8 px-3 text-base ${clampedPage === 0 ? "text-slate-400 rounded-full cursor-not-allowed" : "text-slate-900 font-semibold cursor-pointer rounded-md"}`}
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
                  key={num}
                  onClick={() => setPage(Number(num) - 1)}
                  className={`min-w-8 h-8 px-2 rounded-xl text-base cursor-pointer ${num === clampedPage + 1 ? "border border-gray-900" : "text-slate-700"}`}
                >
                  {num}
                </button>
              ),
            )}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, clampedPage + 1))}
              disabled={clampedPage >= totalPages - 1}
              className={`h-8 px-3 text-base ${clampedPage >= totalPages - 1 ? "text-slate-400 rounded-full cursor-not-allowed" : "text-slate-900 font-semibold cursor-pointer rounded-md"}`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Bill Generation Modal */}
        <Dialog
          open={billModalOpen}
          onClose={handleCloseBillModal}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              minHeight: "85vh",
              maxHeight: "95vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <DialogTitle
            className="border-b-0 bg-[#1976d2] flex items-center justify-between gap-3 py-4 px-6 relative rounded-t-lg"
            sx={{ backgroundColor: "#1976d2" }}
          >
            <Box className="flex items-center gap-3 flex-1">
              <Box className="bg-white rounded-lg w-12 h-12 flex items-center justify-center border-2 border-blue-300 shadow-sm">
                <Receipt className="text-xl text-blue-500" />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  className="font-bold text-white mb-0.5 text-xl"
                >
                  Generate New Bill
                </Typography>
                <Typography
                  variant="body2"
                  className="text-white text-sm opacity-95"
                >
                  Fill in the details to create a new bill
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseBillModal}
              sx={{
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
              size="small"
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent
            className="p-0 bg-gray-100 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-500"
            sx={{
              p: 0,
              backgroundColor: "#f5f5f5",
              flex: 1,
              overflowY: "auto",
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Customer Information Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "#e3f2fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Business sx={{ color: "#1976d2", fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#2D3748",
                        fontSize: "1.125rem",
                      }}
                    >
                      Customer Information
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Customer Name *"
                        value={billForm.customerName}
                        onChange={handleBillFormChange("customerName")}
                        fullWidth
                        error={!!billErrors.customerName}
                        helperText={billErrors.customerName}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Customer Email *"
                        type="email"
                        value={billForm.customerEmail}
                        onChange={handleBillFormChange("customerEmail")}
                        fullWidth
                        error={!!billErrors.customerEmail}
                        helperText={billErrors.customerEmail}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <DatePicker
                        label="Invoice Date *"
                        value={billForm.invoiceDate}
                        onChange={handleBillDateChange("invoiceDate")}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!billErrors.invoiceDate,
                            helperText: billErrors.invoiceDate,
                            sx: {
                              "& .MuiInputBase-root": {
                                borderRadius: 2,
                              },
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Customer Address *"
                        multiline
                        rows={2}
                        value={billForm.customerAddress}
                        onChange={handleBillFormChange("customerAddress")}
                        fullWidth
                        error={!!billErrors.customerAddress}
                        helperText={billErrors.customerAddress}
                        sx={{
                          width: "100%",
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Pick Up Information Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "#fff3e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <LocationOn sx={{ color: "#ff9800", fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#2D3748",
                        fontSize: "1.125rem",
                      }}
                    >
                      Pick Up Information
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Pick-up Address *"
                        value={billForm.pickUpAddress}
                        onChange={handleBillFormChange("pickUpAddress")}
                        fullWidth
                        error={!!billErrors.pickUpAddress}
                        helperText={billErrors.pickUpAddress}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="City *"
                        value={billForm.pickUpCity}
                        onChange={handleBillFormChange("pickUpCity")}
                        fullWidth
                        error={!!billErrors.pickUpCity}
                        helperText={billErrors.pickUpCity}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Delivery Information Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "#e8f5e9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <LocationOn sx={{ color: "#4caf50", fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#2D3748",
                        fontSize: "1.125rem",
                      }}
                    >
                      Delivery Information
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Delivery Address *"
                        value={billForm.deliveryAddress}
                        onChange={handleBillFormChange("deliveryAddress")}
                        fullWidth
                        error={!!billErrors.deliveryAddress}
                        helperText={billErrors.deliveryAddress}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="City *"
                        value={billForm.deliveryCity}
                        onChange={handleBillFormChange("deliveryCity")}
                        fullWidth
                        error={!!billErrors.deliveryCity}
                        helperText={billErrors.deliveryCity}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Delivery Date *"
                        value={billForm.deliveryDate}
                        onChange={handleBillDateChange("deliveryDate")}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!billErrors.deliveryDate,
                            helperText: billErrors.deliveryDate,
                            sx: {
                              "& .MuiInputBase-root": {
                                borderRadius: 2,
                              },
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Additional Information Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "#f3e5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AttachMoney sx={{ color: "#7b1fa2", fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#2D3748",
                        fontSize: "1.125rem",
                      }}
                    >
                      Additional Information
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Weight *"
                        value={billForm.weight}
                        onChange={handleBillFormChange("weight")}
                        fullWidth
                        error={!!billErrors.weight}
                        helperText={billErrors.weight}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Container *"
                        value={billForm.container}
                        onChange={handleBillFormChange("container")}
                        fullWidth
                        error={!!billErrors.container}
                        helperText={billErrors.container}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Container Type *"
                        value={billForm.containerType}
                        onChange={handleBillFormChange("containerType")}
                        fullWidth
                        error={!!billErrors.containerType}
                        helperText={billErrors.containerType}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Quantity *"
                        value={billForm.quantity}
                        onChange={handleBillFormChange("quantity")}
                        fullWidth
                        error={!!billErrors.quantity}
                        helperText={billErrors.quantity}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Work Order *"
                        value={billForm.workOrder}
                        onChange={handleBillFormChange("workOrder")}
                        fullWidth
                        error={!!billErrors.workOrder}
                        helperText={billErrors.workOrder}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Line Haul *"
                        value={billForm.lineHaul}
                        onChange={handleBillFormChange("lineHaul")}
                        fullWidth
                        error={!!billErrors.lineHaul}
                        helperText={billErrors.lineHaul}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="FSC"
                        value={billForm.fsc}
                        onChange={handleBillFormChange("fsc")}
                        fullWidth
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Other"
                        value={billForm.otherNotes}
                        onChange={handleBillFormChange("otherNotes")}
                        fullWidth
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Payment Terms (Days)"
                        type="number"
                        value={billForm.paymentTermsDays}
                        onChange={handleBillFormChange("paymentTermsDays")}
                        fullWidth
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Payment Terms Description"
                        value={billForm.paymentTermsDescription}
                        onChange={handleBillFormChange(
                          "paymentTermsDescription",
                        )}
                        fullWidth
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Notes"
                        multiline
                        rows={3}
                        value={billForm.notes}
                        onChange={handleBillFormChange("notes")}
                        fullWidth
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              backgroundColor: "#f8f9fa",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <Button
              onClick={handleCloseBillModal}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                py: 1,
                borderColor: "red",
                color: "red",
                "&:hover": {
                  color: "white",
                  backgroundColor:"red"
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBill}
              variant="contained"
              disabled={isSubmittingBill}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                py: 1,
                background: brand,
                color: "white",
                "&:hover": { opacity: 0.9 },
                "&:disabled": {
                  backgroundColor: "#ccc",
                  color: "#666",
                },
              }}
            >
              {isSubmittingBill ? "Generating..." : "Generate Bill"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Bill Modal */}
        <Dialog
          open={viewBillModalOpen}
          onClose={handleCloseViewBillModal}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(to right, #1976d2, #1565c0)",
              color: "#fff",
              py: 3,
              px: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Receipt sx={{ fontSize: 28 }} />
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#fff" }}
                >
                  Bill Details
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)", mt: 0.5 }}
                >
                  Complete bill information
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseViewBillModal}
              sx={{ color: "#fff" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, backgroundColor: "#f5f5f5" }}>
            {viewBillLoading ? (
              <Box sx={{ p: 3 }}>
                {/* Bill Details Skeleton */}
                <Paper
                  elevation={0}
                  sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: "#fff" }}
                >
                  <Skeleton
                    variant="text"
                    width={200}
                    height={28}
                    sx={{ mb: 2 }}
                  />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Skeleton variant="text" width={150} height={20} />
                        <Skeleton variant="text" width={200} height={20} />
                      </Box>
                    ))}
                  </Box>
                </Paper>

                {/* Customer Info Skeleton */}
                <Paper
                  elevation={0}
                  sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: "#fff" }}
                >
                  <Skeleton
                    variant="text"
                    width={200}
                    height={28}
                    sx={{ mb: 2 }}
                  />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Skeleton variant="text" width={150} height={20} />
                        <Skeleton variant="text" width={200} height={20} />
                      </Box>
                    ))}
                  </Box>
                </Paper>

                {/* Billing Details Skeleton */}
                <Paper
                  elevation={0}
                  sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: "#fff" }}
                >
                  <Skeleton
                    variant="text"
                    width={200}
                    height={28}
                    sx={{ mb: 2 }}
                  />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Skeleton variant="text" width={150} height={20} />
                        <Skeleton variant="text" width={100} height={20} />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            ) : selectedBill ? (
              <Box sx={{ p: 3 }}>
                {/* Bill Identification Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            width: "40%",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Bill ID
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.billNumber}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Invoice Date
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {new Date(
                            selectedBill.invoiceDate,
                          ).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                     <TableRow>
  <TableCell sx={{ fontWeight: 600, borderBottom: "none" }}>Status</TableCell>
  <TableCell sx={{ borderBottom: "none" }}>
    <span
      className="inline-block rounded-full text-xs font-semibold px-3 py-1 capitalize"
      style={{
        backgroundColor:
          selectedBill.status === "paid"
            ? "#dcfce7"
            : selectedBill.status === "pending"
            ? "#fef9c3"
            : "#fee2e2",
        color:
          selectedBill.status === "paid"
            ? "#166534"
            : selectedBill.status === "pending"
            ? "#854d0e"
            : "#991b1b",
      }}
    >
      {selectedBill.status}
    </span>
  </TableCell>
</TableRow>
                    </TableBody>
                  </Table>
                </Paper>

                {/* Customer Information Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Business sx={{ color: "#1976d2", fontSize: 24 }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Customer Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            width: "40%",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Customer Name
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.billTo.customerName}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Email
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.billTo.customerEmail || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Phone
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.billTo.customerPhone || "N/A"}
                        </TableCell>
                      </TableRow>
                      {selectedBill.billTo.customerAddress && (
                        <>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              Address
                            </TableCell>
                            <TableCell
                              sx={{ borderBottom: "1px solid #e0e0e0" }}
                            >
                              {selectedBill.billTo.customerAddress.addressLine1}
                              {selectedBill.billTo.customerAddress
                                .addressLine2 &&
                                `, ${selectedBill.billTo.customerAddress.addressLine2}`}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              sx={{ fontWeight: 600, borderBottom: "none" }}
                            >
                              City, State, ZIP
                            </TableCell>
                            <TableCell sx={{ borderBottom: "none" }}>
                              {selectedBill.billTo.customerAddress.city},{" "}
                              {selectedBill.billTo.customerAddress.state}{" "}
                              {selectedBill.billTo.customerAddress.zipCode},{" "}
                              {selectedBill.billTo.customerAddress.country}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </Paper>

                {/* Pickup Information Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <LocationOn sx={{ color: "#1976d2", fontSize: 24 }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Pickup Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            width: "40%",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Address
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.pickup.address}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          City
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.pickup.city}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Weight
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.pickup.weight} lbs
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Container
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.pickup.container}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Container Type
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.pickup.containerType}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: 600, borderBottom: "none" }}
                        >
                          Quantity
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none" }}>
                          {selectedBill.pickup.quantity}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>

                {/* Delivery Information Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <LocationOn sx={{ color: "#1976d2", fontSize: 24 }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Delivery Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            width: "40%",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Address
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.delivery.address}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          City
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          {selectedBill.delivery.city}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: 600, borderBottom: "none" }}
                        >
                          Date
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none" }}>
                          {new Date(
                            selectedBill.delivery.date,
                          ).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>

                {/* Billing Information Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <AttachMoney sx={{ color: "#1976d2", fontSize: 24 }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Billing Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            width: "40%",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Work Order
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          ${selectedBill.billing.wO}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Line Haul
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          ${selectedBill.billing.lineHaul}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          FSC
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          ${selectedBill.billing.fsc}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Other
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                          ${selectedBill.billing.other}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            borderBottom: "none",
                            fontSize: "1rem",
                          }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: "none",
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: "#2e7d32",
                          }}
                        >
                          ${selectedBill.billing.total}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>

                {/* Notes Section */}
                {selectedBill.notes && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <CalendarToday sx={{ color: "#1976d2", fontSize: 24 }} />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#2D3748" }}
                      >
                        Notes
                      </Typography>
                    </Box>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              width: "40%",
                              borderBottom: "none",
                            }}
                          >
                            Notes
                          </TableCell>
                          <TableCell sx={{ borderBottom: "none" }}>
                            {selectedBill.notes}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Paper>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 8,
                }}
              >
                <Typography>No bill details available</Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Mark as Paid Modal */}
        <Dialog
          open={markPaidModalOpen}
          onClose={handleCloseMarkPaidModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            },
          }}
        >
          <DialogTitle
            className="border-b-0 bg-[#2e7d32] flex items-center justify-between gap-3 py-4 px-6 relative rounded-t-lg"
            sx={{ backgroundColor: "#2e7d32" }}
          >
            <Box className="flex items-center gap-3 flex-1">
              <Box className="bg-white rounded-lg w-12 h-12 flex items-center justify-center border-2 border-green-300 shadow-sm">
                <Receipt className="text-xl text-green-600" />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  className="font-bold text-white mb-0.5 text-xl"
                >
                  Mark Bill as Paid
                </Typography>
                <Typography
                  variant="body2"
                  className="text-white text-sm opacity-95"
                >
                  Record payment information for this bill
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseMarkPaidModal}
              sx={{
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
              size="small"
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent
            className="p-0 bg-gray-100 flex-1 overflow-y-auto"
            sx={{ p: 0, backgroundColor: "#f5f5f5" }}
          >
            <Box sx={{ p: 3 }}>
              {selectedBillForPayment && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#2D3748", mb: 1 }}
                    >
                      {selectedBillForPayment.billId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Amount: ${selectedBillForPayment.amount.toLocaleString()}
                    </Typography>
                  </Paper>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          value={paymentForm.paymentMethod}
                          onChange={handlePaymentFormChange("paymentMethod")}
                          label="Payment Method"
                        >
                          <MenuItem value="bank_transfer">
                            Bank Transfer
                          </MenuItem>
                          <MenuItem value="credit_card">Credit Card</MenuItem>
                          <MenuItem value="cash">Cash</MenuItem>
                          <MenuItem value="check">Check</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Payment Reference *"
                        value={paymentForm.paymentReference}
                        onChange={handlePaymentFormChange("paymentReference")}
                        fullWidth
                        placeholder="e.g., TXN123456789"
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Payment Notes"
                        multiline
                        rows={3}
                        value={paymentForm.paymentNotes}
                        onChange={handlePaymentFormChange("paymentNotes")}
                        fullWidth
                        placeholder="Additional notes about the payment..."
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              backgroundColor: "#f8f9fa",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <Button
              onClick={handleCloseMarkPaidModal}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                py: 1,
                border: "1px solid red",
                color: "red",
                "&:hover": {
                  color:"white",
                  backgroundColor: "RED",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitMarkAsPaid}
              variant="contained"
              disabled={isMarkingPaid || !paymentForm.paymentReference.trim()}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                py: 1,
                backgroundColor: "#2e7d32",
                color: "#fff",
                "&:hover": { backgroundColor: "#1b5e20" },
                "&:disabled": {
                  backgroundColor: "#ccc",
                  color: "white",
                },
              }}
            >
              {isMarkingPaid ? "Marking..." : "Mark as Paid"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;
