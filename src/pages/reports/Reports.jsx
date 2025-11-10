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
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { BASE_API_URL } from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import 'chart.js/auto';

// API service function to fetch verified loads for shipper
const fetchVerifiedLoadsForShipper = async (shipperId) => {
  try {
    const url = `${BASE_API_URL}/api/v1/accountant/shipper/all-verified-loads?shipperId=${shipperId}`;
    
    // Get token from various possible storage locations
    const token = sessionStorage.getItem('token') || 
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('authToken') ||
                  localStorage.getItem('authToken') ||
                  sessionStorage.getItem('accessToken') ||
                  localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching verified loads for shipper:', error);
    throw error;
  }
};

// API service function to fetch verified loads for trucker
const fetchVerifiedLoadsForTrucker = async (truckerId) => {
  try {
    const url = `${BASE_API_URL}/api/v1/accountant/trucker/all-verified-loads?truckerId=${truckerId}`;
    
    // Get token from various possible storage locations
    const token = sessionStorage.getItem('token') || 
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('authToken') ||
                  localStorage.getItem('authToken') ||
                  sessionStorage.getItem('accessToken') ||
                  localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching verified loads for trucker:', error);
    throw error;
  }
};

const Reports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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
        // Determine user type
        const userType = user?.type || 
                        location.state?.userType ||
                        localStorage.getItem('userType') ||
                        sessionStorage.getItem('userType') ||
                        (() => {
                          const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user');
                          if (userRaw) {
                            try {
                              const parsedUser = JSON.parse(userRaw);
                              return parsedUser?.type || parsedUser?.userType || null;
                            } catch (e) {
                              return null;
                            }
                          }
                          return null;
                        })();

        if (!userType || (userType !== 'shipper' && userType !== 'trucker')) {
          throw new Error('User type not detected. Please login as shipper or trucker.');
        }

        let response;
        let transformedData = [];

        if (userType === 'shipper') {
          // Resolve shipperId dynamically
          const shipperId =
            location.state?.shipperId ||
            localStorage.getItem('shipperId') ||
            sessionStorage.getItem('shipperId') ||
            (() => {
              const userRaw =
                localStorage.getItem('user') ||
                sessionStorage.getItem('user') ||
                localStorage.getItem('userData') ||
                sessionStorage.getItem('userData');
              if (!userRaw) return null;
              try {
                const user = JSON.parse(userRaw);
                return user?.shipperId || user?._id || user?.id || null;
              } catch (e) {
                return null;
              }
            })();

          if (!shipperId) {
            throw new Error('Missing shipperId. Please login or pass shipperId via navigation.');
          }

          response = await fetchVerifiedLoadsForShipper(shipperId);
          setApiData(response);

          // Transform verifiedDOs data to match reports structure
          if (response.success && response.data.verifiedDOs) {
            transformedData = response.data.verifiedDOs.map((doItem) => {
              const lr = doItem.loadReference || {};
              const firstCust = doItem.customers?.[0] || {};
              const lineHaul = Number(firstCust.lineHaul) || 0;
              const fsc = Number(firstCust.fsc) || 0;
              const other = Number(firstCust.other) || 0;
              const totalAmount = Number((firstCust?.calculatedTotal ?? firstCust?.totalAmount ?? (lineHaul + fsc + other)) || 0);
              
              const origin = lr.origins?.[0] || doItem.shipper?.pickUpLocations?.[0];
              const destination = lr.destinations?.[0] || doItem.shipper?.dropLocations?.[0];

              return {
                id: lr.shipmentNumber || doItem._id,
                driver: doItem.carrier?.carrierName || 'N/A',
                type: lr.vehicleType || doItem.shipper?.containerType || 'N/A',
                date: lr.pickupDate ? format(new Date(lr.pickupDate), 'MM-dd-yyyy') : (doItem.date ? format(new Date(doItem.date), 'MM-dd-yyyy') : 'N/A'),
                status: lr.status || doItem.status || 'Pending',
                rate: totalAmount,
                origin: origin ? {
                  city: origin.city || origin.extractedCity || 'N/A',
                  state: origin.state || 'N/A',
                  address: origin.addressLine1 || origin.address || 'N/A'
                } : null,
                destination: destination ? {
                  city: destination.city || destination.extractedCity || 'N/A',
                  state: destination.state || 'N/A',
                  address: destination.addressLine1 || destination.address || 'N/A'
                } : null,
                weight: lr.weight || doItem.shipper?.pickUpLocations?.[0]?.weight || 'N/A',
                commodity: lr.commodity || 'N/A',
                verificationStatus: doItem.assignmentStatus || 'N/A',
                // Store full DO object for detailed view
                fullLoad: doItem
              };
            });
          }
        } else if (userType === 'trucker') {
          // Resolve truckerId dynamically
          const truckerId =
            location.state?.truckerId ||
            localStorage.getItem('truckerId') ||
            sessionStorage.getItem('truckerId') ||
            (() => {
              const userRaw =
                localStorage.getItem('user') ||
                sessionStorage.getItem('user') ||
                localStorage.getItem('userData') ||
                sessionStorage.getItem('userData');
              if (!userRaw) return null;
              try {
                const user = JSON.parse(userRaw);
                return user?.truckerId || user?._id || user?.id || null;
              } catch (e) {
                return null;
              }
            })();

          if (!truckerId) {
            throw new Error('Missing truckerId. Please login or pass truckerId via navigation.');
          }

          response = await fetchVerifiedLoadsForTrucker(truckerId);
          setApiData(response);

          // Transform verifiedLoads data to match reports structure
          if (response.success && response.data.verifiedLoads) {
            transformedData = response.data.verifiedLoads.map((doItem) => {
              const lr = doItem.loadReference || {};
              const firstCust = doItem.customers?.[0] || {};
              const lineHaul = Number(firstCust.lineHaul) || 0;
              const fsc = Number(firstCust.fsc) || 0;
              const other = Number(firstCust.other) || 0;
              const totalAmount = Number((firstCust?.calculatedTotal ?? firstCust?.totalAmount ?? (lineHaul + fsc + other)) || 0);
              
              const origin = lr.origins?.[0] || doItem.shipper?.pickUpLocations?.[0];
              const destination = lr.destinations?.[0] || doItem.shipper?.dropLocations?.[0];

              return {
                id: lr.shipmentNumber || doItem._id,
                driver: doItem.carrier?.carrierName || 'N/A',
                type: lr.vehicleType || doItem.shipper?.containerType || 'N/A',
                date: lr.pickupDate ? format(new Date(lr.pickupDate), 'MM-dd-yyyy') : (doItem.date ? format(new Date(doItem.date), 'MM-dd-yyyy') : 'N/A'),
                status: lr.status || doItem.status || 'Pending',
                rate: totalAmount,
                origin: origin ? {
                  city: origin.city || origin.extractedCity || 'N/A',
                  state: origin.state || 'N/A',
                  address: origin.addressLine1 || origin.address || 'N/A'
                } : null,
                destination: destination ? {
                  city: destination.city || destination.extractedCity || 'N/A',
                  state: destination.state || 'N/A',
                  address: destination.addressLine1 || destination.address || 'N/A'
                } : null,
                weight: lr.weight || doItem.shipper?.pickUpLocations?.[0]?.weight || 'N/A',
                commodity: lr.commodity || 'N/A',
                verificationStatus: doItem.assignmentStatus || 'N/A',
                // Store full DO object for detailed view
                fullLoad: doItem
              };
            });
          }
        }

        setReportsData(transformedData);
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
  }, [user, location]);

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
          background: '#1976d2',
          color: 'white',
          borderRadius: '8px 8px 0 0',
          minHeight: 64
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalShipping sx={{ fontSize: 28, color: 'white' }} />
            <Typography variant="h5" fontWeight={600} color="white">
              Consignment Details
            </Typography>
          </Box>
          <IconButton 
            onClick={handleCloseModal} 
            size="small"
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 2, overflowY: 'auto', flex: 1 }}>
        {selectedConsignment && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {(() => {
              // Get user type
              const userType = user?.type || 
                              location.state?.userType ||
                              localStorage.getItem('userType') ||
                              sessionStorage.getItem('userType') ||
                              (() => {
                                const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user');
                                if (userRaw) {
                                  try {
                                    const parsedUser = JSON.parse(userRaw);
                                    return parsedUser?.type || parsedUser?.userType || null;
                                  } catch (e) {
                                    return null;
                                  }
                                }
                                return null;
                              })();

              // Get DO data from fullLoad
              const doData = selectedConsignment.fullLoad || {};
              const lr = doData?.loadReference || {};
              const customers = Array.isArray(doData?.customers) ? doData.customers : [];
              const firstCust = customers[0] || {};
              const lineHaul = Number(firstCust?.lineHaul || 0);
              const fsc = Number(firstCust?.fsc || 0);
              const other = Number(firstCust?.other || 0);
              const totalRates = Number((firstCust?.calculatedTotal ?? firstCust?.totalAmount ?? (lineHaul + fsc + other)) ?? 0);
              const equipmentType = doData?.shipper?.containerType || lr?.vehicleType || selectedConsignment.type || 'N/A';

              return (
                <>
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
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Consignment ID</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.shipmentNumber || selectedConsignment.id || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Equipment Type</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{equipmentType}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>PO Number</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.poNumber || doData?.loadReference?.poNumber || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>BOL Number</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.bolNumber || doData?.bols?.[0]?.bolNo || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Container Number</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.containerNo || doData?.shipper?.containerNo || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Rate Information Card (for Shipper) or Carrier Fees (for Trucker) */}
                {userType === 'shipper' ? (
                  <Paper elevation={0} sx={{ border: '1px solid #ffe0b2', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#fff8e1' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#ffb300', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        $
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="#e65100">Rate Information</Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ width: 220, color: 'text.secondary' }}>Rate</TableCell>
                            <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>${totalRates.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>Line Haul</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>${lineHaul.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>FSC</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>${fsc.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>Other</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>${other.toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>Total Rates</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'success.main' }}>${totalRates.toLocaleString()}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Box>
                  </Paper>
                ) : userType === 'trucker' && doData?.carrier?.carrierFees ? (
                  <Paper elevation={0} sx={{ border: '1px solid #ffe0b2', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#fff8e1' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#ffb300', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        $
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="#e65100">Carrier Fees</Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                        <TableBody>
                          {Array.isArray(doData.carrier.carrierFees) && doData.carrier.carrierFees.map((fee, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ width: 220, color: 'text.secondary' }}>{fee.name || 'Fee'}</TableCell>
                              <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>${Number(fee.total || fee.amount || 0).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>Total Carrier Fees</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'success.main' }}>${Number(doData.carrier.totalCarrierFees || 0).toLocaleString()}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Box>
                  </Paper>
                ) : null}

                {/* Load Details */}
                <Paper elevation={0} sx={{ border: '1px solid #b2dfdb', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e0f2f1' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#00897b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>📦</Box>
                    <Typography variant="h6" fontWeight={700} color="#00695c">Load Details</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Weight</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.weight ?? doData?.shipper?.pickUpLocations?.[0]?.weight ?? selectedConsignment.weight ?? 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Commodity</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.commodity ?? doData?.shipper?.commodity ?? selectedConsignment.commodity ?? 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Locations Card */}
                {(Array.isArray(doData?.shipper?.pickUpLocations) || Array.isArray(doData?.shipper?.dropLocations) || lr?.origins || lr?.destinations) && (
                  <Paper elevation={0} sx={{ border: '1px solid #c8e6c9', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e8f5e9' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#2e7d32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>📍</Box>
                      <Typography variant="h6" fontWeight={700} color="#1b5e20">Locations</Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {(doData?.shipper?.pickUpLocations || lr?.origins || []).map((l, idx) => (
                        <Box key={`pu-${idx}`} sx={{ mb: idx < ((doData?.shipper?.pickUpLocations || lr?.origins || []).length || 0) - 1 ? 2 : 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#2e7d32' }}>Pickup Location {idx + 1}</Typography>
                          <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ width: 220, color: 'text.secondary' }}>Address</TableCell>
                                <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.address || l.addressLine1 || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>City</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.city || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>State</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.state || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Zip</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.zipCode || l.zip || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Date</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{(l.pickUpDate || l.pickupDate) ? format(new Date(l.pickUpDate || l.pickupDate), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>
                      ))}
                      {(doData?.shipper?.dropLocations || lr?.destinations || []).map((l, idx) => (
                        <Box key={`dr-${idx}`} sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#2e7d32' }}>Drop Location {idx + 1}</Typography>
                          <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ width: 220, color: 'text.secondary' }}>Address</TableCell>
                                <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.address || l.addressLine1 || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>City</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.city || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>State</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.state || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Zip</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{l.zipCode || l.zip || 'N/A'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Date</TableCell>
                                <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{(l.dropDate || l.deliveryDate) ? format(new Date(l.dropDate || l.deliveryDate), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}

                {/* Driver and Vehicle Information */}
                <Paper elevation={0} sx={{ border: '1px solid #ce93d8', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#f3e5f5' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#6a1b9a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>🧑‍✈️</Box>
                    <Typography variant="h6" fontWeight={700} color="#4a148c">Driver and Vehicle Information</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Driver Name</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{doData?.driver?.name || doData?.driverName || selectedConsignment.driver || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Vehicle No</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.vehicleNumber || doData?.vehicleNo || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Important Dates */}
                <Paper elevation={0} sx={{ border: '1px solid #9fa8da', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e8eaf6' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#283593', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>🗓️</Box>
                    <Typography variant="h6" fontWeight={700} color="#1a237e">Important Dates</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 220, color: 'text.secondary' }}>Pickup Dated</TableCell>
                          <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.pickupDate ? format(new Date(lr.pickupDate), 'yyyy-MM-dd') : (doData?.shipper?.pickUpLocations?.[0]?.pickUpDate ? format(new Date(doData.shipper.pickUpLocations[0].pickUpDate), 'yyyy-MM-dd') : 'N/A')}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary' }}>Drop Dated</TableCell>
                          <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{lr?.deliveryDate ? format(new Date(lr.deliveryDate), 'yyyy-MM-dd') : (doData?.shipper?.dropLocations?.[0]?.dropDate ? format(new Date(doData.shipper.dropLocations[0].dropDate), 'yyyy-MM-dd') : 'N/A')}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Images Section - Pickup and Delivery */}
                {(() => {
                  const lrImgs = lr?.dropLocationImages || {};
                  // Gather pickup-related images from either loadReference or root
                  const pickupGroups = [
                    { title: 'Empty Truck Images', urls: lr?.emptyTruckImages || doData?.emptyTruckImages || [] },
                    { title: 'Loaded Truck Images', urls: lr?.loadedTruckImages || doData?.loadedTruckImages || [] },
                    { title: 'Container Images', urls: lr?.containerImages || doData?.containerImages || [] },
                    { title: 'Seal Images', urls: lr?.sealImages || doData?.sealImages || [] },
                    { title: 'EIR Tickets', urls: lr?.eirTickets || doData?.eirTickets || [] },
                  ].filter(g => Array.isArray(g.urls) && g.urls.length > 0);

                  // Gather drop-related images from nested dropLocationImages structure
                  const dropGroups = [
                    { title: 'POD Images', urls: lrImgs?.podImages || [] },
                    { title: 'Loaded Truck Images (Drop)', urls: lrImgs?.loadedTruckImages || [] },
                    { title: 'Drop Location Images', urls: lrImgs?.dropLocationImages || [] },
                    { title: 'Empty Truck Images (Drop)', urls: lrImgs?.emptyTruckImages || [] },
                  ].filter(g => Array.isArray(g.urls) && g.urls.length > 0);

                  const GroupCard = ({ title, urls }) => {
                    const preview = Array.isArray(urls) && urls.length > 0 ? urls[0] : null;
                    return (
                      <Paper
                        variant="outlined"
                        sx={{ 
                          width: 220,
                          borderRadius: 2, 
                          overflow: 'hidden',
                          p: 2,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                          {title} ({urls?.length || 0})
                        </Typography>
                        {preview ? (
                          <Box
                            component="img"
                            src={preview}
                            alt={title}
                            onClick={() => window.open(preview, '_blank')}
                            sx={{ 
                              width: '100%',
                              height: 140,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0',
                              cursor: 'pointer',
                              boxShadow: 0.5,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: 140,
                              borderRadius: 1,
                              border: '1px dashed #cfd8dc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'text.secondary',
                              fontSize: 12,
                            }}
                          >
                            No image
                          </Box>
                        )}
                      </Paper>
                    );
                  };

                  if (pickupGroups.length === 0 && dropGroups.length === 0) return null;

                  return (
                    <Paper elevation={0} sx={{ border: '1px solid #90caf9', borderRadius: 2, overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e3f2fd' }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#3949ab', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>🖼️</Box>
                        <Typography variant="h6" fontWeight={700} color="#1565c0">Images</Typography>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" fontWeight={800} color="#1b5e20" sx={{ mb: 1.5 }}>Pickup Images</Typography>
                            {pickupGroups.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {pickupGroups.map((g, idx) => (
                                  <GroupCard key={`pu-${idx}`} title={g.title} urls={g.urls} />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">No pickup images</Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" fontWeight={800} color="#b71c1c" sx={{ mb: 1.5 }}>Delivery Images</Typography>
                            {dropGroups.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {dropGroups.map((g, idx) => (
                                  <GroupCard key={`dr-${idx}`} title={g.title} urls={g.urls} />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">No delivery images</Typography>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    </Paper>
                  );
                })()}
                </>
              );
            })()}
          </Box>
        )}
      </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Reports;
