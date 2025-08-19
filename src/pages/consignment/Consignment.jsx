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
  TextField,
  InputAdornment,
} from '@mui/material';
import { Receipt, Download, Search } from '@mui/icons-material';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const driverData = [
    {
      loadId: 'LD-001',
      consignmentNo: 'CN-1001',
      weight: '5 Tons',
      pickup: 'New Yourk',
      drop: 'New Zersey',
      returnLoc: 'New Yourk',
      vehicle: 'FGY-5597',
      commodity: 'Electronics',
      loadType: 'FTL',
      driver: 'Rajesh Kumar',
      status: 'Pending',
    },
    {
      loadId: 'LD-002',
      consignmentNo: 'CN-1002',
      weight: '8 Tons',
      pickup: 'Houston',
      drop: 'Dallas',
      returnLoc: 'Houston',
      vehicle: 'HHA-239',
      commodity: 'Furniture',
      loadType: 'LTL',
      driver: 'Vikram Iyer',
      status: 'Completed',
    },
  ];

  const filteredData = driverData.filter((row) =>
    Object.values(row).some((val) =>
      val.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportToCSV = () => {
    const headers = ['Load ID', 'Consignment No', 'Weight', 'Pick Up', 'Drop', 'Return', 'Vehicle', 'Commodity', 'Load Type', 'Driver', 'Status'];
    const csvRows = [headers.join(',')];

    driverData.forEach(row => {
      const values = [
        row.loadId,
        row.consignmentNo,
        row.weight,
        row.pickup,
        row.drop,
        row.returnLoc,
        row.vehicle,
        row.commodity,
        row.loadType,
        row.driver,
        row.status
      ];
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
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Consignment Table
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontSize: '0.85rem',
                px: 1,
              },
            }}
          />
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
        </Stack>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 600 }}>Load ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Consignment No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Pick Up</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Drop</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Return</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Commodity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Load Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, i) => (
                <TableRow key={i} hover sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{row.loadId}</TableCell>
                  <TableCell>{row.consignmentNo}</TableCell>
                  <TableCell>{row.weight}</TableCell>
                  <TableCell>{row.pickup}</TableCell>
                  <TableCell>{row.drop}</TableCell>
                  <TableCell>{row.returnLoc}</TableCell>
                  <TableCell>{row.vehicle}</TableCell>
                  <TableCell>{row.commodity}</TableCell>
                  <TableCell>{row.loadType}</TableCell>
                  <TableCell>{row.driver}</TableCell>
                  <TableCell>
                    <Chip
  label={row.status}
  size="small"
  // keep green for success, make Pending a bright yellow
  color={row.status === 'Pending' ? undefined : 'success'}
  sx={
    row.status === 'Pending'
      ? { bgcolor: '#FFEB3B', color: '#000', fontWeight: 700 } // yellow bg, black text
      : undefined
  }
/>

                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredData.length}
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