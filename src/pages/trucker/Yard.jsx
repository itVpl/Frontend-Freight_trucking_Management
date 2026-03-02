import { useState, useEffect } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { BASE_API_URL } from '../../apiConfig';
import { useThemeConfig } from '../../context/ThemeContext';

const Yard = () => {
  const { user, userType } = useAuth();
  const { themeConfig } = useThemeConfig();
  const brand = (themeConfig?.header?.bg && themeConfig.header.bg !== 'white')
    ? themeConfig.header.bg
    : (themeConfig?.tokens?.primary || '#1976d2');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [yardsData, setYardsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedYard, setSelectedYard] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    yardName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    coordinates: {
      latitude: '',
      longitude: '',
    },
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
  });

  // Fetch all yards on component mount
  useEffect(() => {
    fetchAllYards();
  }, []);

  // API Functions
  const fetchAllYards = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Get truckerId from various sources
      const truckerId =
        localStorage.getItem('truckerId') ||
        sessionStorage.getItem('truckerId') ||
        user?.truckerId ||
        user?._id ||
        user?.id ||
        null;

      if (!truckerId) {
        throw new Error('Trucker ID not found. Please login again.');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/yard/by-trucker?truckerId=${truckerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch yards');
      }

      const result = await response.json();
      
      // Handle the new API response structure
      if (result.success && result.data) {
        setYardsData(result.data || []);
      } else {
        setYardsData([]);
      }
    } catch (err) {
      console.error('Error fetching yards:', err);
      setError(err.message || 'Failed to fetch yards');
      // Set empty array if API fails (for development)
      setYardsData([]);
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

  const handleAddYard = () => {
    setSelectedYard(null);
    setFormErrors({});
    setFormData({
      yardName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      coordinates: {
        latitude: '',
        longitude: '',
      },
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      notes: '',
    });
    setAddModalOpen(true);
  };

  const handleViewYard = (yard) => {
    setSelectedYard(yard);
    setViewModalOpen(true);
  };

  const handleEditYard = (yard) => {
    setSelectedYard(yard);
    setFormErrors({});
    setFormData({
      yardName: yard.yardName || '',
      address: yard.address || '',
      city: yard.city || '',
      state: yard.state || '',
      zipCode: yard.zipCode || '',
      country: yard.country || '',
      coordinates: {
        latitude: yard.coordinates?.latitude || '',
        longitude: yard.coordinates?.longitude || '',
      },
      contactPerson: yard.contactPerson || '',
      contactPhone: yard.contactPhone || '',
      contactEmail: yard.contactEmail || '',
      notes: yard.notes || '',
    });
    setAddModalOpen(true);
  };

  const handleDeleteYard = async (yardId, skipConfirm = false) => {
    if (!skipConfirm) {
      if (!window.confirm('Are you sure you want to delete this yard?')) {
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_API_URL}/api/v1/yard/${yardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete yard');
      }

      window.alertify.success('Yard deleted successfully');
      fetchAllYards();
    } catch (err) {
      console.error('Error deleting yard:', err);
      window.alertify.error(err.message || 'Failed to delete yard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDialogOpen = (yard) => {
    setDeleteTarget(yard);
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
      await handleDeleteYard(deleteTarget._id, true);
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.yardName || formData.yardName.trim() === '') {
      errors.yardName = 'Yard Name is required';
    }
    
    if (!formData.address || formData.address.trim() === '') {
      errors.address = 'Address is required';
    }
    
    if (!formData.city || formData.city.trim() === '') {
      errors.city = 'City is required';
    }
    
    if (!formData.state || formData.state.trim() === '') {
      errors.state = 'State is required';
    }
    
    if (!formData.zipCode || formData.zipCode.trim() === '') {
      errors.zipCode = 'ZIP Code is required';
    }
    
    if (!formData.country || formData.country.trim() === '') {
      errors.country = 'Country is required';
    }
    
    if (formData.contactEmail && formData.contactEmail.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        errors.contactEmail = 'Please enter a valid email address';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveYard = async () => {
    // Validate form
    if (!validateForm()) {
      window.alertify.error('Please fill in all required fields correctly');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFormErrors({});
      const token = localStorage.getItem('token');
      
      const url = selectedYard
        ? `${BASE_API_URL}/api/v1/yard/${selectedYard._id}`
        : `${BASE_API_URL}/api/v1/yard`;
      
      const method = selectedYard ? 'PUT' : 'POST';

      // Prepare data with proper coordinate formatting
      const payload = {
        ...formData,
        coordinates: {
          latitude: formData.coordinates.latitude ? parseFloat(formData.coordinates.latitude) : 0,
          longitude: formData.coordinates.longitude ? parseFloat(formData.coordinates.longitude) : 0,
        }
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || (selectedYard ? 'Failed to update yard' : 'Failed to create yard'));
      }

      // Success - only show success when status is 200
      if (response.status === 200 || response.status === 201) {
        window.alertify.success(selectedYard ? 'Yard updated successfully' : 'Yard created successfully');
        setAddModalOpen(false);
        setFormErrors({});
        fetchAllYards();
      }
    } catch (err) {
      console.error('Error saving yard:', err);
      window.alertify.error(err.message || 'Failed to save yard');
    } finally {
      setSaving(false);
    }
  };

  // Filter yards based on search term
  const filteredData = yardsData.filter((yard) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (yard.yardName && yard.yardName.toLowerCase().includes(searchLower)) ||
      (yard.address && yard.address.toLowerCase().includes(searchLower)) ||
      (yard.city && yard.city.toLowerCase().includes(searchLower)) ||
      (yard.state && yard.state.toLowerCase().includes(searchLower)) ||
      (yard.contactPerson && yard.contactPerson.toLowerCase().includes(searchLower))
    );
  });

  const totalItems = filteredData ? filteredData.length : 0;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / rowsPerPage));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageStart = clampedPage * rowsPerPage;
  const pageEnd = Math.min(totalItems, pageStart + rowsPerPage);
  const visibleYards = (filteredData || []).slice(pageStart, pageEnd);
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

  // Yard Skeleton Loading Component
  const YardSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="text" width={180} height={32} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="rectangular" width={250} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>

      {/* Table Skeleton */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)' }}>
              {[1, 2, 3, 4, 5].map((col) => (
                <TableCell key={col}>
                  <Skeleton variant="text" width={100} height={20} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={200} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1 }} /></TableCell>
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

  if (loading && yardsData.length === 0) {
    return <YardSkeleton />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-2xl font-semibold text-gray-700">Yard Management</div>
        <span className="inline-block rounded-full text-white text-base font-semibold px-3 py-1"
              style={{ backgroundColor: '#1976d2' }}>
          {yardsData.length} {yardsData.length === 1 ? 'Yard' : 'Yards'}
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
              placeholder="Search yards..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full h-11 rounded-md border border-gray-200 pl-10 pr-3 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAddYard}
            className="h-11 px-4 rounded-md text-white text-base font-medium cursor-pointer flex items-center gap-2"
            style={{
              backgroundColor: '#1976d2',
              border: '1px solid #1976d2',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1565c0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1976d2'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Yard
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left bg-slate-100">
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-l-xl border-t border-b border-l border-gray-200">Yard Name</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Location</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Country</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">Contact Person</th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-r-xl border-t border-b border-r border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={5}>Loading…</td>
                </tr>
              ) : totalItems === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={5}>
                    {yardsData.length === 0 ? 'No yards found. Add your first yard!' : 'No yards match your search criteria'}
                  </td>
                </tr>
              ) : (
                visibleYards.map((yard) => (
                  <tr key={yard._id} className="hover:bg-slate-50">
                   <td className="px-5 py-4 font-medium text-gray-700 rounded-l-xl border-t border-b border-l border-gray-200">
  <div className="flex items-center gap-2 relative group max-w-[180px]">
    
    {/* <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V7a2 2 0 0 1 2-2h3v16H3z"></path>
        <path d="M9 21V3h6v18"></path>
        <path d="M15 21V9h4a2 2 0 0 1 2 2v10h-6z"></path>
      </svg>
    </span> */}

    <span className="block truncate">
      {yard.yardName || 'N/A'}
    </span>

    {/* Tooltip */}
    {yard.yardName && (
      <div className="absolute left-0 top-full mt-1 hidden group-hover:block 
                      bg-gray-900 text-white text-sm px-3 py-1.5 
                      rounded-md shadow-lg whitespace-nowrap z-50">
        {yard.yardName}
      </div>
    )}

  </div>
</td>
                   <td className="px-5 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
  <div className="relative group max-w-[270px]">

    <span className="block truncate">
      {yard.address
        ? `${yard.address}, ${yard.city || ''}, ${yard.state || ''} ${yard.zipCode || ''}`.trim()
        : 'N/A'}
    </span>

    {/* Tooltip */}
    {yard.address && (
      <div className="absolute left-0 top-full mt-1 hidden group-hover:block
                      bg-gray-900 text-white text-sm px-3 py-1.5
                      rounded-md shadow-lg whitespace-nowrap z-50">
        {`${yard.address}, ${yard.city || ''}, ${yard.state || ''} ${yard.zipCode || ''}`.trim()}
      </div>
    )}

  </div>
</td>
                    <td className="px-5 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      {yard.country || 'N/A'}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      <div className="flex flex-col">
                        <span>{yard.contactPerson || 'N/A'}</span>
                        {yard.contactPhone ? <span className="text-sm text-slate-500">{yard.contactPhone}</span> : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleViewYard(yard)}
                          className="h-8 px-3 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditYard(yard)}
                          className="h-8 px-3 rounded-md border border-cyan-600 text-cyan-600 text-base cursor-pointer font-medium hover:bg-cyan-600 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDialogOpen(yard)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleDeleteDialogClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
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
            Are you sure you want to delete {deleteTarget?.yardName ? `"${deleteTarget.yardName}"` : 'this yard'}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'center', gap: 1.5 }}>
          <Button
            onClick={handleDeleteDialogClose}
            variant="outlined"
            disabled={deleting}
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
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
            sx={{ borderRadius: 3, textTransform: 'none', px: 3, color: '#fff' }}
          >
            {deleting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <div className="mt-2 border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center justify-between pr-40">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{`Showing ${totalItems === 0 ? 0 : pageStart + 1} to ${pageEnd} of ${totalItems} yards`}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 font-medium text-gray-700">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
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
            num === '…' ? (
              <span key={`e-${idx}`} className="px-1 text-gray-900">…</span>
            ) : (
              <button
                key={num}
                onClick={() => setPage(Number(num) - 1)}
                className={`min-w-8 h-8 px-2 rounded-xl text-base cursor-pointer ${num === clampedPage + 1 ? "border border-gray-900" : "text-slate-700"}`}
              >
                {num}
              </button>
            )
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

      {/* Add/Edit Yard Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            minHeight: '85vh',
            maxHeight: '95vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#1976d2', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
            <Box sx={{ bgcolor: 'white', borderRadius: 2, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Warehouse sx={{ fontSize: 24, color: '#1976d2' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.25rem', mb: 0.5 }}>
                {selectedYard ? 'Edit Yard' : 'Create New Yard'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.875rem' }}>
                {selectedYard ? 'Update the yard details below' : 'Fill in the details to create a new yard'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setAddModalOpen(false)}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5', flex: 1, overflowY: 'auto' }}>
          <Box component="form" sx={{ p: 3 }}>
            {/* Form Sections */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Yard Information Section */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Warehouse sx={{ color: '#1976d2', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', fontSize: '1.125rem' }}>
                    Yard Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      label="Yard Name"
                      fullWidth
                      value={formData.yardName}
                      onChange={(e) => {
                        setFormData({ ...formData, yardName: e.target.value });
                        if (formErrors.yardName) {
                          setFormErrors({ ...formErrors, yardName: '' });
                        }
                      }}
                      placeholder="Yard name"
                      required
                      error={!!formErrors.yardName}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          transition: 'all 0.2s ease',
                          height: '42px',
                          '& .MuiOutlinedInput-input': {
                            padding: '10px 14px',
                            '&::placeholder': {
                              fontSize: '0.8rem',
                              opacity: 0.7,
                            },
                            width: '500px',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: formErrors.yardName ? '#d32f2f' : '#d1d5db',
                            borderWidth: '1.5px',
                          },
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Location Details Section */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {/* Main Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocationOn sx={{ color: '#388e3c', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', fontSize: '1.125rem' }}>
                    Location Details
                  </Typography>
                </Box>

                {/* Yard Address Subsection */}
                <Box sx={{ 
                  backgroundColor: '#fafafa', 
                  borderRadius: 2, 
                  p: 2, 
                  mb: 1.5,
                  border: '1px solid #e5e7eb'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <LocationOn sx={{ fontSize: 20, color: '#1976d2' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
                      Yard Address
                    </Typography>
                  </Box>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Address"
                        fullWidth
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                          if (formErrors.address) {
                            setFormErrors({ ...formErrors, address: '' });
                          }
                        }}
                        placeholder="Full Address"
                        required
                        error={!!formErrors.address}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.address ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.address ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.address ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.address ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="City"
                        fullWidth
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value });
                          if (formErrors.city) {
                            setFormErrors({ ...formErrors, city: '' });
                          }
                        }}
                        placeholder="City"
                        required
                        error={!!formErrors.city}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.city ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.city ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.city ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.city ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="State"
                        fullWidth
                        value={formData.state}
                        onChange={(e) => {
                          setFormData({ ...formData, state: e.target.value });
                          if (formErrors.state) {
                            setFormErrors({ ...formErrors, state: '' });
                          }
                        }}
                        placeholder="State"
                        required
                        error={!!formErrors.state}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.state ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.state ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.state ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.state ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="ZIP Code"
                        fullWidth
                        value={formData.zipCode}
                        onChange={(e) => {
                          setFormData({ ...formData, zipCode: e.target.value });
                          if (formErrors.zipCode) {
                            setFormErrors({ ...formErrors, zipCode: '' });
                          }
                        }}
                        placeholder="ZIP code"
                        required
                        error={!!formErrors.zipCode}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.zipCode ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.zipCode ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.zipCode ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.zipCode ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Country"
                        fullWidth
                        value={formData.country}
                        onChange={(e) => {
                          setFormData({ ...formData, country: e.target.value });
                          if (formErrors.country) {
                            setFormErrors({ ...formErrors, country: '' });
                          }
                        }}
                        placeholder="Country"
                        required
                        error={!!formErrors.country}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.country ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.country ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.country ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.country ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Paper>

              {/* Contact Information Section */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Person sx={{ color: '#7b1fa2', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', fontSize: '1.125rem' }}>
                    Contact Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Contact Person"
                      fullWidth
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Contact Person"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          transition: 'all 0.2s ease',
                          height: '42px',
                          '& .MuiOutlinedInput-input': {
                            padding: '10px 14px',
                            '&::placeholder': {
                              fontSize: '0.8rem',
                              opacity: 0.7,
                            },
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d1d5db',
                            borderWidth: '1.5px',
                          },
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact Phone"
                      fullWidth
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="e.g., +1-9876543210"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          transition: 'all 0.2s ease',
                          height: '42px',
                          '& .MuiOutlinedInput-input': {
                            padding: '10px 14px',
                            '&::placeholder': {
                              fontSize: '0.8rem',
                              opacity: 0.7,
                            },
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d1d5db',
                            borderWidth: '1.5px',
                          },
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact Email"
                      fullWidth
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => {
                        setFormData({ ...formData, contactEmail: e.target.value });
                        if (formErrors.contactEmail) {
                          setFormErrors({ ...formErrors, contactEmail: '' });
                        }
                      }}
                      placeholder="e.g., yard.mumbai@example.com"
                      error={!!formErrors.contactEmail}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          transition: 'all 0.2s ease',
                          height: '42px',
                          '& .MuiOutlinedInput-input': {
                            padding: '10px 14px',
                            '&::placeholder': {
                              fontSize: '0.8rem',
                              opacity: 0.7,
                            },
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: formErrors.contactEmail ? '#d32f2f' : '#d1d5db',
                            borderWidth: '1.5px',
                          },
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
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
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
          <Button
            onClick={() => setAddModalOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: 'red',
              color: 'red',
              px: 4,
              py: 1,
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: 'red',
                borderColor: 'red',
                color: 'white',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveYard}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: '#2F5AA8',
              px: 4,
              py: 1,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#244A8F'
              },
              '&:disabled': {
                backgroundColor: '#94a3b8',
              },
            }}
          >
            {saving ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                {selectedYard ? 'Updating...' : 'Creating...'}
              </Box>
            ) : (
              selectedYard ? 'Update Yard' : 'Create Yard'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Yard Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedYard(null);
        }}
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
            <Warehouse sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                Yard Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                Complete yard information
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => {
              setViewModalOpen(false);
              setSelectedYard(null);
            }}
            sx={{ color: '#fff' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5' }}>
          {selectedYard ? (
            <Box sx={{ p: 2 }}>
              {/* Yard Information Section */}
              {selectedYard.yardName && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Warehouse sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Yard Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0', py: 1 }}>Yard Name</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.yardName}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Location Details Section */}
              {(selectedYard.address || selectedYard.city || selectedYard.state || selectedYard.zipCode || selectedYard.country) && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <LocationOn sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Location Details
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      {selectedYard.address && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0', py: 1 }}>Address</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.address}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.city && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0', py: 1 }}>City</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.city}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.state && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0', py: 1 }}>State</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.state}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.zipCode && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0', py: 1 }}>ZIP Code</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.zipCode}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.country && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: 'none', py: 1 }}>Country</TableCell>
                          <TableCell sx={{ borderBottom: 'none', py: 1 }}>{selectedYard.country}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Contact Information Section */}
              {(selectedYard.contactPerson || selectedYard.contactPhone || selectedYard.contactEmail) && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Person sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Contact Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      {selectedYard.contactPerson && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0', py: 1 }}>Contact Person</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.contactPerson}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.contactPhone && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: selectedYard.contactEmail ? '1px solid #e0e0e0' : 'none', py: 1 }}>Contact Phone</TableCell>
                          <TableCell sx={{ borderBottom: selectedYard.contactEmail ? '1px solid #e0e0e0' : 'none', py: 1 }}>{selectedYard.contactPhone}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.contactEmail && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: 'none', py: 1 }}>Contact Email</TableCell>
                          <TableCell sx={{ borderBottom: 'none', py: 1 }}>{selectedYard.contactEmail}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Notes Section */}
              {selectedYard.notes && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Business sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Additional Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: 'none', py: 1 }}>Notes</TableCell>
                        <TableCell sx={{ borderBottom: 'none', py: 1 }}>{selectedYard.notes}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No yard data available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end', backgroundColor: '#f5f5f5' }}>
          <Button
            onClick={() => {
              setViewModalOpen(false);
              setSelectedYard(null);
            }}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#0d47a1',
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

export default Yard;
