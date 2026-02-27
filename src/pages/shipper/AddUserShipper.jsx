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

const DUMMY_CUSTOMERS = [
  {
    _id: '1',
    companyInfo: {
      companyName: 'ABC Logistics',
      mcDotNo: 'Finance'
    },
    contactInfo: {
      email: 'contact@abclogistics.com',
      mobile: '123-456-7890'
    },
    locationDetails: {
      companyAddress: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    status: 'active',
    notes: 'Premium user'
  },
  {
    _id: '2',
    companyInfo: {
      companyName: 'XYZ Freight',
      mcDotNo: 'IT'
    },
    contactInfo: {
      email: 'info@xyzfreight.com',
      mobile: '987-654-3210'
    },
    locationDetails: {
      companyAddress: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90001'
    },
    status: 'inactive',
    notes: 'Payment pending'
  },
  {
    _id: '3',
    companyInfo: {
      companyName: 'Global Trans',
      mcDotNo: 'HR'
    },
    contactInfo: {
      email: 'support@globaltrans.com',
      mobile: '555-123-4567'
    },
    locationDetails: {
      companyAddress: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      zipCode: '60601'
    },
    status: 'active',
    notes: ''
  }
];

const AddUserShipper = () => {
  const { userType } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState(() => ({
    companyName: '',
    mcDotNo: '',
    email: '',
    mobile: '',
    companyAddress: '',
    city: '',
    state: '',
    country: 'USA',
    zipCode: '',
    notes: '',
    password: ''
  }));

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedUserForPermission, setSelectedUserForPermission] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const sidebarOptions = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'liveTracker', label: 'Live Tracker' },
    { key: 'loadBoard', label: 'Load Board' },
    { key: 'addUser', label: 'Add User' },
    { key: 'billing', label: 'Billing' },
    { key: 'consignment', label: 'Consignment' },
    { key: 'email', label: 'Email' },
    { key: 'report', label: 'Report' },
    { key: 'loadCalculator', label: 'Load Calculator' },
  ];


  const { themeConfig } = useThemeConfig();
  const brand = (themeConfig.header?.bg && themeConfig.header.bg !== 'white') ? themeConfig.header.bg : (themeConfig.tokens?.primary || '#1976d2');
  const headerTextColor = themeConfig.header?.text || '#ffffff';

  // Fetch all customers on component mount
  useEffect(() => {
    fetchAllCustomers();
  }, []);

  // API Functions
  const fetchAllCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using dummy data as requested since API is not returning data
      setCustomersData(DUMMY_CUSTOMERS);
      setLoading(false);
      return; // Skip API call

      /* 
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/${userType}-customer/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCustomersData(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch customers');
      }
      */
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/${userType}-customer/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to add customer');
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (customerId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/${userType}-customer/${customerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update customer');
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/${userType}-customer/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete customer');
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
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
      companyName: '',
      mcDotNo: '',
      email: '',
      mobile: '',
      companyAddress: '',
      city: '',
      state: '',
      country: 'USA',
      zipCode: '',
      notes: '',
      password: ''
    });
    setAddModalOpen(true);
  }, []);

  const handleEditCustomer = useCallback((customer) => {
    // Map API response to form data
    setFormData({
      companyName: customer.companyInfo?.companyName || '',
      mcDotNo: customer.companyInfo?.mcDotNo || '',
      email: customer.contactInfo?.email || '',
      mobile: customer.contactInfo?.mobile || '',
      companyAddress: customer.locationDetails?.companyAddress || '',
      city: customer.locationDetails?.city || '',
      state: customer.locationDetails?.state || '',
      country: customer.locationDetails?.country || 'USA',
      zipCode: customer.locationDetails?.zipCode || '',
      notes: customer.notes || '',
      password: ''
    });
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  }, []);

  const handleViewCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  }, []);

  const handleAssignPermission = useCallback((customer) => {
    setSelectedUserForPermission(customer);
    // Initialize permissions - in a real app, you'd fetch existing permissions here
    const initialPermissions = {};
    sidebarOptions.forEach(option => {
      initialPermissions[option.key] = false; // Default to false or fetch from backend
    });
    setUserPermissions(initialPermissions);
    setPermissionModalOpen(true);
  }, []);

  const handlePermissionToggle = (key) => {
    setUserPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const savePermissions = () => {
    // Here you would save the permissions to the backend
    console.log('Saving permissions for:', selectedUserForPermission?.companyInfo?.companyName, userPermissions);
    setSuccess('Permissions assigned successfully');
    setPermissionModalOpen(false);
    setTimeout(() => setSuccess(null), 3000);
  };


  const handleDeleteCustomer = (customerId) => {
    setCustomerToDelete(customerId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      setLoading(true);
      await deleteCustomer(customerToDelete);
      
      // Refresh the customer list
      await fetchAllCustomers();
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleSaveCustomer = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      setLoading(true);
      
      if (editModalOpen) {
        // Update existing customer with form data
        await updateCustomer(selectedCustomer.customerId, formData);
        setSuccess('Customer updated successfully');
      } else {
        // Add new customer
        await addCustomer(formData);
        setSuccess('Customer added successfully');
      }
      
      // Refresh the customer list
      await fetchAllCustomers();
      setAddModalOpen(false);
      setEditModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save customer');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };


  // Filter customers based on search term - memoized for performance
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return customersData;
    
    const searchLower = searchTerm.toLowerCase();
    return customersData.filter(customer =>
      customer.companyInfo?.companyName?.toLowerCase().includes(searchLower) ||
      customer.contactInfo?.email?.toLowerCase().includes(searchLower) ||
      customer.contactInfo?.mobile?.includes(searchTerm) ||
      customer.locationDetails?.city?.toLowerCase().includes(searchLower) ||
      customer.locationDetails?.state?.toLowerCase().includes(searchLower)
    );
  }, [customersData, searchTerm]);

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

  if (loading && customersData.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading customers...
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
          {customersData.length} {customersData.length === 1 ? 'User' : 'Users'}
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
  onClick={handleAddCustomer}
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
                  Designation
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
                    <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      {customer.companyInfo?.mcDotNo}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      {customer.contactInfo?.email}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      {customer.contactInfo?.mobile}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700 border-t border-b border-gray-200">
                      {customer.locationDetails?.city}, {customer.locationDetails?.state} {customer.locationDetails?.zipCode}
                    </td>
                    <td className="px-4 py-4 text-gray-700 border-t border-b border-gray-200">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-base font-medium border ${
                          (customer.status || '').toLowerCase() === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
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
                          onClick={() => handleAssignPermission(customer)}
                          className="h-8 px-3 rounded-md border border-cyan-600 text-cyan-600 text-base cursor-pointer font-medium hover:bg-cyan-600 hover:text-white"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="h-8 px-3 rounded-md border border-sky-600 text-sky-600 text-base cursor-pointer font-medium hover:bg-sky-600 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer._id || customer.customerId)}
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
                  <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={7}>
                    {customersData.length === 0 ? 'No customers found. Add your first customer!' : 'No customers match your search criteria'}
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
              Add New Users
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setAddModalOpen(false)}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa' }}>
          <Box component="form" onSubmit={handleSaveCustomer}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Company Information Section */}
                <Grid 
                  item xs={12}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transition: '0.3s',
                    width: '100%',
                    bgcolor: '#fff',
                    '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.1)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AssignmentInd sx={{ color: '#1976d2', fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      User Information
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: '12px' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Name" 
                          name="companyName" 
                          value={formData.companyName || ''} 
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
                          label="Designation" 
                          name="mcDotNo" 
                          value={formData.mcDotNo || ''} 
                          onChange={handleFormInputChange} 
                          fullWidth
                          required
                          variant="outlined"
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>#</Typography>
                              </InputAdornment>
                            ),
                          }}
                          sx={inputFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField 
                          label="Password" 
                          name="password" 
                          type="password"
                          value={formData.password || ''} 
                          onChange={handleFormInputChange} 
                          fullWidth
                          required
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" fontSize="small" />
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
                  item xs={12}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transition: '0.3s',
                    width: '100%',
                    bgcolor: '#fff',
                    '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.1)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone sx={{ color: '#1976d2', fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Contact Details
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: '12px' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Email Address" 
                          name="email" 
                          type="email"
                          value={formData.email || ''} 
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
                          value={formData.mobile || ''} 
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
                  item xs={12}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transition: '0.3s',
                    width: '100%',
                    bgcolor: '#fff',
                    '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.1)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LocationOn sx={{ color: '#1976d2', fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Location
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: '12px' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField 
                          label="Street Address" 
                          name="companyAddress" 
                          value={formData.companyAddress || ''} 
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
                          value={formData.city || ''} 
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
                          value={formData.state || ''} 
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
                          value={formData.zipCode || ''} 
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
                          value={formData.country || ''} 
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
                {/* <Grid item xs={12}>
                  <TextField 
                    label="Additional Notes" 
                    name="notes" 
                    value={formData.notes || ''} 
                    onChange={handleFormInputChange} 
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"s
                    placeholder="Any specific requirements or details..."
                    sx={{ 
                      '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                      bgcolor: 'white'
                    }}
                  />
                </Grid> */}
              </Grid>
            </Box>

            <Divider />
            
            <DialogActions sx={{ p: 3, bgcolor: '#fff' }}>
              <Button 
                onClick={() => setAddModalOpen(false)} 
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
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : 'Create Users'}
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
          <Box component="form" onSubmit={handleSaveCustomer} sx={{ p: 3 }}>
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
          {selectedCustomer && (
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
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Company Name</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.companyInfo?.companyName || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>MC/DOT Number</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.companyInfo?.mcDotNo || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                         <TableCell>
  <span
    className="inline-block rounded-full text-xs font-semibold px-3 py-1 capitalize"
    style={{
      backgroundColor:
        selectedCustomer.status === "active" ? "#dcfce7" : "#f3f4f6",
      color:
        selectedCustomer.status === "active" ? "#166534" : "#374151",
    }}
  >
    {selectedCustomer.status}
  </span>
</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Created Date</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</TableCell>
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
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.contactInfo?.email || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Mobile</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.contactInfo?.mobile || 'N/A'}</TableCell>
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
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.locationDetails?.companyAddress || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>City</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.locationDetails?.city || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>State</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.locationDetails?.state || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Zip Code</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.locationDetails?.zipCode || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Country</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.locationDetails?.country || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Additional Notes Card */}
                {selectedCustomer.notes && (
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
                            <TableCell sx={{ fontWeight: 600, fontStyle: 'italic' }}>{selectedCustomer.notes}</TableCell>
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
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.addedByTrucker?.truckerName || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Email</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{selectedCustomer.addedByTrucker?.truckerEmail || 'N/A'}</TableCell>
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
                      {selectedUserForPermission.companyInfo?.companyName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedUserForPermission.contactInfo?.email || 'N/A'}
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
            onClick={savePermissions}
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
          <Typography variant="h6" fontWeight={600} sx={{ color: '#fff' }}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ pt: 1.5 }}>
            Are you sure you want to delete this user?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 1.5 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            variant="outlined"
            color="inherit"
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
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ borderRadius: 3, textTransform: 'none', px: 3, color: '#fff' }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddUserShipper;
