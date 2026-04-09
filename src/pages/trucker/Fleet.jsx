import { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
  Skeleton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Chip,
  InputAdornment,
  Grid,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Visibility, 
  Search,
  Close,
  LocalShipping,
  DirectionsCar,
  Build,
  CalendarToday
} from '@mui/icons-material';
import { BASE_API_URL } from '../../apiConfig';
import { useThemeConfig } from '../../context/ThemeContext';
import { FiPlus } from "react-icons/fi";

// just for github
const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state for adding/editing vehiclesfsdgtddf
  const [formData, setFormData] = useState({
    vehicleNo: '',
    chassisNo: '',
    engineNo: '',
    modelYear: '',
    vehicleType: '',
    make: '',
    model: '',
    capacity: '',
    fuelType: '',
  });

  // Vehicle types and fuel types for dropdowns
  const vehicleTypes = ['Dry Van', 'Flatbed', 'Refrigerated', 'Container', 'Tanker', 'Car Carrier', 'Lowboy'];
  const fuelTypes = ['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'CNG', 'LPG'];
  const { themeConfig } = useThemeConfig();
  const brand = (themeConfig.header?.bg && themeConfig.header.bg !== 'white') ? themeConfig.header.bg : (themeConfig.tokens?.primary || '#1976d2');
  const headerTextColor = themeConfig.header?.text || '#ffffff';
  const inputFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f8f9fb",
      "& fieldset": { borderColor: "#e0e6ee" },
      "&:hover fieldset": { borderColor: "#1976d2" },
      "&.Mui-focused fieldset": { borderColor: "#1976d2" },
      "&.Mui-focused": { backgroundColor: "#fff" }
    }
  };

  // API Helper Functions
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const makeAPICall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${BASE_API_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load vehicles on component mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await makeAPICall('/api/v1/vehicle/my-vehicles');
      if (response.success) {
        setVehicles(response.vehicles || []);
      } else {
        setError('Failed to load vehicles');
      }
    } catch (err) {
      setError('Error loading vehicles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.vehicleNo?.toLowerCase().includes(searchLower) ||
      vehicle.chassisNo?.toLowerCase().includes(searchLower) ||
      vehicle.engineNo?.toLowerCase().includes(searchLower) ||
      vehicle.vehicleType?.toLowerCase().includes(searchLower) ||
      vehicle.make?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower) ||
      vehicle.status?.toLowerCase().includes(searchLower)
    );
  });

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

  const handleAddVehicle = async () => {
    try {
      const response = await makeAPICall('/api/v1/vehicle/add', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (response.success) {
        setSnackbar({ open: true, message: 'Vehicle added successfully', severity: 'success' });
        setOpenAddDialog(false);
        resetForm();
        loadVehicles();
      } else {
        setSnackbar({ open: true, message: 'Failed to add vehicle', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error adding vehicle: ' + err.message, severity: 'error' });
    }
  };

  const handleEditVehicle = async () => {
    try {
      const response = await makeAPICall(`/api/v1/vehicle/update/${selectedVehicle._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (response.success) {
        setSnackbar({ open: true, message: 'Vehicle updated successfully', severity: 'success' });
        setOpenEditDialog(false);
        resetForm();
        loadVehicles();
      } else {
        setSnackbar({ open: true, message: 'Failed to update vehicle', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating vehicle: ' + err.message, severity: 'error' });
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      const response = await makeAPICall(`/api/v1/vehicle/delete/${vehicleToDelete}`, {
        method: 'DELETE',
      });
      if (response.success) {
        setSnackbar({ open: true, message: 'Vehicle deleted successfully', severity: 'success' });
        setOpenDeleteDialog(false);
        setVehicleToDelete(null);
        loadVehicles();
      } else {
        setSnackbar({ open: true, message: 'Failed to delete vehicle', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting vehicle: ' + err.message, severity: 'error' });
    }
  };

  const openDeleteDialogHandler = (vehicleId) => {
    setVehicleToDelete(vehicleId);
    setOpenDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      vehicleNo: '',
      chassisNo: '',
      engineNo: '',
      modelYear: '',
      vehicleType: '',
      make: '',
      model: '',
      capacity: '',
      fuelType: '',
    });
    setSelectedVehicle(null);
  };

  const openEditDialogHandler = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicleNo: vehicle.vehicleNo || '',
      chassisNo: vehicle.chassisNo || '',
      engineNo: vehicle.engineNo || '',
      modelYear: vehicle.modelYear || '',
      vehicleType: vehicle.vehicleType || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      capacity: vehicle.capacity || '',
      fuelType: vehicle.fuelType || '',
    });
    setOpenEditDialog(true);
  };

  const openViewDialogHandler = async (vehicle) => {
    try {
      setViewLoading(true);
      setOpenViewDialog(true);
      const response = await makeAPICall(`/api/v1/vehicle/details/${vehicle._id}`);
      if (response.success) {
        setSelectedVehicle(response.vehicle);
      } else {
        setSnackbar({ open: true, message: 'Failed to load vehicle details', severity: 'error' });
        setOpenViewDialog(false);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error loading vehicle details: ' + err.message, severity: 'error' });
      setOpenViewDialog(false);
    } finally {
      setViewLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Vehicle No', 'Chassis No', 'Engine No', 'Model Year', 'Vehicle Type', 'Make', 'Model', 'Capacity', 'Fuel Type', 'Status'];
    const csvRows = [headers.join(',')];

    vehicles.forEach(vehicle => {
      const values = [
        vehicle.vehicleNo,
        vehicle.chassisNo,
        vehicle.engineNo,
        vehicle.modelYear,
        vehicle.vehicleType,
        vehicle.make,
        vehicle.model,
        vehicle.capacity,
        vehicle.fuelType,
        vehicle.status
      ];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fleet_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const totalItems = filteredVehicles.length;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / rowsPerPage));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageStart = clampedPage * rowsPerPage;
  const pageEnd = Math.min(totalItems, pageStart + rowsPerPage);
  const visibleRows = filteredVehicles.slice(pageStart, pageEnd);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, clampedPage + 1 - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (start > 1) pages.push(1, '…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push('…', totalPages);
    return pages;
  };

  // Fleet Skeleton Loading Component
  const FleetSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="rectangular" width={250} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>

      {/* Table Skeleton */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((col) => (
                <TableCell key={col}>
                  <Skeleton variant="text" width={100} height={20} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={80} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={70} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination Skeleton */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e0e0e0' }}>
          <Skeleton variant="text" width={200} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={100} />
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  if (loading) {
    return <FleetSkeleton />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-2xl font-semibold text-gray-700">Fleet Overview</div>
        <span className="inline-block rounded-full text-white text-base font-semibold px-3 py-1" style={{ backgroundColor: "#1976d2" }}>
          {vehicles.length} Vehicles
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
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full h-11 rounded-md border border-gray-200 pl-10 pr-3 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={exportToCSV}
            disabled={vehicles.length === 0}
            className="h-11 px-6 rounded-md border border-blue-600 text-blue-600 text-base font-medium cursor-pointer hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        <button
  onClick={() => setOpenAddDialog(true)}
  className="h-11 px-4 rounded-md text-white text-base font-medium cursor-pointer flex items-center gap-2"
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
  <FiPlus size={18} strokeWidth={4} />
  Add Vehicle
</button>
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left bg-slate-100">
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-l-xl border-t border-b border-l border-gray-200">Vehicle No</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Chassis No</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Engine No</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Model Year</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Vehicle Type</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Make</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Model</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Capacity</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Status</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-r-xl border-t border-b border-r border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-slate-700 rounded-l-xl border-t border-b border-l border-gray-200">Loading…</td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 border-t border-b border-gray-200"></td>
                    <td className="px-3 py-2 rounded-r-xl border-t border-b border-r border-gray-200"></td>
                  </tr>
                ))
              ) : totalItems === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={10}>No vehicles found</td>
                </tr>
              ) : (
                visibleRows.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-gray-700 truncate rounded-l-xl border-t border-b border-l border-gray-200">
                      {vehicle.vehicleNo}
                    </td>
                   <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
  <div className="relative group max-w-[145px]">

    <span className="block truncate">
      {vehicle.chassisNo || "-"}
    </span>

    {/* Tooltip */}
    {vehicle.chassisNo && (
      <div className="absolute left-0 top-full mt-1 hidden group-hover:block 
                      bg-gray-900 text-white text-sm px-3 py-1.5 
                      rounded-md shadow-lg whitespace-nowrap z-50">
        {vehicle.chassisNo}
      </div>
    )}

  </div>
</td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {vehicle.engineNo}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {vehicle.modelYear}
                    </td>
                    <td className="px-4 py-4 text-gray-700 truncate border-t border-b border-gray-200">
                      <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                        {vehicle.vehicleType}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {vehicle.make}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {vehicle.model}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 truncate border-t border-b border-gray-200">
                      {vehicle.capacity} tons
                    </td>
                    <td className="px-4 py-4 text-gray-700 border-t border-b border-gray-200">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold border ${
                        (vehicle.status || '').toLowerCase() === 'active'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {vehicle.status && vehicle.status[0].toUpperCase() + vehicle.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewDialogHandler(vehicle)}
                          className="h-8 px-3 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditDialogHandler(vehicle)}
                          className="h-8 px-3 rounded-md border border-cyan-600 text-cyan-600 text-base cursor-pointer font-medium hover:bg-cyan-600 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteDialogHandler(vehicle._id)}
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
          <span>{`Showing ${totalItems === 0 ? 0 : pageStart + 1} to ${pageEnd} of ${totalItems} vehicles`}</span>
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
              <span key={`e-${idx}`} className="px-1 text-gray-900">…</span>
            ) : (
              <button
                key={num}
                onClick={() => setPage(Number(num) - 1)}
                className={`min-w-8 h-8 px-2 rounded-xl text-base cursor-pointer ${
                  num === clampedPage + 1 ? "border border-gray-900" : "text-slate-700"
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

      {/* Add Vehicle Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            textAlign: "left",
            pb: 2,
            pt: 3,
            background: brand,
            color: headerTextColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight={700} color="white">
            Add New Vehicle
          </Typography>
          <IconButton onClick={() => setOpenAddDialog(false)} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ background: "#f5f7fb" }}>
          <Box sx={{ p: 2 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #e8edf2", background: "#fff" }}>
              <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 1, color: "#1f2937" }}>
                <Box sx={{ width: 4, height: 22, background: "#1976d2", borderRadius: 1 }} />
                Vehicle Information
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vehicle Number"
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Chassis Number"
                    value={formData.chassisNo}
                    onChange={(e) => setFormData({ ...formData, chassisNo: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Engine Number"
                    value={formData.engineNo}
                    onChange={(e) => setFormData({ ...formData, engineNo: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Model Year"
                    type="number"
                    value={formData.modelYear}
                    onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, mb: 1, borderRadius: 2, border: "1px solid #e8edf2", background: "#fff" }}>
  <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 1, color: "#1f2937" }}>
    <Box sx={{ width: 4, height: 22, background: "#1976d2", borderRadius: 1 }} />
    Specifications
  </Typography>
  <Grid container spacing={2.5} sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2.5 }}>
    <Grid item sx={{ gridColumn: "span 1" }}>
      <FormControl fullWidth required>
        <InputLabel>Vehicle Type</InputLabel>
        <Select
          value={formData.vehicleType}
          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
          label="Vehicle Type"
          sx={{
            borderRadius: "12px",
            backgroundColor: "#f8f9fb",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e6ee" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
          }}
        >
          {vehicleTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>

    <Grid item sx={{ gridColumn: "span 1" }}>
      <TextField
        label="Make"
        value={formData.make}
        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
        fullWidth
        required
        sx={{
          borderRadius: "12px",
          backgroundColor: "#f8f9fb",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e6ee" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
        }}
      />
    </Grid>

    <Grid item sx={{ gridColumn: "span 1" }}>
      <TextField
        label="Model"
        value={formData.model}
        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
        fullWidth
        required
        sx={{
          borderRadius: "12px",
          backgroundColor: "#f8f9fb",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e6ee" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
        }}
      />
    </Grid>

    <Grid item sx={{ gridColumn: "span 1" }}>
      <TextField
        label="Capacity (tons)"
        type="number"
        value={formData.capacity}
        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
        fullWidth
        required
        sx={{
          borderRadius: "12px",
          backgroundColor: "#f8f9fb",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e6ee" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
        }}
      />
    </Grid>

    <Grid item sx={{ gridColumn: "span 1" }}>
      <FormControl fullWidth required>
        <InputLabel>Fuel Type</InputLabel>
        <Select
          value={formData.fuelType}
          onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
          label="Fuel Type"
          sx={{
            borderRadius: "12px",
            backgroundColor: "#f8f9fb",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e6ee" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
          }}
        >
          {fuelTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  </Grid>
</Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 4, pr: 4 }}>
          <Button
            onClick={() => setOpenAddDialog(false)}
            sx={{
              borderRadius: 3,
              backgroundColor: "transparent",
              color: "#d32f2f",
              textTransform: "none",
              px: 3,
              border: "1px solid #d32f2f",
              "&:hover": { backgroundColor: "#d32f2f", color: "#fff" },
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddVehicle} variant="contained" sx={{ borderRadius: 3, textTransform: "none", px: 4, color: "#fff" }}>
            Add Vehicle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            textAlign: "left",
            pb: 2,
            pt: 3,
            background: brand,
            color: headerTextColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight={700} color="white">
            Edit Vehicle
          </Typography>
          <IconButton onClick={() => setOpenEditDialog(false)} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ background: "#f5f7fb" }}>
          <Box sx={{ p: 2 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #e8edf2", background: "#fff" }}>
              <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 1, color: "#1f2937" }}>
                <Box sx={{ width: 4, height: 22, background: "#1976d2", borderRadius: 1 }} />
                Vehicle Information
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vehicle Number"
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Chassis Number"
                    value={formData.chassisNo}
                    onChange={(e) => setFormData({ ...formData, chassisNo: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Engine Number"
                    value={formData.engineNo}
                    onChange={(e) => setFormData({ ...formData, engineNo: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Model Year"
                    type="number"
                    value={formData.modelYear}
                    onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, mb: 1, borderRadius: 2, border: "1px solid #e8edf2", background: "#fff" }}>
              <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 1, color: "#1f2937" }}>
                <Box sx={{ width: 4, height: 22, background: "#1976d2", borderRadius: 1 }} />
                Specifications
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      label="Vehicle Type"
                      fullWidth
                      sx={{
                        width: "100%",
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fb",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e6ee" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
                      }}
                    >
                      {vehicleTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Capacity (tons)"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    fullWidth
                    required
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Fuel Type</InputLabel>
                    <Select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      label="Fuel Type"
                      fullWidth
                      sx={{
                        width: "100%",
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fb",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e6ee" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
                      }}
                    >
                      {fuelTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 4, pr: 4 }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{
              color: "#d32f2f",
              border: "1px solid #d32f2f",
              borderRadius: 3,
              textTransform: "none",
              px: 3,
              "&:hover": { color: "white", backgroundColor: "#d32f2f" },
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleEditVehicle} variant="contained" sx={{ color: "#fff", borderRadius: 3, textTransform: "none", px: 4 }}>
            Update Vehicle
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Vehicle Details Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(to right, #1976d2, #1565c0)',
          color: '#fff',
          py: 3,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalShipping sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                Vehicle Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                Complete vehicle information
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setOpenViewDialog(false)}
            sx={{ color: '#fff' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5' }}>
          {viewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={50} />
                <Typography variant="body1" color="text.secondary">
                  Loading vehicle details...
                </Typography>
              </Box>
            </Box>
          ) : selectedVehicle ? (
            <Box sx={{ p: 3 }}>
              {/* Vehicle Information Section */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <DirectionsCar sx={{ color: '#1976d2', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Vehicle Information
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Vehicle Number</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.vehicleNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Chassis Number</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.chassisNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Engine Number</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.engineNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Model Year</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.modelYear}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Vehicle Type</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.vehicleType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Make</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.make}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Model</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.model}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Capacity</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.capacity} tons</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Fuel Type</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.fuelType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>Status</TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                       <Chip
  label={selectedVehicle.status}
  size="small"
  color={selectedVehicle.status === 'active' ? 'success' : 'warning'}
  sx={{
    fontWeight: 600,
    ...(selectedVehicle.status === 'active' && {
      backgroundColor: "#16a34a",
      "& .MuiChip-label": { color: "#fff" },
    }),
  }}
/>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Trucker Information Section */}
              {selectedVehicle.truckerId && (
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Build sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Trucker Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Company Name</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.truckerId.compName || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>MC/DOT Number</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.truckerId.mc_dot_no || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Phone Number</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.truckerId.phoneNo || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>Email</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>{selectedVehicle.truckerId.email || 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <Typography>No vehicle details available</Typography>
            </Box>
          )}
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)} sx={{ color: '#d32f2f', border: '1px solid #d32f2f', mb:2,mr:10, '&:hover': { color: 'white', backgroundColor: '#d32f2f' } }}>Close</Button>
        </DialogActions> */}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setVehicleToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            py: 2.5,
            px: 2.5,
            background: brand,
            color: '#fff',
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
          <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.25rem' }}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography align="center" sx={{ pt: 1.5 }}>
            Are you sure you want to delete this vehicle?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'center', gap: 1.5 }}>
          <Button
            onClick={() => {
              setOpenDeleteDialog(false);
              setVehicleToDelete(null);
            }}
            variant="outlined"
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              borderColor: '#111827',
              color: '#111827',
              '&:hover': { backgroundColor: '#111827', color: '#fff' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteVehicle}
            variant="contained"
            color="error"
            sx={{ borderRadius: 3, textTransform: 'none', px: 3, color: '#fff' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
