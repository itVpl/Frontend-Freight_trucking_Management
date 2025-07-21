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
} from '@mui/material';
import { Receipt, Download } from '@mui/icons-material';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const driverData = [
    { name: 'Rajesh Kumar', dob: '1990-05-12', nationality: 'Indian', gender: 'Male', phone: '+91 98765 43210', email: 'rajesh.kumar@email.com', address: 'Mumbai, Maharashtra' },
    { name: 'Amit Singh', dob: '1988-03-22', nationality: 'Indian', gender: 'Male', phone: '+91 98765 43212', email: 'amit.singh@email.com', address: 'Delhi, NCR' },
    { name: 'Suresh Patel', dob: '1992-07-30', nationality: 'Indian', gender: 'Male', phone: '+91 98765 43214', email: 'suresh.patel@email.com', address: 'Bangalore, Karnataka' },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'DOB', 'Nationality', 'Gender', 'Phone No', 'Email', 'Address'];
    const csvRows = [headers.join(',')];

    driverData.forEach(row => {
      const values = [row.name, row.dob, row.nationality, row.gender, row.phone, row.email, row.address];
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

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Driver Details
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            onClick={exportToCSV}
            sx={{
              borderRadius: 2,
              fontSize: '0.75rem',
              px: 2,
              py: 0.8,
              fontWeight: 500,
              textTransform: 'none',
              color: '#1976d2',
              borderColor: '#1976d2',
              '&:hover': {
                borderColor: '#0d47a1',
                color: '#0d47a1',
              },
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            sx={{
              borderRadius: 2,
              fontSize: '0.75rem',
              px: 2,
              py: 0.8,
              fontWeight: 500,
              textTransform: 'none',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Add Driver
          </Button>
        </Stack>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>DOB</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nationality</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {driverData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((driver, i) => (
                <TableRow key={i} hover sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.dob}</TableCell>
                  <TableCell>{driver.nationality}</TableCell>
                  <TableCell>{driver.gender}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.address}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={driverData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20]}
        />
      </Paper>
    </Box>
  );
};

export default Dashboard;
