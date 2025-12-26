import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../apiConfig';
import alertify from 'alertifyjs';

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
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Zoom,
  Skeleton
} from '@mui/material';

import {
  Add,
  Refresh,
  Clear,
  Close,
  Send,
  LocationOn,
  LocalShipping,
  Assignment,
  CalendarToday,
  AttachMoney,
  Scale,
  Business,
  Description,
  Delete,
  AttachFile,
  CloudUpload,
  CheckCircle,
  Room,
  Inventory2,
  Category,
  Percent
} from '@mui/icons-material';

import { Download, Search } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import SearchNavigationFeedback from '../../components/SearchNavigationFeedback';
import PageLoader from '../../components/PageLoader';
import { useThemeConfig } from '../../context/ThemeContext';
import { useNegotiation } from '../../context/NegotiationContext';
import { useSocket } from '../../context/SocketContext';

const LoadBoard = () => {
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadData, setLoadData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { themeConfig } = useThemeConfig();
  const { addNotification, unreadBids } = useNegotiation();
  const { socket } = useSocket();

  const primary = themeConfig.tokens?.primary || '#1976d2';

  const fetchLoads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      let data = response.data;
      if (data && data.loads && Array.isArray(data.loads)) {
        setLoadData(data.loads);
      } else if (Array.isArray(data)) {
        setLoadData(data);
      } else {
        setLoadData([]);
      }
    } catch (err) {
      console.error('Error fetching loads:', err);
      setLoadData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'posted':
        return 'info';
      case 'assigned':
        return 'warning';
      case 'in transit':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <SearchNavigationFeedback
        searchResult={location.state?.selectedShipment}
        searchQuery={location.state?.searchQuery}
      />
      
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: primary }}>
          Load Board
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ borderRadius: 2 }}
        >
          Create Load
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Load ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Origin</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Destination</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No loads found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              loadData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((load) => (
                  <TableRow key={load._id} hover>
                    <TableCell>{load._id?.slice(-8) || 'N/A'}</TableCell>
                    <TableCell>
                      {load.origins?.[0]?.city || load.fromCity || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {load.destinations?.[0]?.city || load.toCity || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" color="success.main">
                        ${load.rate || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={load.status || 'Unknown'}
                        color={getStatusColor(load.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          component="div"
          count={loadData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Box>
  );
};

export default LoadBoard;