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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  InputAdornment,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { Receipt, Download, Edit } from '@mui/icons-material';
import axios from 'axios';
import { BASE_API_URL } from '../../apiConfig';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch drivers from API
  const [driverData, setDriverData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_API_URL}/api/v1/driver/my-drivers`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Assuming response.data is an array of drivers
        setDriverData(Array.isArray(response.data) ? response.data : (response.data.drivers || []));
      } catch (err) {
        setDriverData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'DOB', 'Nationality', 'Gender', 'Phone No', 'Email', 'Address'];
    const csvRows = [headers.join(',')];
    driverData.forEach(row => {
      const values = [row.fullName, row.dob, row.nationality, row.gender, row.phone, row.email, row.address];
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'driver_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    mcDot: '',
    phone: '',
    email: '',
    license: '',
    gender: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    address: '',
    password: '',
  });
  const [loadType, setLoadType] = useState('OTR');
  // State me image aur preview bhi add karo agar nahi hai
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cdlPreview, setCdlPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, type: '', message: '' });

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  
  const handleOpenEditModal = (driver) => {
    setEditingDriver(driver);
    setForm({
      fullName: driver.fullName || driver.name || '',
      mcDot: driver.mcDot || '',
      phone: driver.phone || '',
      email: driver.email || '',
      license: driver.driverLicense || '',
      gender: driver.gender || '',
      country: driver.country || '',
      state: driver.state || '',
      city: driver.city || '',
      zipCode: driver.zipCode || '',
      address: driver.fullAddress || '',
      password: '',
    });
    setEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingDriver(null);
    setForm({
      fullName: '',
      mcDot: '',
      phone: '',
      email: '',
      license: '',
      gender: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      address: '',
      password: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      setPhoto(files[0]);
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else if (name === 'cdl' && files && files[0]) {
      setForm({ ...form, [name]: files[0] });
      if (files[0].type.startsWith('image/')) {
        setCdlPreview(URL.createObjectURL(files[0]));
      } else {
        setCdlPreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    // Required fields except photo and cdl
    const requiredFields = [
      'fullName', 'mcDot', 'phone', 'email', 'license', 'gender', 'country', 'state', 'city', 'zipCode', 'address', 'password'
    ];
    requiredFields.forEach(field => {
      if (!form[field]) newErrors[field] = true;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Prepare FormData for multipart/form-data
    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('mcDot', form.mcDot);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('driverLicense', form.license);
    formData.append('gender', form.gender);
    formData.append('country', form.country);
    formData.append('state', form.state);
    formData.append('city', form.city);
    formData.append('zipCode', form.zipCode);
    formData.append('fullAddress', form.address);
    formData.append('password', form.password);
    if (form.photo) formData.append('driverPhoto', form.photo);
    if (form.cdl) formData.append('cdlDocument', form.cdl);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_API_URL}/api/v1/driver/register`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
          // Do not set Content-Type, browser will set it automatically
        },
      });
      setAlert({ open: true, type: 'success', message: 'Driver registered successfully!' });
      handleCloseModal();
      setForm({
        fullName: '',
        mcDot: '',
        phone: '',
        email: '',
        license: '',
        gender: '',
        country: '',
        state: '',
        city: '',
        zipCode: '',
        address: '',
        password: '',
        photo: null,
        cdl: null,
      });
      setPhoto(null);
      setPhotoPreview(null);
      setCdlPreview(null);
      // Refresh driver list
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_API_URL}/api/v1/driver/my-drivers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDriverData(Array.isArray(response.data) ? response.data : (response.data.drivers || []));
      } catch (err) {
        setDriverData([]);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      setAlert({ open: true, type: 'error', message: err.response?.data?.message || 'Failed to register driver' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    // Required fields except photo and cdl
    const requiredFields = [
      'fullName', 'mcDot', 'phone', 'email', 'license', 'gender', 'country', 'state', 'city', 'zipCode', 'address'
    ];
    requiredFields.forEach(field => {
      if (!form[field]) newErrors[field] = true;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const token = localStorage.getItem('token');
      const editData = {
        fullName: form.fullName,
        mcDot: form.mcDot,
        phone: form.phone,
        email: form.email,
        driverLicense: form.license,
        gender: form.gender,
        country: form.country,
        state: form.state,
        city: form.city,
        zipCode: form.zipCode,
        fullAddress: form.address
      };
      
      await axios.put(`${BASE_API_URL}/api/v1/driver/${editingDriver._id}`, editData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      setAlert({ open: true, type: 'success', message: 'Driver updated successfully!' });
      handleCloseEditModal();
      
      // Refresh driver list
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_API_URL}/api/v1/driver/my-drivers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDriverData(Array.isArray(response.data) ? response.data : (response.data.drivers || []));
      } catch (err) {
        setDriverData([]);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      setAlert({ open: true, type: 'error', message: err.response?.data?.message || 'Failed to update driver' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Driver Details</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" onClick={exportToCSV} sx={{ borderRadius: 2, fontSize: '0.75rem', px: 2, py: 0.8, fontWeight: 500, textTransform: 'none', color: '#1976d2', borderColor: '#1976d2', '&:hover': { borderColor: '#0d47a1', color: '#0d47a1' } }}>Export CSV</Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleOpenModal} sx={{ borderRadius: 2, fontSize: '0.75rem', px: 2, py: 0.8, fontWeight: 500, textTransform: 'none', backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>Add Driver</Button>
        </Stack>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>MC/Dot No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>License No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell> 
              <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Zip Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} align="center">Loading...</TableCell>
              </TableRow>
            ) : driverData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center">No drivers found</TableCell>
              </TableRow>
            ) : (
              driverData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((driver, i) => (
                <TableRow key={driver._id || i} hover sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{driver.fullName || driver.name || '-'}</TableCell>
                  <TableCell>{driver.mcDot || '-'}</TableCell>
                  <TableCell>{driver.driverLicense || '-'}</TableCell>
                  <TableCell>{driver.gender || '-'}</TableCell>
                  <TableCell>{driver.phone || '-'}</TableCell>
                  <TableCell>{driver.email || '-'}</TableCell>
                  <TableCell>{driver.country || '-'}</TableCell>
                  <TableCell>{driver.state || '-'}</TableCell>
                  <TableCell>{driver.city || '-'}</TableCell>
                  <TableCell>{driver.zipCode || '-'}</TableCell>
                  <TableCell>{driver.fullAddress || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenEditModal(driver)}
                      sx={{
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        px: 1.5,
                        py: 0.5,
                        fontWeight: 500,
                        textTransform: 'none',
                        color: '#1976d2',
                        borderColor: '#1976d2',
                        '&:hover': {
                          borderColor: '#0d47a1',
                          color: '#0d47a1',
                          backgroundColor: '#e3f2fd'
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination component="div" count={driverData.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 15, 20]} />
      </Paper>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
         <DialogTitle sx={{ textAlign: 'left', pb: 0 }}>
           <Typography variant="h5" color="primary" fontWeight={700} sx={{ textAlign: 'left' }}>
             Add Driver
           </Typography>
           <Divider sx={{ mt: 1, mb: 0.5, width: '100%', borderColor: '#e0e0e0', borderBottomWidth: 2, borderRadius: 2 }} />
         </DialogTitle>
         <DialogContent sx={{ pb: 4, maxHeight: '70vh', overflowY: 'auto', background: '#fff', borderRadius: 0 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, px: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
              {/* Full Name | MC-DOT No */}
              <Grid item xs={12} sm={6}>
                <TextField label="Full Name" name="fullName" value={form.fullName || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.fullName}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="MC/DOT No" name="mcDot" value={form.mcDot || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.mcDot}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Phone | Email */}
              <Grid item xs={12} sm={6}>
                <TextField label="Phone" name="phone" value={form.phone || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.phone}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" name="email" value={form.email || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.email}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* License No | Gender */}
              <Grid item xs={12} sm={8}>
                <TextField label="License No" name="license" value={form.license || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.license}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select label="Gender" name="gender" value={form.gender || ''} onChange={handleFormChange}
                  error={!!errors.gender}
                  sx={{ width: '15.5rem', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              {/* Country | State */}
              <Grid item xs={12} sm={6}>
                <TextField label="Country" name="country" value={form.country || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.country}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="State" name="state" value={form.state || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.state}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* City | Zip Code */}
              <Grid item xs={12} sm={6}>
                <TextField label="City" name="city" value={form.city || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.city}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Zip Code" name="zipCode" value={form.zipCode || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.zipCode}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Address | Password */}
              <Grid item xs={12} sm={6}>
                <TextField label="Address" name="address" value={form.address || ''} onChange={handleFormChange} fullWidth
                  error={!!errors.address}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Password" name="password" value={form.password || ''} onChange={handleFormChange} fullWidth type="password"
                  error={!!errors.password}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Upload Photo | Upload CDL */}
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    borderRadius: '12px',
                    minHeight: '56px',
                    fontWeight: 500,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    background: '#fff',
                    borderColor: '#c4c4c4',
                    color: '#333',
                    fontSize: '16px',
                    boxShadow: 'none',
                    px: 2,
                    '&:hover': { background: '#f5f5f5', borderColor: '#1976d2' },
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="24" height="24" fill="#1976d2" style={{ marginRight: 8 }}><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 5h14v14H5V5zm7 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-5 9.5V17h10v-.5l-3.5-4.5-2.5 3-1.5-2z"/></svg>
                    {photo ? (typeof photo === 'string' ? photo : photo.name) : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    name="photo"
                    onChange={handleFormChange}
                  />
                </Button>
                {photoPreview && (
                  <Box mt={1} display="flex" justifyContent="flex-start">
                    <img src={photoPreview} alt="Preview" height={60} style={{ borderRadius: 8, maxWidth: '200px', objectFit: 'cover' }} />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    borderRadius: '12px',
                    minHeight: '56px',
                    fontWeight: 500,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    background: '#fff',
                    borderColor: '#c4c4c4',
                    color: '#333',
                    fontSize: '16px',
                    boxShadow: 'none',
                    px: 2,
                    '&:hover': { background: '#f5f5f5', borderColor: '#1976d2' },
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="24" height="24" fill="#1976d2" style={{ marginRight: 8 }}><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 5h14v14H5V5zm7 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-5 9.5V17h10v-.5l-3.5-4.5-2.5 3-1.5-2z"/></svg>
                    {form.cdl ? (typeof form.cdl === 'string' ? form.cdl : form.cdl.name) : 'Upload CDL'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    hidden
                    name="cdl"
                    onChange={handleFormChange}
                  />
                </Button>
                {cdlPreview ? (
                  <Box mt={1} display="flex" justifyContent="flex-start">
                    <img src={cdlPreview} alt="CDL Preview" height={60} style={{ borderRadius: 8, maxWidth: '200px', objectFit: 'cover' }} />
                  </Box>
                ) : form.cdl ? (
                  <Box mt={1} display="flex" justifyContent="flex-start">
                    <span style={{ fontSize: 14, color: '#1976d2', fontWeight: 500 }}>
                      {typeof form.cdl === 'string' ? form.cdl : form.cdl.name || 'File Selected'}
                    </span>
                  </Box>
                ) : null}
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 4, justifyContent: 'center', gap: 1 }}>
               <Button onClick={handleCloseModal} variant="contained" sx={{ borderRadius: 3, backgroundColor: '#f0f0f0', color: '#000', textTransform: 'none', px: 4, '&:hover': { backgroundColor: '#e0e0e0' } }}>Cancel</Button>
               <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 3, textTransform: 'none', px: 4 }}>Submit</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={handleCloseEditModal} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            maxHeight: '90vh'
          }
        }}
      >
         <DialogTitle sx={{ 
           textAlign: 'center', 
           pb: 2, 
           pt: 3,
           background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
           color: 'white',
           position: 'relative'
         }}>
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
             <Edit sx={{ fontSize: 28 }} />
             <Typography variant="h4" fontWeight={700} sx={{ textAlign: 'center' }}>
               Edit Driver Information
             </Typography>
           </Box>
           <Typography variant="body2" sx={{ mt: 1, opacity: 0.9, textAlign: 'center' }}>
             Update driver details below
           </Typography>
         </DialogTitle>
         
         <DialogContent sx={{ 
           pb: 4, 
           pt: 3,
           maxHeight: '70vh', 
           overflowY: 'auto', 
           background: '#fafafa',
           '&::-webkit-scrollbar': {
             width: '8px',
           },
           '&::-webkit-scrollbar-track': {
             background: '#f1f1f1',
             borderRadius: '4px',
           },
           '&::-webkit-scrollbar-thumb': {
             background: '#c1c1c1',
             borderRadius: '4px',
             '&:hover': {
               background: '#a8a8a8',
             },
           },
         }}>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2, px: 3 }}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, background: 'white', mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 4, height: 20, background: '#1976d2', borderRadius: 1 }}></Box>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Full Name" 
                    name="fullName" 
                    value={form.fullName || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    error={!!errors.fullName}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="MC/DOT No" 
                    name="mcDot" 
                    value={form.mcDot || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    error={!!errors.mcDot}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Phone Number" 
                    name="phone" 
                    value={form.phone || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    error={!!errors.phone}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Email Address" 
                    name="email" 
                    value={form.email || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    error={!!errors.email}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField 
                    label="Driver License No" 
                    name="license" 
                    value={form.license || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    error={!!errors.license}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    select 
                    label="Gender" 
                    name="gender" 
                    value={form.gender || ''} 
                    onChange={handleFormChange}
                    error={!!errors.gender}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, background: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 4, height: 20, background: '#1976d2', borderRadius: 1 }}></Box>
                Address Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Country" 
                    name="country" 
                    value={form.country || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    error={!!errors.country}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="State" 
                    name="state" 
                    value={form.state || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    error={!!errors.state}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="City" 
                    name="city" 
                    value={form.city || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    error={!!errors.city}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Zip Code" 
                    name="zipCode" 
                    value={form.zipCode || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    error={!!errors.zipCode}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="Full Address" 
                    name="address" 
                    value={form.address || ''} 
                    onChange={handleFormChange} 
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.address}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        borderRadius: '12px',
                        backgroundColor: '#f8f9fa',
                        '&:hover': {
                          backgroundColor: '#f1f3f4',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
            
            <DialogActions sx={{ 
              mt: 4, 
              justifyContent: 'center', 
              gap: 2,
              px: 0
            }}>
               <Button 
                 onClick={handleCloseEditModal} 
                 variant="outlined" 
                 size="large"
                 sx={{ 
                   borderRadius: 3, 
                   borderColor: '#e0e0e0',
                   color: '#666',
                   textTransform: 'none', 
                   px: 4,
                   py: 1.5,
                   fontWeight: 600,
                   '&:hover': { 
                     borderColor: '#d32f2f',
                     color: '#d32f2f',
                     backgroundColor: '#ffebee'
                   } 
                 }}
               >
                 Cancel
               </Button>
               <Button 
                 type="submit" 
                 variant="contained" 
                 size="large"
                 sx={{ 
                   borderRadius: 3, 
                   textTransform: 'none', 
                   px: 4,
                   py: 1.5,
                   fontWeight: 600,
                   background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                   boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                   '&:hover': {
                     background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                     boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                   }
                 }}
               >
                 Update Driver
               </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.type}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;