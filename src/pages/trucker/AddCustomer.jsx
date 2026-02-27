import { useState, useEffect, useCallback, useMemo } from "react";
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
  InputAdornment,
  CircularProgress,
  Alert,
  Skeleton,
  Modal,
  IconButton,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Search,
  Clear,
  Close,
  Visibility,
  Edit,
  Delete,
  PersonAdd,
  Business,
  Phone,
  Email,
  LocationOn,
  Save,
  Cancel,
  Description,
} from "@mui/icons-material";
import { FaPlus } from "react-icons/fa";

import { BASE_API_URL } from "../../apiConfig";
import { useThemeConfig } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const AddCustomer = () => {
  const { userType } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState(() => ({
    companyName: "",
    mcDotNo: "",
    email: "",
    mobile: "",
    companyAddress: "",
    city: "",
    state: "",
    country: "USA",
    zipCode: "",
    notes: "",
  }));

  const { themeConfig } = useThemeConfig();
  const brand =
    themeConfig.header?.bg && themeConfig.header.bg !== "white"
      ? themeConfig.header.bg
      : themeConfig.tokens?.primary || "#1976d2";
  const headerTextColor = themeConfig.header?.text || "#ffffff";

  // Fetch all customers on component mount
  useEffect(() => {
    fetchAllCustomers();
  }, []);

  // API Functionsdgdgdfgdff
  const fetchAllCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${BASE_API_URL}/api/v1/${userType}-customer/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setCustomersData(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch customers");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${BASE_API_URL}/api/v1/${userType}-customer/add`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to add customer");
      }
    } catch (err) {
      console.error("Error adding customer:", err);
      throw err;
    }
  };

  const updateCustomer = async (customerId, updateData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${BASE_API_URL}/api/v1/${userType}-customer/${customerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to update customer");
      }
    } catch (err) {
      console.error("Error updating customer:", err);
      throw err;
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${BASE_API_URL}/api/v1/${userType}-customer/${customerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        throw new Error(result.message || "Failed to delete customer");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      throw err;
    }
  };

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleAddCustomer = useCallback(() => {
    setFormData({
      companyName: "",
      mcDotNo: "",
      email: "",
      mobile: "",
      companyAddress: "",
      city: "",
      state: "",
      country: "USA",
      zipCode: "",
      notes: "",
    });
    setAddModalOpen(true);
  }, []);

  const handleEditCustomer = useCallback((customer) => {
    // Map API response to form data
    setFormData({
      companyName: customer.companyInfo?.companyName || "",
      mcDotNo: customer.companyInfo?.mcDotNo || "",
      email: customer.contactInfo?.email || "",
      mobile: customer.contactInfo?.mobile || "",
      companyAddress: customer.locationDetails?.companyAddress || "",
      city: customer.locationDetails?.city || "",
      state: customer.locationDetails?.state || "",
      country: customer.locationDetails?.country || "USA",
      zipCode: customer.locationDetails?.zipCode || "",
      notes: customer.notes || "",
    });
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  }, []);

  const handleViewCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  }, []);

  const openDeleteConfirm = useCallback((customer) => {
    setDeleteTarget(customer);
    setConfirmDeleteOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setConfirmDeleteOpen(false);
    setDeleteTarget(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteCustomer(deleteTarget._id || deleteTarget.customerId);
      await fetchAllCustomers();
      setSuccess("Customer deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Failed to delete customer");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const handleSaveCustomer = async (e) => {
    if (e) {
      e.preventDefault();
    }

    try {
      setLoading(true);

      if (editModalOpen) {
        // Update existing customer with form data
        await updateCustomer(selectedCustomer.customerId, formData);
        setSuccess("Customer updated successfully");
      } else {
        // Add new customer
        await addCustomer(formData);
        setSuccess("Customer added successfully");
      }

      // Refresh the customer list
      await fetchAllCustomers();
      setAddModalOpen(false);
      setEditModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to save customer");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search term - memoized for performance
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return customersData;

    const searchLower = searchTerm.toLowerCase();
    return customersData.filter(
      (customer) =>
        customer.companyInfo?.companyName
          ?.toLowerCase()
          .includes(searchLower) ||
        customer.contactInfo?.email?.toLowerCase().includes(searchLower) ||
        customer.contactInfo?.mobile?.includes(searchTerm) ||
        customer.locationDetails?.city?.toLowerCase().includes(searchLower) ||
        customer.locationDetails?.state?.toLowerCase().includes(searchLower),
    );
  }, [customersData, searchTerm]);

  const totalItems = filteredData ? filteredData.length : 0;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / rowsPerPage));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageStart = clampedPage * rowsPerPage;
  const pageEnd = Math.min(totalItems, pageStart + rowsPerPage);
  const visibleRows = (filteredData || []).slice(pageStart, pageEnd);
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

  const handleFormInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const inputFieldSx = {
    "& .MuiInputBase-root": {
      borderRadius: 2,
      backgroundColor: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4A90E2" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#4A90E2",
    },
    "& .MuiInputBase-root.Mui-focused": { backgroundColor: "#fff" },
    "& input:-webkit-autofill": { WebkitBoxShadow: "0 0 0 1000px #fff inset" },
  };

  // AddCustomer Skeleton Loading Component
  const AddCustomerSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton
            variant="rectangular"
            width={100}
            height={32}
            sx={{ borderRadius: 2 }}
          />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton
            variant="rectangular"
            width={250}
            height={40}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={140}
            height={40}
            sx={{ borderRadius: 2 }}
          />
        </Stack>
      </Box>

      {/* Table Skeleton */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: "linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)",
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                <TableCell key={col}>
                  <Skeleton variant="text" width={100} height={20} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton variant="text" width={150} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={120} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={180} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={120} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={150} />
                </TableCell>
                <TableCell>
                  <Skeleton
                    variant="rectangular"
                    width={70}
                    height={26}
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={28}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={28}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={28}
                      sx={{ borderRadius: 1 }}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );

  if (loading && customersData.length === 0) {
    return <AddCustomerSkeleton />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <div className="mb-2 flex items-center gap-2">
        <div className="text-2xl font-semibold text-gray-700">Add Customer</div>
        <span className="inline-block rounded-full text-white text-base font-semibold px-3 py-1"
  style={{ backgroundColor: '#1976d2' }}>
  {customersData.length}{" "}
  {customersData.length === 1 ? "Customer" : "Customers"}
</span>
      </div>
      <div className="mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 flex items-center gap-2 w-full">
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
              placeholder="Search customers..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full h-11 rounded-md border border-gray-200 pl-10 pr-3 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
         <button
  onClick={handleAddCustomer}
  className="h-11 px-4 rounded-md text-white text-base font-medium cursor-pointer flex items-center gap-2"
  style={{ 
    backgroundColor: '#1976d2', 
    border: '1px solid #1976d2' 
  }}
  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1565c0'}
  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1976d2'}
>
  <FaPlus size={14} />
  Add Customer
</button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left bg-slate-100">
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-l-xl border-t border-b border-l border-gray-200">
                  Company Name
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  MC/DOT No
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Email
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Mobile
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Location
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
              {totalItems > 0 ? (
                visibleRows.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-gray-700 truncate rounded-l-xl border-t border-b border-l border-gray-200">
                      {customer.companyInfo?.companyName}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {customer.companyInfo?.mcDotNo}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {customer.contactInfo?.email}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {customer.contactInfo?.mobile}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {customer.locationDetails?.city},{" "}
                      {customer.locationDetails?.state}{" "}
                      {customer.locationDetails?.zipCode}
                    </td>
                    <td className="px-4 py-4 text-gray-700 border-t border-b border-gray-200">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-base font-medium border ${
                          (customer.status || "").toLowerCase() === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="h-8 px-3 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="h-8 px-3 rounded-md border border-cyan-600 text-cyan-600 text-base cursor-pointer font-medium hover:bg-cyan-600 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(customer)}
                          className="h-8 px-3 rounded-md border border-red-600 text-red-600 text-base cursor-pointer font-medium hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-sm text-slate-500"
                    colSpan={7}
                  >
                    {customersData.length === 0
                      ? "No customers found. Add your first customer!"
                      : "No customers match your search criteria"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-2 border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center justify-between pr-40">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{`Showing ${totalItems === 0 ? 0 : pageStart + 1} to ${pageEnd} of ${totalItems} customers`}</span>
        </div>
        <div className="flex items-center gap-2 mr-8">
          <label className="inline-flex items-center gap-2 font-medium text-gray-700">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
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
                key={num}
                onClick={() => setPage(Number(num) - 1)}
                className={`min-w-8 h-8 px-2 rounded-xl text-base cursor-pointer ${
                  num === clampedPage + 1
                    ? "border border-gray-900"
                    : "text-slate-700"
                }`}
              >
                {num}
              </button>
            ),
          )}
          <button
            onClick={() => setPage(Math.min(totalPages - 1, clampedPage + 1))}
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

      <Dialog
        open={confirmDeleteOpen}
        onClose={closeDeleteConfirm}
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
          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "1.25rem" }}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography align="center" sx={{ pt: 1.5 }}>
            Are you sure you want to delete{" "}
            {deleteTarget?.companyInfo?.companyName
              ? `"${deleteTarget.companyInfo.companyName}"`
              : "this customer"}
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={closeDeleteConfirm}
            disabled={deleting}
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
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
            sx={{ borderRadius: 3, textTransform: "none", px: 3, color: "#fff" }}
          >
            {deleting ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 0,
            background: brand,
            color: headerTextColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PersonAdd sx={{ fontSize: 28, color: "white" }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: "white" }}>
              Add New Customer
            </Typography>
          </Box>
          <IconButton
            onClick={() => setAddModalOpen(false)}
            sx={{
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: "#f8f9fa" }}>
          <Box component="form" onSubmit={handleSaveCustomer}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Company Information Section */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "0.3s",
                    width: "100%",
                    bgcolor: "#fff",

                    "&:hover": {
                      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Business sx={{ color: "#1976d2", fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2D3748" }}>
                      Company Information
                    </Typography>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      // border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Company Name"
                          name="companyName"
                          value={formData.companyName || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          required
                          variant="outlined"
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="MC/DOT No"
                          name="mcDotNo"
                          value={formData.mcDotNo || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          required
                          variant="outlined"
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 700,
                                    color: "text.secondary",
                                  }}
                                >
                                  #
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                          sx={inputFieldSx}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Contact Information Section */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "0.3s",
                    width: "100%",
                    bgcolor: "#fff",
                    "&:hover": {
                      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Phone sx={{ color: "#1976d2", fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2D3748" }}>
                      Contact Details
                    </Typography>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      // border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email Address"
                          name="email"
                          type="email"
                          value={formData.email || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          required
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number"
                          name="mobile"
                          value={formData.mobile || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          required
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={inputFieldSx}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Location Section */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "0.3s",
                    width: "100%",
                    bgcolor: "#fff",
                    "&:hover": {
                      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LocationOn sx={{ color: "#1976d2", fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2D3748" }}>
                      Location
                    </Typography>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      // border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Street Address"
                          name="companyAddress"
                          value={formData.companyAddress || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="e.g. 123 Logistics Way"
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="City"
                          name="city"
                          value={formData.city || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="State/Province"
                          name="state"
                          value={formData.state || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Zip/Postal Code"
                          name="zipCode"
                          value={formData.zipCode || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Country"
                          name="country"
                          value={formData.country || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          sx={inputFieldSx}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Additional Info Section jhgjhgj*/}
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "0.3s",
                    width: "100%",
                    bgcolor: "#fff",
                    "&:hover": {
                      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Description sx={{ color: "#1976d2", fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2D3748" }}>
                      Additional Notes
                    </Typography>
                  </Box>
                  <TextField
                    label="Additional Notes"
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleFormInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Any specific requirements or details..."
                    sx={inputFieldSx}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <DialogActions sx={{ p: 3, bgcolor: "#fff" }}>
              <Button
                onClick={() => setAddModalOpen(false)}
                variant="outlined"
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    border: "1px solid #ef4444",
                  },
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={loading}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 4,
                  py: 1,
                  fontWeight: 600,
                  backgroundColor: "#1d4ed8",
                  color: "#fff !important", // ✅ force white
                  "&:hover": {
                    backgroundColor: "#05080eff",
                    color: "#fff !important", // ✅ keep white on hover
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Create Customer"
                )}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-customer-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 850,
            bgcolor: "white",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            maxHeight: "90vh",
            overflow: "auto",
            border: "1px solid #e0e0e0",
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid #e0e0e0",
              background: brand,
              borderRadius: "12px 12px 0 0",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ color: "white" }}>
                Edit Customer
              </Typography>
              <IconButton
                onClick={() => setEditModalOpen(false)}
                sx={{
                  color: headerTextColor,
                  backgroundColor: "transparent",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Close sx={{ color: "white" }} />
              </IconButton>
            </Box>
          </Box>
          <Box component="form" onSubmit={handleSaveCustomer} sx={{ p: 0, bgcolor: "#f8f9fa" }}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Company Information Section */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "0.3s",
                    width: "100%",
                    bgcolor: "#fff",
                    "&:hover": {
                      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Business sx={{ color: "#1976d2", fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2D3748" }}>
                      Company Information
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: "12px" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Company Name"
                          name="companyName"
                          value={formData.companyName || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          required
                          variant="outlined"
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="MC/DOT No"
                          name="mcDotNo"
                          value={formData.mcDotNo || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          required
                          variant="outlined"
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                                  #
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                          sx={inputFieldSx}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Contact Details Section */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "0.3s",
                    width: "100%",
                    bgcolor: "#fff",
                    "&:hover": {
                      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Phone sx={{ color: "#1976d2", fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2D3748" }}>
                      Contact Details
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: "12px" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email Address"
                          name="email"
                          type="email"
                          value={formData.email || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          required
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number"
                          name="mobile"
                          value={formData.mobile || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          required
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={inputFieldSx}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Location Section */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "0.3s",
                    width: "100%",
                    bgcolor: "#fff",
                    "&:hover": {
                      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LocationOn sx={{ color: "#1976d2", fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2D3748" }}>
                      Location
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: "12px" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Street Address"
                          name="companyAddress"
                          value={formData.companyAddress || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="e.g. 123 Logistics Way"
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="City"
                          name="city"
                          value={formData.city || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="State/Province"
                          name="state"
                          value={formData.state || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Zip/Postal Code"
                          name="zipCode"
                          value={formData.zipCode || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Country"
                          name="country"
                          value={formData.country || ""}
                          onChange={handleFormInputChange}
                          fullWidth
                          variant="outlined"
                          sx={inputFieldSx}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Additional Notes */}
                <Grid
                  item
                  xs={12}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "0.3s",
                    width: "100%",
                    bgcolor: "#fff",
                    "&:hover": {
                      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Description sx={{ color: "#1976d2", fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2D3748" }}>
                      Additional Notes
                    </Typography>
                  </Box>
                  <TextField
                    label="Additional Notes"
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleFormInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Any specific requirements or details..."
                    sx={inputFieldSx}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <DialogActions sx={{ p: 3, bgcolor: "#fff" }}>
              <Button
                onClick={() => setEditModalOpen(false)}
                variant="outlined"
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    border: "1px solid #ef4444",
                  },
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={loading}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 4,
                  py: 1,
                  fontWeight: 600,
                  backgroundColor: "#1d4ed8",
                  color: "#fff !important",
                  "&:hover": {
                    backgroundColor: "#05080eff",
                    color: "#fff !important",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Update Customer"
                )}
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Modal>

      {/* View Customer Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            pt: 2,
            px: 3,
            background: brand,
            color: headerTextColor,
            borderRadius: "8px 8px 0 0",
            minHeight: 64,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Business sx={{ fontSize: 28, color: "white" }} />
            <Typography variant="h5" fontWeight={600} color="white">
              Customer Details
            </Typography>
          </Box>
          <IconButton
            onClick={() => setViewModalOpen(false)}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: "#f5f5f5" }}>
          {selectedCustomer ? (
            <Box sx={{ p: 3 }}>
              {/* Basic Information Section */}
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
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Business sx={{ color: "#1976d2", fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#2D3748" }}
                  >
                    Basic Information
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
                        Company Name
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                        {selectedCustomer.companyInfo?.companyName || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        MC/DOT Number
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                        {selectedCustomer.companyInfo?.mcDotNo || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                        <Chip
                          label={selectedCustomer.status}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            backgroundColor:
                              selectedCustomer.status === "active"
                                ? "#16a34a"
                                : "#e5e7eb",
                            "& .MuiChip-label": {
                              color: "#ffffff", // 👈 FORCE WHITE TEXT
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: "none" }}>
                        Created Date
                      </TableCell>
                      <TableCell sx={{ borderBottom: "none" }}>
                        {new Date(
                          selectedCustomer.createdAt,
                        ).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Contact Information Section */}
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
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Phone sx={{ color: "#1976d2", fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#2D3748" }}
                  >
                    Contact Information
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
                        Email
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                        {selectedCustomer.contactInfo?.email || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: "none" }}>
                        Mobile
                      </TableCell>
                      <TableCell sx={{ borderBottom: "none" }}>
                        {selectedCustomer.contactInfo?.mobile || "N/A"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Location Details Section */}
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
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <LocationOn sx={{ color: "#1976d2", fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#2D3748" }}
                  >
                    Location Details
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
                        {selectedCustomer.locationDetails?.companyAddress ||
                          "N/A"}
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
                        {selectedCustomer.locationDetails?.city || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        State
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                        {selectedCustomer.locationDetails?.state || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Zip Code
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                        {selectedCustomer.locationDetails?.zipCode || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: "none" }}>
                        Country
                      </TableCell>
                      <TableCell sx={{ borderBottom: "none" }}>
                        {selectedCustomer.locationDetails?.country || "N/A"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Additional Notes Section */}
              {selectedCustomer.notes && (
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
                    <Description sx={{ color: "#1976d2", fontSize: 24 }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Additional Notes
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
                          {selectedCustomer.notes}
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
              <Typography>No customer details available</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AddCustomer;
