import { useState, useEffect } from "react";
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
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  Warehouse,
  LocationOn,
  CalendarToday,
  Close,
  Person,
  Business,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { BASE_API_URL } from "../../apiConfig";
import { useThemeConfig } from "../../context/ThemeContext";

const YardDropContainer = () => {
  const { user, userType } = useAuth();
  const { themeConfig } = useThemeConfig();
  const brand =
    themeConfig?.header?.bg && themeConfig.header.bg !== "white"
      ? themeConfig.header.bg
      : themeConfig?.tokens?.primary || "#1976d2";
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [containersData, setContainersData] = useState([]);
  const [yardsList, setYardsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    containerNo: "",
    containerType: "",
    yardId: "",
    dropDate: "",
    dropTime: "",
    condition: "",
    notes: "",
  });

  // Fetch all containers and yards on component mount
  useEffect(() => {
    fetchAllContainers();
    fetchAllYards();
  }, []);

  // API Functions - Fetch Yards for dropdown
  const fetchAllYards = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      // Get truckerId from various sources
      const truckerId =
        localStorage.getItem("truckerId") ||
        sessionStorage.getItem("truckerId") ||
        user?.truckerId ||
        user?._id ||
        user?.id ||
        null;

      if (!truckerId) {
        throw new Error("Trucker ID not found. Please login again.");
      }

      const response = await fetch(
        `${BASE_API_URL}/api/v1/yard/by-trucker?truckerId=${truckerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch yards");
      }

      const result = await response.json();

      // Handle the new API response structure
      if (result.success && result.data) {
        setYardsList(result.data || []);
      } else {
        setYardsList([]);
      }
    } catch (err) {
      console.error("Error fetching yards:", err);
      setError(err.message || "Failed to fetch yards");
      setYardsList([]);
    }
  };

  // API Functions - Fetch Containers
  const fetchAllContainers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_API_URL}/api/v1/yard-drop-container`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch containers");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setContainersData(result.data || []);
      } else {
        setContainersData([]);
      }
    } catch (err) {
      console.error("Error fetching containers:", err);
      setError(err.message || "Failed to fetch containers");
      setContainersData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddContainer = () => {
    setSelectedContainer(null);
    setFormErrors({});
    setFormData({
      containerNo: "",
      containerType: "",
      yardId: "",
      dropDate: "",
      dropTime: "",
      condition: "",
      notes: "",
    });
    setAddModalOpen(true);
  };

  const handleViewContainer = (container) => {
    setSelectedContainer(container);
    setViewModalOpen(true);
  };

  const handleEditContainer = (container) => {
    setSelectedContainer(container);
    setFormErrors({});
    setFormData({
      containerNo: container.containerNo || "",
      containerType: container.containerType || "",
      yardId: container.yardId || "",
      dropDate: container.dropDate || "",
      dropTime: container.dropTime || "",
      condition: container.condition || "",
      notes: container.notes || "",
    });
    setAddModalOpen(true);
  };

  const handleDeleteContainer = async (containerId, skipConfirm = false) => {
    if (!skipConfirm) {
      if (!window.confirm("Are you sure you want to delete this container?")) {
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_API_URL}/api/v1/yard-drop-container/${containerId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete container");
      }

      window.alertify.success("Container deleted successfully");
      fetchAllContainers();
    } catch (err) {
      console.error("Error deleting container:", err);
      window.alertify.error(err.message || "Failed to delete container");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDialogOpen = (container) => {
    setDeleteTarget(container);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteDialogClose = () => {
    if (deleting) return;
    setConfirmDeleteOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      setDeleting(true);
      await handleDeleteContainer(deleteTarget._id, true);
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.containerNo || formData.containerNo.trim() === "") {
      errors.containerNo = "Container Number is required";
    }

    if (!formData.containerType || formData.containerType.trim() === "") {
      errors.containerType = "Container Type is required";
    }

    if (!formData.yardId || formData.yardId.trim() === "") {
      errors.yardId = "Yard is required";
    }

    if (!formData.dropDate || formData.dropDate.trim() === "") {
      errors.dropDate = "Drop Date is required";
    }

    if (!formData.dropTime || formData.dropTime.trim() === "") {
      errors.dropTime = "Drop Time is required";
    }

    if (!formData.condition || formData.condition.trim() === "") {
      errors.condition = "Condition is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveContainer = async () => {
    // Validate form
    if (!validateForm()) {
      window.alertify.error("Please fill in all required fields correctly");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFormErrors({});
      const token = localStorage.getItem("token");

      // Convert time format from HH:MM to HH:MM AM/PM format
      const formatTime = (time24) => {
        if (!time24) return "";
        const [hours, minutes] = time24.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      };

      const payload = {
        containerNo: formData.containerNo,
        containerType: formData.containerType,
        yardId: formData.yardId,
        dropDate: formData.dropDate,
        dropTime: formatTime(formData.dropTime),
        condition: formData.condition,
        notes: formData.notes || "",
      };

      const response = await fetch(
        `${BASE_API_URL}/api/v1/yard-drop-container`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create container");
      }

      // Success - only show success when status is 200 or 201
      if (response.status === 200 || response.status === 201) {
        window.alertify.success("Container created successfully");
        setAddModalOpen(false);
        setFormErrors({});
        fetchAllContainers();
      }
    } catch (err) {
      console.error("Error saving container:", err);
      window.alertify.error(err.message || "Failed to save container");
    } finally {
      setSaving(false);
    }
  };

  // Filter containers based on search term
  const filteredData = containersData.filter((container) => {
    const searchLower = searchTerm.toLowerCase();
    const yard = yardsList.find((y) => y._id === container.yardId);
    return (
      (container.containerNo &&
        container.containerNo.toLowerCase().includes(searchLower)) ||
      (container.containerType &&
        container.containerType.toLowerCase().includes(searchLower)) ||
      (yard &&
        yard.yardName &&
        yard.yardName.toLowerCase().includes(searchLower))
    );
  });

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

  // YardDropContainer Skeleton Loading Component
  const YardDropContainerSkeleton = () => (
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
          <Skeleton variant="text" width={250} height={32} />
          <Skeleton
            variant="rectangular"
            width={120}
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
                  <Skeleton variant="text" width={120} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={150} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={150} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={100} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={100} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={100} />
                </TableCell>
                <TableCell>
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={32}
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination Skeleton */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Skeleton variant="text" width={200} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton
              variant="rectangular"
              width={80}
              height={32}
              sx={{ borderRadius: 1 }}
            />
            <Skeleton variant="text" width={100} />
            <Skeleton
              variant="rectangular"
              width={80}
              height={32}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  if (loading && containersData.length === 0) {
    return <YardDropContainerSkeleton />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-2xl font-semibold text-gray-700">
          Yard Drop Container Management
        </div>
        <span
          className="inline-block rounded-full text-white text-base font-semibold px-3 py-1"
          style={{ backgroundColor: "#1976d2" }}
        >
          {containersData.length}{" "}
          {containersData.length === 1 ? "Container" : "Containers"}
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
              placeholder="Search containers..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full h-11 rounded-md border border-gray-200 pl-10 pr-3 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAddContainer}
            className="h-11 px-4 rounded-md text-white text-base font-medium cursor-pointer flex items-center gap-2"
            style={{ backgroundColor: "#1976d2", border: "1px solid #1976d2" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1565c0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#1976d2")
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Container
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left bg-slate-100">
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-l-xl border-t border-b border-l border-gray-200">
                  Container No
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Container Type
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Yard
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Drop Date
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Drop Time
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Condition
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-r-xl border-t border-b border-r border-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-500"
                    colSpan={7}
                  >
                    Loading…
                  </td>
                </tr>
              ) : totalItems > 0 ? (
                visibleRows.map((container) => {
                  const yardIdValue =
                    typeof container.yardId === "object" &&
                    container.yardId !== null
                      ? container.yardId._id || container.yardId
                      : container.yardId;
                  const yardName =
                    typeof container.yardId === "object" &&
                    container.yardId !== null
                      ? container.yardId.yardName || container.yardId.name
                      : yardsList.find((y) => y._id === yardIdValue)?.yardName;
                  const formatDate = (dateString) => {
                    if (!dateString) return "N/A";
                    if (dateString.includes("T"))
                      return dateString.split("T")[0];
                    return dateString;
                  };
                  const condition = (container.condition || "").toLowerCase();
                  const conditionClasses =
                    condition === "good"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : condition === "damaged"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-slate-100 text-slate-700 border-slate-300";
                  return (
                    <tr key={container._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-gray-700 truncate rounded-l-xl border-t border-b border-l border-gray-200">
                        {container.containerNo || "N/A"}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                        {container.containerType || "N/A"}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                        {yardName || "N/A"}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                        {formatDate(container.dropDate)}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                        {container.dropTime || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-gray-700 border-t border-b border-gray-200">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-base font-medium border ${conditionClasses}`}
                        >
                          {container.condition || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewContainer(container)}
                            className="h-8 px-3 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteDialogOpen(container)}
                            className="h-8 px-3 rounded-md border border-red-600 text-red-600 text-base cursor-pointer font-medium hover:bg-red-600 hover:text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-sm text-slate-500"
                    colSpan={7}
                  >
                    {containersData.length === 0
                      ? "No containers found. Add your first container!"
                      : "No containers match your search criteria"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-2 border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center justify-between pr-40">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{`Showing ${totalItems === 0 ? 0 : pageStart + 1} to ${pageEnd} of ${totalItems} containers`}</span>
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

      <Dialog open={confirmDeleteOpen} onClose={handleDeleteDialogClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
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
            {deleteTarget?.containerNo ? `"${deleteTarget.containerNo}"` : "this container"}
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: "center", gap: 1.5 }}>
          <Button
            onClick={handleDeleteDialogClose}
            variant="outlined"
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
            {deleting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Yard Drop Container Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
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
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flex: 1 }}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.3)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Warehouse sx={{ fontSize: 24, color: "#1976d2" }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, fontSize: "1.25rem", mb: 0.5 }}
              >
                Create New Yard Drop Container
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.95, fontSize: "0.875rem" }}
              >
                Fill in the details to create a new yard drop container
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setAddModalOpen(false)}
            sx={{
              color: "white",
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
          sx={{ p: 0, backgroundColor: "#f5f5f5", flex: 1, overflowY: "auto" }}
        >
          <Box component="form" sx={{ p: 3 }}>
            {/* Form Sections */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Container Information Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
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
                    <Warehouse sx={{ color: "#1976d2", fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#2D3748",
                      fontSize: "1.125rem",
                    }}
                  >
                    Container Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Container Number"
                      fullWidth
                      value={formData.containerNo}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          containerNo: e.target.value,
                        });
                        if (formErrors.containerNo) {
                          setFormErrors({ ...formErrors, containerNo: "" });
                        }
                      }}
                      placeholder="Container Number"
                      required
                      error={!!formErrors.containerNo}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#fff",
                          transition: "all 0.2s ease",
                          height: "42px",
                          "& .MuiOutlinedInput-input": {
                            padding: "10px 14px",
                            "&::placeholder": {
                              fontSize: "0.8rem",
                              opacity: 0.7,
                            },
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: formErrors.containerNo
                              ? "#d32f2f"
                              : "#d1d5db",
                            borderWidth: "1.5px",
                          },
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.containerNo
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.containerNo
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#6b7280",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: formErrors.containerNo ? "#d32f2f" : "#1976d2",
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Container Type"
                      fullWidth
                      value={formData.containerType}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          containerType: e.target.value,
                        });
                        if (formErrors.containerType) {
                          setFormErrors({ ...formErrors, containerType: "" });
                        }
                      }}
                      placeholder="e.g., 40' Standard (Dry Van)"
                      required
                      error={!!formErrors.containerType}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#fff",
                          transition: "all 0.2s ease",
                          height: "42px",
                          "& .MuiOutlinedInput-input": {
                            padding: "10px 14px",
                            "&::placeholder": {
                              fontSize: "0.8rem",
                              opacity: 0.7,
                            },
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: formErrors.containerType
                              ? "#d32f2f"
                              : "#d1d5db",
                            borderWidth: "1.5px",
                          },
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.containerType
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.containerType
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#6b7280",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: formErrors.containerType
                            ? "#d32f2f"
                            : "#1976d2",
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={yardsList}
                      getOptionLabel={(option) => option.yardName || ""}
                      value={
                        yardsList.find((y) => y._id === formData.yardId) || null
                      }
                      onChange={(event, newValue) => {
                        setFormData({
                          ...formData,
                          yardId: newValue ? newValue._id : "",
                        });
                        if (formErrors.yardId) {
                          setFormErrors({ ...formErrors, yardId: "" });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Yard"
                          required
                          error={!!formErrors.yardId}
                          InputLabelProps={{ shrink: true }}
                          placeholder="Select Yard"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "#fff",
                              transition: "all 0.2s ease",
                              height: "42px",
                              "& .MuiOutlinedInput-input": {
                                padding: "10px 14px",
                                "&::placeholder": {
                                  fontSize: "0.8rem",
                                  opacity: 0.7,
                                },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: formErrors.yardId
                                  ? "#d32f2f"
                                  : "#d1d5db",
                                borderWidth: "1.5px",
                              },
                            },
                            "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor: formErrors.yardId
                                  ? "#d32f2f"
                                  : "#1976d2",
                                borderWidth: "2px",
                              },
                            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.yardId
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#6b7280",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: formErrors.yardId ? "#d32f2f" : "#1976d2",
                              fontWeight: 600,
                            },
                            width: "300px",
                          }}
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-inputRoot": {
                          padding: "0 !important",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Location Details Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {/* Main Header */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
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
                    <LocationOn sx={{ color: "#388e3c", fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#2D3748",
                      fontSize: "1.125rem",
                    }}
                  >
                    Location Details
                  </Typography>
                </Box>

                {/* Yard Address Subsection */}
                <Box
                  sx={{
                    backgroundColor: "#fafafa",
                    borderRadius: 2,
                    p: 2,
                    mb: 1.5,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <LocationOn sx={{ fontSize: 20, color: "#1976d2" }} />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "#333",
                        fontSize: "0.95rem",
                      }}
                    >
                      Yard Address
                    </Typography>
                  </Box>
                  <Grid container spacing={1.5}>
                    {(() => {
                      const selectedYard = formData.yardId
                        ? yardsList.find((y) => y._id === formData.yardId)
                        : null;
                      return (
                        <>
                          <Grid item xs={12}>
                            <TextField
                              label="Full Address"
                              fullWidth
                              value={selectedYard?.address || ""}
                              placeholder="Full Address"
                              InputLabelProps={{ shrink: true }}
                              disabled
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  backgroundColor: "#f9fafb",
                                  transition: "all 0.2s ease",
                                  height: "42px",
                                  "& .MuiOutlinedInput-input": {
                                    padding: "10px 14px",
                                    "&::placeholder": {
                                      fontSize: "0.8rem",
                                      opacity: 0.7,
                                    },
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#d1d5db",
                                    borderWidth: "1.5px",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#6b7280",
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="City"
                              fullWidth
                              value={selectedYard?.city || ""}
                              placeholder="City"
                              InputLabelProps={{ shrink: true }}
                              disabled
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  backgroundColor: "#f9fafb",
                                  transition: "all 0.2s ease",
                                  height: "42px",
                                  "& .MuiOutlinedInput-input": {
                                    padding: "10px 14px",
                                    "&::placeholder": {
                                      fontSize: "0.8rem",
                                      opacity: 0.7,
                                    },
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#d1d5db",
                                    borderWidth: "1.5px",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#6b7280",
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="State"
                              fullWidth
                              value={selectedYard?.state || ""}
                              placeholder="State"
                              InputLabelProps={{ shrink: true }}
                              disabled
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  backgroundColor: "#f9fafb",
                                  transition: "all 0.2s ease",
                                  height: "42px",
                                  "& .MuiOutlinedInput-input": {
                                    padding: "10px 14px",
                                    "&::placeholder": {
                                      fontSize: "0.8rem",
                                      opacity: 0.7,
                                    },
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#d1d5db",
                                    borderWidth: "1.5px",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#6b7280",
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="ZIP Code"
                              fullWidth
                              value={selectedYard?.zipCode || ""}
                              placeholder="ZIP code"
                              InputLabelProps={{ shrink: true }}
                              disabled
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  backgroundColor: "#f9fafb",
                                  transition: "all 0.2s ease",
                                  height: "42px",
                                  "& .MuiOutlinedInput-input": {
                                    padding: "10px 14px",
                                    "&::placeholder": {
                                      fontSize: "0.8rem",
                                      opacity: 0.7,
                                    },
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#d1d5db",
                                    borderWidth: "1.5px",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#6b7280",
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Country"
                              fullWidth
                              value={selectedYard?.country || ""}
                              placeholder="Country"
                              InputLabelProps={{ shrink: true }}
                              disabled
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  backgroundColor: "#f9fafb",
                                  transition: "all 0.2s ease",
                                  height: "42px",
                                  "& .MuiOutlinedInput-input": {
                                    padding: "10px 14px",
                                    "&::placeholder": {
                                      fontSize: "0.8rem",
                                      opacity: 0.7,
                                    },
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#d1d5db",
                                    borderWidth: "1.5px",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#6b7280",
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                },
                              }}
                            />
                          </Grid>
                        </>
                      );
                    })()}
                  </Grid>
                </Box>
              </Paper>

              {/* Drop Details Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
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
                    <CalendarToday sx={{ color: "#388e3c", fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#2D3748",
                      fontSize: "1.125rem",
                    }}
                  >
                    Drop Details
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Drop Date"
                      type="date"
                      fullWidth
                      value={formData.dropDate}
                      onChange={(e) => {
                        setFormData({ ...formData, dropDate: e.target.value });
                        if (formErrors.dropDate) {
                          setFormErrors({ ...formErrors, dropDate: "" });
                        }
                      }}
                      required
                      error={!!formErrors.dropDate}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#fff",
                          transition: "all 0.2s ease",
                          height: "42px",
                          "& .MuiOutlinedInput-input": {
                            padding: "10px 14px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: formErrors.dropDate
                              ? "#d32f2f"
                              : "#d1d5db",
                            borderWidth: "1.5px",
                          },
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.dropDate
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.dropDate
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#6b7280",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: formErrors.dropDate ? "#d32f2f" : "#1976d2",
                          fontWeight: 600,
                        },
                        width: "226px",
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Drop Time"
                      type="time"
                      fullWidth
                      value={formData.dropTime}
                      onChange={(e) => {
                        setFormData({ ...formData, dropTime: e.target.value });
                        if (formErrors.dropTime) {
                          setFormErrors({ ...formErrors, dropTime: "" });
                        }
                      }}
                      required
                      error={!!formErrors.dropTime}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#fff",
                          transition: "all 0.2s ease",
                          height: "42px",
                          "& .MuiOutlinedInput-input": {
                            padding: "10px 14px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: formErrors.dropTime
                              ? "#d32f2f"
                              : "#d1d5db",
                            borderWidth: "1.5px",
                          },
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.dropTime
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.dropTime
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#6b7280",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: formErrors.dropTime ? "#d32f2f" : "#1976d2",
                          fontWeight: 600,
                        },
                        width: "226px",
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={["good", "damaged", "fair"]}
                      value={formData.condition || null}
                      onChange={(event, newValue) => {
                        setFormData({ ...formData, condition: newValue || "" });
                        if (formErrors.condition) {
                          setFormErrors({ ...formErrors, condition: "" });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Condition"
                          required
                          error={!!formErrors.condition}
                          InputLabelProps={{ shrink: true }}
                          placeholder="Select Condition"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "#fff",
                              transition: "all 0.2s ease",
                              height: "42px",
                              "& .MuiOutlinedInput-input": {
                                padding: "10px 14px",
                                "&::placeholder": {
                                  fontSize: "0.8rem",
                                  opacity: 0.7,
                                },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: formErrors.condition
                                  ? "#d32f2f"
                                  : "#d1d5db",
                                borderWidth: "1.5px",
                              },
                            },
                            "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor: formErrors.condition
                                  ? "#d32f2f"
                                  : "#1976d2",
                                borderWidth: "2px",
                              },
                            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: formErrors.condition
                                ? "#d32f2f"
                                : "#1976d2",
                              borderWidth: "2px",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#6b7280",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: formErrors.condition
                                ? "#d32f2f"
                                : "#1976d2",
                              fontWeight: 600,
                            },
                            width: "226px",
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </li>
                      )}
                      getOptionLabel={(option) =>
                        option
                          ? option.charAt(0).toUpperCase() + option.slice(1)
                          : ""
                      }
                      sx={{
                        "& .MuiAutocomplete-inputRoot": {
                          padding: "0 !important",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Notes"
                      fullWidth
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Additional Notes"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#fff",
                          transition: "all 0.2s ease",
                          height: "42px",
                          "& .MuiOutlinedInput-input": {
                            padding: "10px 14px",
                            "&::placeholder": {
                              fontSize: "0.8rem",
                              opacity: 0.7,
                            },
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#d1d5db",
                            borderWidth: "1.5px",
                          },
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1976d2",
                              borderWidth: "2px",
                            },
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#6b7280",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#1976d2",
                          fontWeight: 600,
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
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#fafafa",
          }}
        >
          <Button
            onClick={() => setAddModalOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              borderColor: "red",
              color: "red",
              px: 4,
              py: 1,
              fontWeight: 500,
              fontSize: "0.95rem",
              "&:hover": {
                backgroundColor: "red",
                color: "white",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveContainer}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              backgroundColor: "#2F5AA8",
              px: 4,
              py: 1,
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              "&:hover": {
                backgroundColor: "#244A8F",
              },
              "&:disabled": {
                backgroundColor: "#94a3b8",
              },
            }}
          >
            {saving ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
                <CircularProgress size={16} sx={{ color: "white" }} />
                Creating...
              </Box>
            ) : (
              "Create Container"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Yard Drop Container Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedContainer(null);
        }}
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
            <Warehouse sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff" }}>
                Yard Drop Container Details
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.9)", mt: 0.5 }}
              >
                Complete container information
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => {
              setViewModalOpen(false);
              setSelectedContainer(null);
            }}
            sx={{ color: "#fff" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: "#f5f5f5" }}>
          {selectedContainer ? (
            <Box sx={{ p: 2 }}>
              {/* Container Information Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
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
                    mb: 1.5,
                  }}
                >
                  <Warehouse sx={{ color: "#1976d2", fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#2D3748" }}
                  >
                    Container Information
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    {selectedContainer.containerNo && (
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            width: "40%",
                            borderBottom: "1px solid #e0e0e0",
                            py: 1,
                          }}
                        >
                          Container Number
                        </TableCell>
                        <TableCell
                          sx={{ borderBottom: "1px solid #e0e0e0", py: 1 }}
                        >
                          {selectedContainer.containerNo}
                        </TableCell>
                      </TableRow>
                    )}
                    {selectedContainer.containerType && (
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: selectedContainer.yardId
                              ? "1px solid #e0e0e0"
                              : "none",
                            py: 1,
                          }}
                        >
                          Container Type
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: selectedContainer.yardId
                              ? "1px solid #e0e0e0"
                              : "none",
                            py: 1,
                          }}
                        >
                          {selectedContainer.containerType}
                        </TableCell>
                      </TableRow>
                    )}
                    {selectedContainer.yardId && (
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: 600, borderBottom: "none", py: 1 }}
                        >
                          Yard
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none", py: 1 }}>
                          {(() => {
                            const yardIdValue =
                              typeof selectedContainer.yardId === "object" &&
                              selectedContainer.yardId !== null
                                ? selectedContainer.yardId._id ||
                                  selectedContainer.yardId
                                : selectedContainer.yardId;
                            const yardName =
                              typeof selectedContainer.yardId === "object" &&
                              selectedContainer.yardId !== null
                                ? selectedContainer.yardId.yardName ||
                                  selectedContainer.yardId.name
                                : yardsList.find((y) => y._id === yardIdValue)
                                    ?.yardName;
                            return yardName || "N/A";
                          })()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>

              {/* Drop Details Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
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
                    mb: 1.5,
                  }}
                >
                  <CalendarToday sx={{ color: "#1976d2", fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#2D3748" }}
                  >
                    Drop Details
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    {selectedContainer.dropDate && (
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            width: "40%",
                            borderBottom: "1px solid #e0e0e0",
                            py: 1,
                          }}
                        >
                          Drop Date
                        </TableCell>
                        <TableCell
                          sx={{ borderBottom: "1px solid #e0e0e0", py: 1 }}
                        >
                          {selectedContainer.dropDate.includes("T")
                            ? selectedContainer.dropDate.split("T")[0]
                            : selectedContainer.dropDate}
                        </TableCell>
                      </TableRow>
                    )}
                    {selectedContainer.dropTime && (
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            borderBottom: selectedContainer.condition
                              ? "1px solid #e0e0e0"
                              : "none",
                            py: 1,
                          }}
                        >
                          Drop Time
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: selectedContainer.condition
                              ? "1px solid #e0e0e0"
                              : "none",
                            py: 1,
                          }}
                        >
                          {selectedContainer.dropTime}
                        </TableCell>
                      </TableRow>
                    )}
                    {selectedContainer.condition && (
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: 600, borderBottom: "none", py: 1 }}
                        >
                          Condition
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none", py: 1 }}>
                          <span
                            className="inline-block rounded-full text-xs font-semibold px-3 py-1 capitalize"
                            style={{
                              backgroundColor:
                                selectedContainer.condition === "good"
                                  ? "#2e7d32"
                                  : selectedContainer.condition === "damaged"
                                    ? "#d32f2f"
                                    : "#e0e0e0",
                              color:
                                selectedContainer.condition === "good" ||
                                selectedContainer.condition === "damaged"
                                  ? "#ffffff"
                                  : "rgba(0,0,0,0.87)",
                            }}
                          >
                            {selectedContainer.condition}
                          </span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>

              {/* Notes Section */}
              {selectedContainer.notes && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
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
                      mb: 1.5,
                    }}
                  >
                    <Business sx={{ color: "#1976d2", fontSize: 24 }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#2D3748" }}
                    >
                      Additional Information
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
                            py: 1,
                          }}
                        >
                          Notes
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none", py: 1 }}>
                          {selectedContainer.notes}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                No container data available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            justifyContent: "flex-end",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Button
            onClick={() => {
              setViewModalOpen(false);
              setSelectedContainer(null);
            }}
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              "&:hover": {
                backgroundColor: "#0d47a1",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default YardDropContainer;
