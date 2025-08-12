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
} from '@mui/material';
import { Add } from '@mui/icons-material';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fleetData = [
    { vehicleNo: 'MH-12-AB-1234', chasisNo: 'CH123456', engineNo: 'EN987654', modelYear: '2020', type: 'Truck' },
    { vehicleNo: 'DL-01-CD-5678', chasisNo: 'CH654321', engineNo: 'EN123789', modelYear: '2019', type: 'Pickup' },
    { vehicleNo: 'KA-05-EF-9012', chasisNo: 'CH998877', engineNo: 'EN112233', modelYear: '2021', type: 'Mini Truck' },
    { vehicleNo: 'GJ-11-ZZ-2233', chasisNo: 'CH556677', engineNo: 'EN445566', modelYear: '2022', type: 'Truck' },
    { vehicleNo: 'TN-22-XY-7788', chasisNo: 'CH332211', engineNo: 'EN778899', modelYear: '2018', type: 'Van' },
    { vehicleNo: 'RJ-14-PO-9988', chasisNo: 'CH111222', engineNo: 'EN000111', modelYear: '2020', type: 'Mini Truck' },
    { vehicleNo: 'WB-19-AZ-8876', chasisNo: 'CH123321', engineNo: 'EN321123', modelYear: '2021', type: 'Van' },
    { vehicleNo: 'PB-10-QW-1122', chasisNo: 'CH444555', engineNo: 'EN555444', modelYear: '2017', type: 'Pickup' },
    { vehicleNo: 'UP-32-HH-6677', chasisNo: 'CH667788', engineNo: 'EN887766', modelYear: '2023', type: 'Truck' },
    { vehicleNo: 'AP-03-XX-5544', chasisNo: 'CH121212', engineNo: 'EN343434', modelYear: '2016', type: 'Truck' },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportToCSV = () => {
    const headers = ['Vehicle No', 'Chasis No', 'Engine No', 'Model Year', 'Fleet Type'];
    const csvRows = [headers.join(',')];

    fleetData.forEach(row => {
      const values = [row.vehicleNo, row.chasisNo, row.engineNo, row.modelYear, row.type];
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

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Fleet Overview
        </Typography>
        <Stack direction="row" spacing={1}>
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
          {/* <Button
            variant="contained"
            startIcon={<Add />}
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
            Add Fleet
          </Button> */}
        </Stack>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 600 }}>Vehicle No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Chasis No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Engine No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Model Year</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fleet Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fleetData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((fleet, i) => (
                <TableRow key={i} hover sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{fleet.vehicleNo}</TableCell>
                  <TableCell>{fleet.chasisNo}</TableCell>
                  <TableCell>{fleet.engineNo}</TableCell>
                  <TableCell>{fleet.modelYear}</TableCell>
                  <TableCell>{fleet.type}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={fleetData.length}
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