import { useState } from 'react';
import {
  Box, Typography, ToggleButtonGroup, ToggleButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Paper, TextField
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { CalendarMonth } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // ✅ new
import 'chart.js/auto';

const Reports = () => {
  const navigate = useNavigate(); // ✅ initialize
  const [view, setView] = useState('monthly');

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Consignment',
        data: [5000, 8000, 12000, 18000, 25000, 30000, 37000, 45000, 53000, 60000, 70000, 77000],
        backgroundColor: [
          '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6', '#03a9f4',
          '#039be5', '#0288d1', '#0277bd', '#01579b', '#004e92', '#003c77', '#002b5c'
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${value / 1000}K`,
        },
      },
    },
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" label="Start Date" InputProps={{ startAdornment: <CalendarMonth /> }} />
          <TextField size="small" label="End Date" InputProps={{ startAdornment: <CalendarMonth /> }} />
        </Box>
        <ToggleButtonGroup value={view} exclusive onChange={handleChange}>
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="yearly">Yearly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Bar Chart */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Bar data={chartData} options={chartOptions} />
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
