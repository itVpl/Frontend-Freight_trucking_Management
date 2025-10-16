import { useState } from 'react';
import {
  Box, Typography, ToggleButtonGroup, ToggleButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Paper, TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { CalendarMonth, TrendingUp, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import 'chart.js/auto';

const Reports = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Dynamic chart data based on view
  const getChartData = () => {
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
      // Custom date range - show last 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return {
        labels: days,
        data: [12000, 15000, 18000, 22000, 25000, 19000, 16000]
      };
    }
  };

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
    if (newView) setView(newView);
  };

  const rows = [
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
              />
              <TextField 
                size="small" 
                label="End Date" 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputProps={{ startAdornment: <CalendarMonth /> }}
                InputLabelProps={{ shrink: true }}
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

      {/* Bar Chart */}
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
            {view === 'custom' && 'Custom date range revenue analysis'}
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

      {/* Table */}
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
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(row.status, row.id)} // ✅ handle click
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.driver}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={getChipColor(row.status)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Reports;
