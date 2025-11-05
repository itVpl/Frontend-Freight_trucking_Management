import { useState, useEffect } from 'react';
import {
  Box, Typography, ToggleButtonGroup, ToggleButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Paper, TextField, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent,
  IconButton, Divider, Grid
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { CalendarMonth, TrendingUp, Assessment, Visibility, Close, LocalShipping, LocationOn, AttachMoney, Scale, Description, Person, DirectionsCar, DateRange, Business, CheckCircle, Photo, Note, Verified, Assignment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { BASE_API_URL } from '../../apiConfig';
import 'chart.js/auto';

// API service function to fetch unverified loads
const fetchUnverifiedLoads = async (shipperId, loadId = null) => {
  try {
    let url = `${BASE_API_URL}/api/v1/accountant/shipper/all-unverified-loads?shipperId=${shipperId}`;
    if (loadId) {
      url += `&loadId=${loadId}`;
    }
    
    // Get token from various possible storage locations
    const token = sessionStorage.getItem('token') || 
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('authToken') ||
                  localStorage.getItem('authToken') ||
                  sessionStorage.getItem('accessToken') ||
                  localStorage.getItem('accessToken');
    
    console.log('Token found:', token ? 'Yes' : 'No');
    console.log('Available storage keys:', {
      sessionStorage: Object.keys(sessionStorage),
      localStorage: Object.keys(localStorage)
    });
    console.log('Making API request to:', url);
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. API call may fail.');
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching unverified loads:', error);
    throw error;
  }
};

const Reports = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [reportsData, setReportsData] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);

  // Fetch API data on component mount
  useEffect(() => {
    const loadApiData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Using the shipperId from the API example
        const shipperId = '68cd6ee176b6c23c1d2a87b3';
        
        // Try different API call approaches
        let response;
        try {
          // First try without loadId
          response = await fetchUnverifiedLoads(shipperId);
        } catch (firstError) {
          console.log('First attempt failed, trying with loadId...');
          // If that fails, try with loadId
          const loadId = '68e7eecea78740db1d29848e';
          response = await fetchUnverifiedLoads(shipperId, loadId);
        }
        setApiData(response);
        
        // Transform API data to match reports structure
        if (response.success && response.data.allLoads) {
          const transformedData = response.data.allLoads.map(load => ({
            id: load.shipmentNumber || load._id,
            driver: load.carrier?.name || 'N/A',
            type: load.vehicleType || 'N/A',
            date: format(new Date(load.pickupDate), 'MM-dd-yyyy'),
            status: load.status || 'Pending',
            rate: load.rate || 0,
            origin: load.origin,
            destination: load.destination,
            weight: load.weight,
            commodity: load.commodity,
            verificationStatus: load.verificationStatus,
            // Store full load object for detailed view
            fullLoad: load
          }));
          
          setReportsData(transformedData);
        }
      } catch (err) {
        let errorMessage = `API Error: ${err.message}`;
        
        // Check if it's an authentication error
        if (err.message.includes('Please login to access this resource')) {
          errorMessage = 'Authentication required. Please login to access load data.';
        }
        
        setError(errorMessage);
        console.error('Failed to load API data:', err);
        
        // No fallback data - show empty state
        setReportsData([]);
      } finally {
        setLoading(false);
      }
    };

    loadApiData();
  }, []);

  // Dynamic chart data based on view and API data
  const getChartData = () => {
    if (reportsData.length === 0) {
      // Fallback to mock data if no API data
      if (view === 'monthly') {
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          data: [5000, 8000, 12000, 18000, 25000, 30000, 37000, 45000, 53000, 60000, 70000, 77000]
        };
      } else if (view === 'yearly') {
        return {
          labels: ['2020', '2021', '2022', '2023', '2024'],
          data: [450000, 520000, 680000, 750000, 820000]
        };
      } else {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return {
          labels: days,
          data: [12000, 15000, 18000, 22000, 25000, 19000, 16000]
        };
      }
    }

    // Use real API data
    if (view === 'monthly') {
      // Group by month and sum rates
      const monthlyData = {};
      reportsData.forEach(load => {
        const date = new Date(load.date);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + (load.rate || 0);
      });
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = months.map(month => monthlyData[month] || 0);
      
      return { labels: months, data };
    } else if (view === 'yearly') {
      // Group by year and sum rates
      const yearlyData = {};
      reportsData.forEach(load => {
        const date = new Date(load.date);
        const year = date.getFullYear();
        yearlyData[year] = (yearlyData[year] || 0) + (load.rate || 0);
      });
      
      const years = Object.keys(yearlyData).sort();
      const data = years.map(year => yearlyData[year]);
      
      return { labels: years, data };
    } else {
      // Custom date range - use actual start and end dates
      if (!startDate || !endDate) {
        // If no dates selected, show last 7 days as fallback
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dailyData = {};
        
        reportsData.forEach(load => {
          const date = new Date(load.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          dailyData[dayName] = (dailyData[dayName] || 0) + (load.rate || 0);
        });
        
        const data = days.map(day => dailyData[day] || 0);
        return { labels: days, data };
      }

      // Filter data based on selected date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end date to end of day to include the entire end date
      end.setHours(23, 59, 59, 999);
      
      const filteredData = reportsData.filter(load => {
        const loadDate = new Date(load.date);
        return loadDate >= start && loadDate <= end;
      });

      // Group by date and sum rates
      const dailyData = {};
      filteredData.forEach(load => {
        const date = new Date(load.date);
        const dateKey = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        dailyData[dateKey] = (dailyData[dateKey] || 0) + (load.rate || 0);
      });

      // Sort dates and create labels and data arrays
      const sortedDates = Object.keys(dailyData).sort((a, b) => {
        const dateA = new Date(a + ', ' + new Date().getFullYear());
        const dateB = new Date(b + ', ' + new Date().getFullYear());
        return dateA - dateB;
      });

      const data = sortedDates.map(date => dailyData[date]);
      
      // If no data found in the selected range, show a message
      if (sortedDates.length === 0) {
        return { 
          labels: ['No Data'], 
          data: [0] 
        };
      }
      
      return { labels: sortedDates, data };
    }
  };

  // Recalculate chart data when view, startDate, endDate, or reportsData changes
  const chartDataConfig = getChartData();

  const chartData = {
    labels: chartDataConfig.labels,
    datasets: [
      {
        label: 'Consignment Revenue',
        data: chartDataConfig.data,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(99, 102, 241, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(99, 102, 241, 1)'
        ],
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(99, 102, 241, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(239, 68, 68, 0.9)',
          'rgba(139, 92, 246, 0.9)',
          'rgba(236, 72, 153, 0.9)',
          'rgba(6, 182, 212, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(251, 146, 60, 0.9)',
          'rgba(168, 85, 247, 0.9)',
          'rgba(14, 165, 233, 0.9)',
          'rgba(99, 102, 241, 0.9)'
        ],
        hoverBorderWidth: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 15,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 16,
        titleSpacing: 8,
        bodySpacing: 6,
        callbacks: {
          title: function(context) {
            if (view === 'monthly') {
              return `📅 ${context[0].label}uary 2024`;
            } else if (view === 'yearly') {
              return `📅 Year ${context[0].label}`;
            } else {
              return `📅 ${context[0].label}`;
            }
          },
          label: function(context) {
            return `💰 Revenue: $${context.parsed.y.toLocaleString()}`;
          },
          afterLabel: function(context) {
            const maxValue = Math.max(...chartDataConfig.data);
            const percentage = ((context.parsed.y / maxValue) * 100).toFixed(1);
            return `📈 ${percentage}% of peak revenue`;
          }
        }
      }
    },
    animation: {
      duration: 2500,
      easing: 'easeInOutQuart',
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 150;
        }
        return delay;
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: '500'
          }
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: '500'
          },
          callback: value => {
            if (view === 'yearly') {
              return `$${(value / 1000).toFixed(0)}K`;
            } else {
              return `$${value / 1000}K`;
            }
          },
          padding: 10
        },
        border: {
          display: false
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const handleChange = (_, newView) => {
    if (newView) {
      setView(newView);
      // Clear date inputs when switching away from custom view
      if (newView !== 'custom') {
        setStartDate('');
        setEndDate('');
      }
    }
  };

  // Use API data for table rows, fallback to mock data if no API data
  const rows = reportsData.length > 0 ? reportsData : [
    { id: 'CNU1234567', driver: 'Hardy', type: 'OTR', date: '07-07-2025', status: 'Completed' },
    { id: 'CNU1234568', driver: 'Joseph', type: 'Drayage', date: '07-07-2025', status: 'Completed' },
    { id: 'CNU1234569', driver: 'Ronnie', type: 'OTR', date: '07-07-2025', status: 'Not-Completed' },
    { id: 'CNU1234570', driver: 'George', type: 'Drayage', date: '07-07-2025', status: 'Transit' },
  ];

  const getChipColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Not-Completed':
        return 'error';
      case 'Transit':
        return 'warning';
      default:
        return 'default';
    }
  };

  // const handleRowClick = (status, id) => {
  //   // Navigate based on status
  //   if (status === 'Completed') navigate(`/consignment/${id}/complete`);
  //   else if (status === 'Not-Completed') navigate(`/consignment/${id}/not-complete`);
  //   else if (status === 'Transit') navigate(`/consignment/${id}/transit`);
  // };
const handleRowClick = (status) => {
  // Navigate based on status only
  if (status === 'Completed') navigate('/reports/complete');
  else if (status === 'Not-Completed') navigate('not-complete');
  else if (status === 'Transit') navigate('transit');
};

const handleViewClick = (e, row) => {
  e.stopPropagation(); // Prevent row click
  setSelectedConsignment(row);
  setViewModalOpen(true);
};

const handleCloseModal = () => {
  setViewModalOpen(false);
  setSelectedConsignment(null);
};
  return (
    <Box sx={{ p: 2 }}>
      {/* Top Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {view === 'custom' && (
            <>
              <TextField 
                size="small" 
                label="Start Date" 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputProps={{ startAdornment: <CalendarMonth /> }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: endDate || undefined }}
              />
              <TextField 
                size="small" 
                label="End Date" 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputProps={{ startAdornment: <CalendarMonth /> }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: startDate || undefined }}
              />
            </>
          )}
          {view === 'yearly' && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <MenuItem value={2020}>2020</MenuItem>
                <MenuItem value={2021}>2021</MenuItem>
                <MenuItem value={2022}>2022</MenuItem>
                <MenuItem value={2023}>2023</MenuItem>
                <MenuItem value={2024}>2024</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
        <ToggleButtonGroup value={view} exclusive onChange={handleChange}>
          <ToggleButton value="monthly">
            <TrendingUp sx={{ mr: 1 }} />
            Monthly
          </ToggleButton>
          <ToggleButton value="yearly">
            <Assessment sx={{ mr: 1 }} />
            Yearly
          </ToggleButton>
          <ToggleButton value="custom">
            <CalendarMonth sx={{ mr: 1 }} />
            Custom Date
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading reports data...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && reportsData.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          py: 8,
          textAlign: 'center'
        }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No reports data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please check your authentication or try refreshing the page
          </Typography>
        </Box>
      )}

      {/* Bar Chart */}
      {!loading && !error && (
        <Paper 
          elevation={4} 
          sx={{ 
            p: 4, 
            mb: 3, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
        >
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: '800', 
              color: '#1f2937',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            Consignment Data Analytics
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#6b7280',
              fontSize: '1.1rem',
              fontWeight: '400'
            }}
          >
            {view === 'monthly' && 'Monthly revenue trends for 2024'}
            {view === 'yearly' && `Yearly revenue comparison (${selectedYear})`}
            {view === 'custom' && (
              startDate && endDate 
                ? `Custom date range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                : 'Custom date range revenue analysis - Please select start and end dates'
            )}
          </Typography>
        </Box>
        
        <Box sx={{ 
          height: 450, 
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 3,
          p: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          '& canvas': {
            borderRadius: '12px'
          }
        }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      </Paper>
      )}

      {/* Table */}
      {!loading && !error && (
        <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Consignment ID</TableCell>
                <TableCell>Driver Name</TableCell>
                <TableCell>Load Type</TableCell>
                <TableCell>Assign Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(row.status, row.id)}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.driver}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={getChipColor(row.status)} />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={(e) => handleViewClick(e, row)}
                      sx={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#1565c0',
                        },
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      )}

      {/* View Details Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShipping sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Consignment Details
            </Typography>
          </Box>
          <IconButton onClick={handleCloseModal} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, mt: 0, maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedConsignment && (
            <Box sx={{ p: 3 }}>
              {/* Basic Information Section */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Description sx={{ color: '#1976d2', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    Basic Information
                  </Typography>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ border: 'none', fontWeight: 600, width: '40%' }}>Consignment ID</TableCell>
                        <TableCell sx={{ border: 'none', width: '10%' }}>------</TableCell>
                        <TableCell sx={{ border: 'none' }}>{selectedConsignment.id || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ border: 'none', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ border: 'none' }}>------</TableCell>
                        <TableCell sx={{ border: 'none' }}>
                          <Chip 
                            label={selectedConsignment.status || 'N/A'} 
                            color={getChipColor(selectedConsignment.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ border: 'none', fontWeight: 600 }}>Equipment Type</TableCell>
                        <TableCell sx={{ border: 'none' }}>------</TableCell>
                        <TableCell sx={{ border: 'none' }}>{selectedConsignment.type || 'N/A'}</TableCell>
                      </TableRow>
                      {selectedConsignment.fullLoad?.shipmentNumber && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600 }}>Shipment Number</TableCell>
                          <TableCell sx={{ border: 'none' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>{selectedConsignment.fullLoad.shipmentNumber}</TableCell>
                        </TableRow>
                      )}
                      {selectedConsignment.fullLoad?.poNumber && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600 }}>PO Number</TableCell>
                          <TableCell sx={{ border: 'none' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>{selectedConsignment.fullLoad.poNumber}</TableCell>
                        </TableRow>
                      )}
                      {selectedConsignment.fullLoad?.bolNumber && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600 }}>BOL Number</TableCell>
                          <TableCell sx={{ border: 'none' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>{selectedConsignment.fullLoad.bolNumber}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Rate Information Section */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AttachMoney sx={{ color: '#ff9800', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                    Rate Information
                  </Typography>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ border: 'none', fontWeight: 600, width: '40%' }}>Rate</TableCell>
                        <TableCell sx={{ border: 'none', width: '10%' }}>------</TableCell>
                        <TableCell sx={{ border: 'none' }}>
                          <Typography variant="body1" fontWeight={700} color="primary">
                            ${selectedConsignment.rate?.toLocaleString() || '0.00'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      {selectedConsignment.fullLoad?.rateDetails?.lineHaul !== undefined && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600 }}>Line Haul</TableCell>
                          <TableCell sx={{ border: 'none' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>${selectedConsignment.fullLoad.rateDetails.lineHaul.toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      {selectedConsignment.fullLoad?.rateDetails?.fsc !== undefined && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600 }}>FSC</TableCell>
                          <TableCell sx={{ border: 'none' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>${selectedConsignment.fullLoad.rateDetails.fsc.toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      {selectedConsignment.fullLoad?.rateDetails?.totalRates !== undefined && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600 }}>Total Rates</TableCell>
                          <TableCell sx={{ border: 'none' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>
                            <Typography variant="body1" fontWeight={700} color="success.main">
                              ${selectedConsignment.fullLoad.rateDetails.totalRates.toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Load Details Section */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale sx={{ color: '#9c27b0', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                    Load Details
                  </Typography>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {selectedConsignment.weight && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600, width: '40%' }}>Weight</TableCell>
                          <TableCell sx={{ border: 'none', width: '10%' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>{selectedConsignment.weight} LBS</TableCell>
                        </TableRow>
                      )}
                      {selectedConsignment.commodity && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600 }}>Commodity</TableCell>
                          <TableCell sx={{ border: 'none' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>{selectedConsignment.commodity}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Locations Section */}
              {(selectedConsignment.origin || selectedConsignment.destination || 
                selectedConsignment.fullLoad?.origins || selectedConsignment.fullLoad?.destinations) && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LocationOn sx={{ color: '#4caf50', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
                      Locations
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    {/* Pickup Location */}
                    {(selectedConsignment.fullLoad?.origins?.[0] || selectedConsignment.origin) && (
                      <Grid xs={12} sm={6}>
                        <Box sx={{ p: 2, background: '#f5f5f5', borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} color="success.main" sx={{ mb: 1 }}>
                            Pickup Location
                          </Typography>
                          {selectedConsignment.fullLoad?.origins?.[0] ? (
                            <>
                              <Typography variant="body2">
                                <strong>City:</strong> {selectedConsignment.fullLoad.origins[0].city || 'N/A'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>State:</strong> {selectedConsignment.fullLoad.origins[0].state || 'N/A'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>ZIP:</strong> {selectedConsignment.fullLoad.origins[0].zip || 'N/A'}
                              </Typography>
                              {selectedConsignment.fullLoad.origins[0].addressLine1 && (
                                <Typography variant="body2">
                                  <strong>Address:</strong> {selectedConsignment.fullLoad.origins[0].addressLine1}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="body2">
                              {selectedConsignment.origin && typeof selectedConsignment.origin === 'object' 
                                ? `${selectedConsignment.origin.city || ''} ${selectedConsignment.origin.state || ''}`.trim() || 'N/A'
                                : selectedConsignment.origin || 'N/A'}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    )}

                    {/* Delivery Location */}
                    {(selectedConsignment.fullLoad?.destinations?.[0] || selectedConsignment.destination) && (
                      <Grid xs={12} sm={6}>
                        <Box sx={{ p: 2, background: '#fff3e0', borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} color="warning.main" sx={{ mb: 1 }}>
                            Delivery Location
                          </Typography>
                          {selectedConsignment.fullLoad?.destinations?.[0] ? (
                            <>
                              <Typography variant="body2">
                                <strong>City:</strong> {selectedConsignment.fullLoad.destinations[0].city || 'N/A'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>State:</strong> {selectedConsignment.fullLoad.destinations[0].state || 'N/A'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>ZIP:</strong> {selectedConsignment.fullLoad.destinations[0].zip || 'N/A'}
                              </Typography>
                              {selectedConsignment.fullLoad.destinations[0].addressLine1 && (
                                <Typography variant="body2">
                                  <strong>Address:</strong> {selectedConsignment.fullLoad.destinations[0].addressLine1}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="body2">
                              {selectedConsignment.destination && typeof selectedConsignment.destination === 'object'
                                ? `${selectedConsignment.destination.city || ''} ${selectedConsignment.destination.state || ''}`.trim() || 'N/A'
                                : selectedConsignment.destination || 'N/A'}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}

              {/* Driver & Vehicle Information */}
              {(selectedConsignment.driver !== 'N/A' || selectedConsignment.fullLoad?.acceptedBid) && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Person sx={{ color: '#00796b', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#00796b' }}>
                      Driver & Vehicle Information
                    </Typography>
                  </Box>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {(selectedConsignment.fullLoad?.acceptedBid?.driverName || selectedConsignment.driver !== 'N/A') && (
                          <TableRow>
                            <TableCell sx={{ border: 'none', fontWeight: 600, width: '40%' }}>Driver Name</TableCell>
                            <TableCell sx={{ border: 'none', width: '10%' }}>------</TableCell>
                            <TableCell sx={{ border: 'none' }}>
                              {selectedConsignment.fullLoad?.acceptedBid?.driverName || selectedConsignment.driver || 'N/A'}
                            </TableCell>
                          </TableRow>
                        )}
                         {selectedConsignment.fullLoad?.acceptedBid?.vehicleNumber && (
                           <TableRow>
                             <TableCell sx={{ border: 'none', fontWeight: 600 }}>Vehicle Number</TableCell>
                             <TableCell sx={{ border: 'none' }}>------</TableCell>
                             <TableCell sx={{ border: 'none' }}>{selectedConsignment.fullLoad.acceptedBid.vehicleNumber}</TableCell>
                           </TableRow>
                         )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Dates Section */}
              {selectedConsignment.fullLoad && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #fff8e1, #ffecb3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DateRange sx={{ color: '#f57c00', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#f57c00' }}>
                      Important Dates
                  </Typography>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {selectedConsignment.fullLoad.pickupDate && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600, width: '40%' }}>Pickup Date</TableCell>
                          <TableCell sx={{ border: 'none', width: '10%' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>
                            {format(new Date(selectedConsignment.fullLoad.pickupDate), 'MM-dd-yyyy')}
                          </TableCell>
                        </TableRow>
                      )}
                      {selectedConsignment.fullLoad.deliveryDate && (
                        <TableRow>
                          <TableCell sx={{ border: 'none', fontWeight: 600 }}>Delivery Date</TableCell>
                          <TableCell sx={{ border: 'none' }}>------</TableCell>
                          <TableCell sx={{ border: 'none' }}>
                            {format(new Date(selectedConsignment.fullLoad.deliveryDate), 'MM-dd-yyyy')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                </Paper>
              )}

              {/* Pickup Images Section */}
              {(selectedConsignment.fullLoad?.emptyTruckImages?.length > 0 || 
                selectedConsignment.fullLoad?.loadedTruckImages?.length > 0 ||
                selectedConsignment.fullLoad?.eirTickets?.length > 0 ||
                selectedConsignment.fullLoad?.containerImages?.length > 0 ||
                selectedConsignment.fullLoad?.sealImages?.length > 0 ||
                selectedConsignment.fullLoad?.damageImages?.length > 0) && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Photo sx={{ color: '#ff9800', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                      Pickup Images
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {selectedConsignment.fullLoad?.emptyTruckImages?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Empty Truck Images ({selectedConsignment.fullLoad.emptyTruckImages.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.emptyTruckImages.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`Empty Truck ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#ff9800', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedConsignment.fullLoad?.loadedTruckImages?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Loaded Truck Images ({selectedConsignment.fullLoad.loadedTruckImages.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.loadedTruckImages.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`Loaded Truck ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#ff9800', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedConsignment.fullLoad?.eirTickets?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>EIR Tickets ({selectedConsignment.fullLoad.eirTickets.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.eirTickets.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`EIR Ticket ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#ff9800', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedConsignment.fullLoad?.containerImages?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Container Images ({selectedConsignment.fullLoad.containerImages.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.containerImages.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`Container ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#ff9800', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedConsignment.fullLoad?.sealImages?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Seal Images ({selectedConsignment.fullLoad.sealImages.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.sealImages.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`Seal ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#ff9800', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedConsignment.fullLoad?.damageImages?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Damage Images ({selectedConsignment.fullLoad.damageImages.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.damageImages.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`Damage ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#ff9800', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}

              {/* Drop Location Images */}
              {selectedConsignment.fullLoad?.dropLocationImages && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #fce4ec, #f8bbd0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Photo sx={{ color: '#c2185b', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#c2185b' }}>
                      Delivery Images
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {selectedConsignment.fullLoad.dropLocationImages.podImages?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>POD Images ({selectedConsignment.fullLoad.dropLocationImages.podImages.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.dropLocationImages.podImages.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`POD ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#c2185b', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedConsignment.fullLoad.dropLocationImages.loadedTruckImages?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Loaded Truck Images ({selectedConsignment.fullLoad.dropLocationImages.loadedTruckImages.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.dropLocationImages.loadedTruckImages.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`Loaded Truck ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#c2185b', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedConsignment.fullLoad.dropLocationImages.dropLocationImages?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Drop Location Images ({selectedConsignment.fullLoad.dropLocationImages.dropLocationImages.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.dropLocationImages.dropLocationImages.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`Drop Location ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#c2185b', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedConsignment.fullLoad.dropLocationImages.emptyTruckImages?.length > 0 && (
                      <Grid xs={12} sm={6}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Empty Truck Images ({selectedConsignment.fullLoad.dropLocationImages.emptyTruckImages.length})</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {selectedConsignment.fullLoad.dropLocationImages.emptyTruckImages.map((url, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={url}
                                alt={`Empty Truck ${idx + 1}`}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '2px solid #e0e0e0',
                                  '&:hover': { borderColor: '#c2185b', transform: 'scale(1.05)' }
                                }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}

              {/* Return Location */}
              {(selectedConsignment.fullLoad?.returnLocation || selectedConsignment.fullLoad?.returnCity || selectedConsignment.fullLoad?.returnDate) && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LocationOn sx={{ color: '#7b1fa2', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                      Return Location
                    </Typography>
                  </Box>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {selectedConsignment.fullLoad?.returnLocation && (
                          <TableRow>
                            <TableCell sx={{ border: 'none', fontWeight: 600, width: '40%' }}>Return Location</TableCell>
                            <TableCell sx={{ border: 'none', width: '10%' }}>------</TableCell>
                            <TableCell sx={{ border: 'none' }}>{selectedConsignment.fullLoad.returnLocation}</TableCell>
                          </TableRow>
                        )}
                        {(selectedConsignment.fullLoad?.returnCity || selectedConsignment.fullLoad?.returnState) && (
                          <TableRow>
                            <TableCell sx={{ border: 'none', fontWeight: 600 }}>Return Address</TableCell>
                            <TableCell sx={{ border: 'none' }}>------</TableCell>
                            <TableCell sx={{ border: 'none' }}>
                              {`${selectedConsignment.fullLoad.returnCity || ''} ${selectedConsignment.fullLoad.returnState || ''} ${selectedConsignment.fullLoad.returnZip || ''}`.trim() || 'N/A'}
                            </TableCell>
                          </TableRow>
                        )}
                        {selectedConsignment.fullLoad?.returnDate && (
                          <TableRow>
                            <TableCell sx={{ border: 'none', fontWeight: 600 }}>Return Date</TableCell>
                            <TableCell sx={{ border: 'none' }}>------</TableCell>
                            <TableCell sx={{ border: 'none' }}>
                              {format(new Date(selectedConsignment.fullLoad.returnDate), 'MM-dd-yyyy')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Reports;
