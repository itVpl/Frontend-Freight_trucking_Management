import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Switch,
} from '@mui/material';
import { 
  Add, 
  Search, 
  Clear, 
  Close, 
  AssignmentInd,
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
  Warning,
  Lock
} from '@mui/icons-material';
 
import { BASE_API_URL } from '../../apiConfig';
import { useThemeConfig } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SHIPPER_PERMISSION_KEYS, SHIPPER_PERMISSION_LABELS } from '../../config/permissions';

const SUB_USERS_BASE = '/api/v1/shipper_driver/my-sub-users';

const AddUserShipper = () => {
  const { userType } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [subUsers, setSubUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSubUser, setSelectedSubUser] = useState(null);
  const [formData, setFormData] = useState(() => ({
    name: '',
    email: '',
    password: '',
    ...Object.fromEntries(SHIPPER_PERMISSION_KEYS.map((k) => [k, false])),
  }));

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedUserForPermission, setSelectedUserForPermission] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subUserToDelete, setSubUserToDelete] = useState(null);

  const sidebarOptions = SHIPPER_PERMISSION_KEYS.map((key) => ({ key, label: SHIPPER_PERMISSION_LABELS[key] }));


  const { themeConfig } = useThemeConfig();
  const brand = (themeConfig.header?.bg && themeConfig.header.bg !== 'white') ? themeConfig.header.bg : (themeConfig.tokens?.primary || '#1976d2');
  const headerTextColor = themeConfig.header?.text || '#ffffff';

  useEffect(() => {
    fetchSubUsers();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchSubUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_API_URL}${SUB_USERS_BASE}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.subUsers)) {
        setSubUsers(result.subUsers);
      } else {
        throw new Error(result.message || 'Failed to fetch sub-users');
      }
    } catch (err) {
      console.error('Error fetching sub-users:', err);
      setError(err.message || 'Failed to fetch sub-users');
    } finally {
      setLoading(false);
    }
  };

  const createSubUser = async (payload) => {
    const response = await fetch(`${BASE_API_URL}${SUB_USERS_BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Failed to create sub-user');
    return result.subUser;
  };

  const updateSubUser = async (subUserId, updateData) => {
    const response = await fetch(`${BASE_API_URL}${SUB_USERS_BASE}/${subUserId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Failed to update sub-user');
    return result.subUser;
  };

  const deleteSubUser = async (subUserId) => {
    const response = await fetch(`${BASE_API_URL}${SUB_USERS_BASE}/${subUserId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Failed to remove sub-user');
    return true;
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

  const handleAddSubUser = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      ...Object.fromEntries(SHIPPER_PERMISSION_KEYS.map((k) => [k, false])),
    });
    setSelectedSubUser(null);
    setAddModalOpen(true);
    setEditModalOpen(false);
  }, []);

  const handleEditSubUser = useCallback((subUser) => {
    const perms = subUser.permissions || {};
    setFormData({
      name: subUser.name || '',
      email: subUser.email || '',
      password: '',
      ...Object.fromEntries(SHIPPER_PERMISSION_KEYS.map((k) => [k, !!perms[k]])),
    });
    setSelectedSubUser(subUser);
    setEditModalOpen(true);
    setAddModalOpen(true);
  }, []);

  const handleViewSubUser = useCallback((subUser) => {
    setSelectedSubUser(subUser);
    setViewModalOpen(true);
  }, []);

  const handleAssignPermission = useCallback((subUser) => {
    setSelectedUserForPermission(subUser);
    const perms = subUser.permissions || {};
    const initial = Object.fromEntries(SHIPPER_PERMISSION_KEYS.map((k) => [k, !!perms[k]]));
    setUserPermissions(initial);
    setPermissionModalOpen(true);
  }, []);

  const handlePermissionToggle = (key) => {
    setUserPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePermissions = async () => {
    if (!selectedUserForPermission?.subUserId) return;
    try {
      setLoading(true);
      await updateSubUser(selectedUserForPermission.subUserId, { permissions: userPermissions });
      setSuccess('Permissions saved successfully');
      setPermissionModalOpen(false);
      await fetchSubUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save permissions');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubUser = (subUserId) => {
    setSubUserToDelete(subUserId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!subUserToDelete) return;
    try {
      setLoading(true);
      await deleteSubUser(subUserToDelete);
      await fetchSubUsers();
      setSuccess('User removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove user');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setSubUserToDelete(null);
    }
  };

  const handleSaveSubUser = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const permissionsPayload = Object.fromEntries(
        SHIPPER_PERMISSION_KEYS.map((k) => [k, !!formData[k]])
      );
      if (editModalOpen && selectedSubUser?.subUserId) {
        const updateData = { name: formData.name, email: formData.email, permissions: permissionsPayload };
        if (formData.password && formData.password.trim()) updateData.password = formData.password;
        await updateSubUser(selectedSubUser.subUserId, updateData);
        setSuccess('Sub-user updated successfully');
      } else {
        if (!formData.password || formData.password.trim().length < 6) {
          setError('Password must be at least 6 characters');
          setTimeout(() => setError(null), 3000);
          return;
        }
        await createSubUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          permissions: permissionsPayload,
        });
        setSuccess('Sub-user created successfully');
      }
      await fetchSubUsers();
      setAddModalOpen(false);
      setEditModalOpen(false);
      setSelectedSubUser(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save sub-user');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };


  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return subUsers;
    const searchLower = searchTerm.toLowerCase();
    return subUsers.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(searchLower) ||
        (u.email || '').toLowerCase().includes(searchLower)
    );
  }, [subUsers, searchTerm]);

  const totalItems = filteredData?.length || 0;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / rowsPerPage));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageStart = clampedPage * rowsPerPage;
  const pageEnd = Math.min(totalItems, pageStart + rowsPerPage);
  const visibleRows = (filteredData || []).slice(pageStart, pageEnd);
  const getPageNumbers = () => {
    const pages = totalPages;
    const current = clampedPage + 1;
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }
    const nums = [];
    nums.push(1);
    if (current > 4) nums.push('…');
    const start = Math.max(2, current - 1);
    const end = Math.min(pages - 1, current + 1);
    for (let i = start; i <= end; i++) nums.push(i);
    if (current < pages - 3) nums.push('…');
    nums.push(pages);
    return nums;
  };

  const handleFormInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const inputFieldSx = {
    '& .MuiInputBase-root': {
      borderRadius: 2,
      backgroundColor: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4A90E2' },
    '& .MuiInputBase-root.Mui-focused': { backgroundColor: '#fff' },
    '& input:-webkit-autofill': { WebkitBoxShadow: '0 0 0 1000px #fff inset' },
  };

  if (loading && subUsers.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading sub-users...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <div className="mb-2 flex items-center gap-2">
        <div className="text-2xl font-semibold text-gray-700">Add User</div>
        <span
          className="inline-block rounded-full text-white text-base font-semibold px-3 py-1"
          style={{ backgroundColor: brand }}
        >
          {subUsers.length} {subUsers.length === 1 ? 'User' : 'Users'}
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full h-11 rounded-md border border-gray-200 pl-10 pr-3 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
  onClick={handleAddSubUser}
  className="h-11 px-4 rounded-md text-white text-base font-medium cursor-pointer flex items-center gap-2"
  style={{ backgroundColor: '#1976d2', border: '1px solid #1976d2' }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1565c0')}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1976d2')}
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
  Add User
</button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left bg-slate-100">
                <th className="px-4 py-3 text-base font-semibold text-gray-500 rounded-l-xl border-t border-b border-l border-gray-200">
                  Name
                </th>
                <th className="px-4 py-3 text-base font-semibold text-gray-500 border-t border-b border-gray-200">
                  Email
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
                visibleRows.map((subUser) => (
                  <tr key={subUser.subUserId} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-gray-700 truncate rounded-l-xl border-t border-b border-l border-gray-200">
                      {subUser.name}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      {subUser.email}
                    </td>
                    <td className="px-4 py-4 text-gray-700 border-t border-b border-gray-200">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-base font-medium border ${
                          subUser.isActive !== false
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {subUser.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 rounded-r-xl border-t border-b border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSubUser(subUser)}
                          className="h-8 px-3 rounded-md border border-blue-600 text-blue-600 text-base cursor-pointer font-medium hover:bg-blue-600 hover:text-white"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleAssignPermission(subUser)}
                          className="h-8 px-3 rounded-md border border-cyan-600 text-cyan-600 text-base cursor-pointer font-medium hover:bg-cyan-600 hover:text-white"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handleEditSubUser(subUser)}
                          className="h-8 px-3 rounded-md border border-sky-600 text-sky-600 text-base cursor-pointer font-medium hover:bg-sky-600 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSubUser(subUser.subUserId)}
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
                  <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={4}>
                    {subUsers.length === 0 ? 'No sub-users yet. Add your first sub-user!' : 'No users match your search'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-2 border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center justify-between pr-45">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{`Showing ${totalItems === 0 ? 0 : pageStart + 1} to ${pageEnd} of ${totalItems} users`}</span>
        </div>
        <div className="flex items-center gap-2">
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
            className={`h-8 px-3 text-base ${clampedPage === 0 ? 'text-slate-400 rounded-full cursor-not-allowed' : 'text-slate-900 font-semibold cursor-pointer rounded-md'}`}
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
                className={`min-w-8 h-8 px-2 rounded-xl text-base cursor-pointer ${num === clampedPage + 1 ? 'border border-gray-900' : 'text-slate-700'}`}
              >
                {num}
              </button>
            )
          )}
          <button
            onClick={() => setPage(Math.min(totalPages - 1, clampedPage + 1))}
            disabled={clampedPage >= totalPages - 1}
            className={`h-8 px-3 text-base ${clampedPage >= totalPages - 1 ? 'text-slate-400 rounded-full cursor-not-allowed' : 'text-slate-900 font-semibold cursor-pointer rounded-md'}`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Customer Dialog */}
      <Dialog 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 0,
          background: brand,
          color: headerTextColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonAdd sx={{ fontSize: 28, color:"white" }} />
            <Typography variant="h6" fontWeight={700} sx={{color:"white"}}>
              {editModalOpen ? 'Edit User' : 'Add New User'}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => { setAddModalOpen(false); setEditModalOpen(false); setSelectedSubUser(null); }}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa' }}>
          <Box component="form" onSubmit={handleSaveSubUser}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 3, bgcolor: '#fff' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>User details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleFormInputChange}
                        fullWidth
                        required
                        variant="outlined"
                        sx={inputFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleFormInputChange}
                        fullWidth
                        required
                        variant="outlined"
                        sx={inputFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={editModalOpen ? 'New password (leave blank to keep current)' : 'Password'}
                        name="password"
                        type="password"
                        value={formData.password || ''}
                        onChange={handleFormInputChange}
                        fullWidth
                        required={!editModalOpen}
                        variant="outlined"
                        placeholder={editModalOpen ? 'Optional' : 'Min 6 characters'}
                        sx={inputFieldSx}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 3, bgcolor: '#fff' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Permissions</Typography>
                  <Table size="small" sx={{ minWidth: 400 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 100, textAlign: 'center' }}>Allow</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sidebarOptions.map((opt) => (
                        <TableRow key={opt.key}>
                          <TableCell>{opt.label}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Switch
                              checked={!!formData[opt.key]}
                              onChange={(e) => setFormData((prev) => ({ ...prev, [opt.key]: e.target.checked }))}
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Box>

            <Divider />
            
            <DialogActions sx={{ p: 3, bgcolor: '#fff' }}>
              <Button 
                onClick={() => { setAddModalOpen(false); setEditModalOpen(false); setSelectedSubUser(null); }} 
                variant="outlined"
                color="inherit"
                sx={{ 
                  borderRadius: '8px', 
                  textTransform: 'none', 
                  px: 3,
                  fontWeight: 600,
                  color: "red",
                  border: "1px solid red",
                  ":hover": { background: "red", color: "white" }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                sx={{ 
                  borderRadius: '8px', 
                  textTransform: 'none', 
                  px: 4,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  background: brand,
                  color: "#fff"
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : (editModalOpen ? 'Update User' : 'Create User')}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit is handled by the Add User Dialog above */}
      <Modal
        open={false}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-customer-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 850,
            bgcolor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e0e0e0',
            background: brand,
            borderRadius: '12px 12px 0 0'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: "white" }}>
                Edit User
              </Typography>
              <IconButton 
                onClick={() => setEditModalOpen(false)}
                sx={{
                  color: headerTextColor,
                  backgroundColor: 'transparent',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <Close sx={{ color: "white" }} />
              </IconButton>
            </Box>
          </Box>
          <Box component="form" onSubmit={handleSaveSubUser} sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
              {/* Company Name | MC/DOT No */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Name" 
                  name="companyName" 
                  value={formData.companyName || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Designation" 
                  name="mcDotNo" 
                  value={formData.mcDotNo || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Email | Mobile */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Email" 
                  name="email" 
                  value={formData.email || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Mobile" 
                  name="mobile" 
                  value={formData.mobile || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={12}>
                <TextField 
                  label="Password (Leave empty to keep unchanged)" 
                  name="password" 
                  type="password"
                  value={formData.password || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Company Address | City */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Company Address" 
                  name="companyAddress" 
                  value={formData.companyAddress || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="City" 
                  name="city" 
                  value={formData.city || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* State | Country */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="State" 
                  name="state" 
                  value={formData.state || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Country" 
                  name="country" 
                  value={formData.country || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Zip Code | Notes */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Zip Code" 
                  name="zipCode" 
                  value={formData.zipCode || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              {/* <Grid item xs={12} sm={6}>
                <TextField 
                  label="Notes" 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Additional notes about the customer..."
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid> */}
            </Grid>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2,
              mt: 3
            }}>
              <Button
                variant="outlined"
                onClick={() => setEditModalOpen(false)}
              sx={{ borderRadius: 3, backgroundColor: '#ffff', color: '#d32f2f', textTransform: 'none', px: 4, borderColor: '#d32f2f', '&:hover': { background: 'red', color:"white" } }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                color="primary" 
                sx={{ borderRadius: 3, textTransform: 'none', px: 4, color:"white" }}
              >
                {loading ? <CircularProgress size={20} color="white" /> : 'Update User'}
              </Button>
            </Box>
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
            borderRadius: 2,
            maxHeight: '75vh',
            background: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2,
            pt: 2,
            px: 3,
            background: brand,
            color: headerTextColor,
            borderRadius: '8px 8px 0 0',
            minHeight: 64
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Business sx={{ fontSize: 28, color: "white" }} />
              <Typography variant="h5" fontWeight={600} color="white">
                User Details
              </Typography>
            </Box>
            <button
  onClick={() => setViewModalOpen(false)}
  className="p-2 rounded cursor-pointer transition-colors duration-200"
  style={{ color: "white", background: 'transparent', borderRadius: '50%' }}
  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
          </DialogTitle>

          <DialogContent sx={{ pt: 2, overflowY: 'auto', flex: 1 }}>
          {selectedSubUser && (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
                {/* Basic Information Card */}
                <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e3f2fd' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      i
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#0d47a1">Basic Information</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Name</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.name || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Email</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.email || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                         <TableCell>
  <span
    className="inline-block rounded-full text-xs font-semibold px-3 py-1 capitalize"
    style={{
      backgroundColor:
        selectedSubUser.isActive !== false ? "#dcfce7" : "#f3f4f6",
      color:
        selectedSubUser.isActive !== false ? "#166534" : "#374151",
    }}
  >
    {selectedSubUser.isActive !== false ? 'Active' : 'Inactive'}
  </span>
</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Created Date</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{new Date(selectedSubUser.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Contact Information Card */}
                <Paper elevation={0} sx={{ border: '1px solid #ffe0b2', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#fff8e1' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#ffb300', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      📞
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#e65100">Contact Information</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Email</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.email || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Mobile</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{'N/A' || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Location Details Card */}
                <Paper elevation={0} sx={{ border: '1px solid #c8e6c9', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e8f5e9' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#2e7d32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      📍
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#1b5e20">Location Details</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Address</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.locationDetails?.companyAddress || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>City</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.locationDetails?.city || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>State</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.locationDetails?.state || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Zip Code</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.locationDetails?.zipCode || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Country</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.locationDetails?.country || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Additional Notes Card */}
                {selectedSubUser.notes && (
                  <Paper elevation={0} sx={{ border: '1px solid #b2dfdb', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e0f2f1' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#00897b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        📝
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="#00695c">Additional Notes</Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ width: 220, color: 'text.secondary' }}>Notes</TableCell>
                            <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontStyle: 'italic' }}>{selectedSubUser.notes}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Box>
                  </Paper>
                )}

                {/* Added By Card */}
                <Paper elevation={0} sx={{ border: '1px solid #ce93d8', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#f3e5f5' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#6a1b9a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      👤
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#4a148c">Added By</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Name</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.addedByTrucker?.truckerName || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Email</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedSubUser.addedByTrucker?.truckerEmail || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
          </DialogContent>
      </Dialog>

      {/* Permission Modal */}
      <Dialog
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 0,
          background: brand,
          color: headerTextColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssignmentInd sx={{ fontSize: 28, color:"white" }} />
            <Typography variant="h6" fontWeight={700} color="white">
              User Permission
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setPermissionModalOpen(false)}
            sx={{ 
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedUserForPermission && (
            <Box>
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedUserForPermission.name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedUserForPermission.email || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Table size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 100, textAlign: 'center' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sidebarOptions.map((option) => (
                    <TableRow key={option.key} hover>
                      <TableCell>{option.label}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Switch
                          checked={!!userPermissions[option.key]}
                          onChange={() => handlePermissionToggle(option.key)}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
          <Button onClick={() => setPermissionModalOpen(false)} sx={{ textTransform: 'none', color: "red", border: '1px solid red', '&:hover': { bgcolor: 'red', color: 'white' } }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => savePermissions()}
            sx={{ 
              bgcolor: brand,
              textTransform: 'none',
              color: 'white',
              px: 4,
              '&:hover': { bgcolor: brand }
            }}
          >
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" marginTop={8}>
            Are you sure you want to delete this user?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddUserShipper;
