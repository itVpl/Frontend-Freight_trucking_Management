import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assignment,
  LocalShipping,
  AttachMoney,
  Schedule,
  CheckCircle,
  Warning,
  Download,
  Assessment,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Reports = () => {
  const { userType } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    // Mock report data based on user type and time range
    if (userType === 'trucker') {
      setReportData({
        summary: {
          totalDeliveries: 45,
          completedDeliveries: 38,
          pendingDeliveries: 7,
          totalRevenue: 125000,
          averageRating: 4.8,
          onTimeDelivery: 92,
          fuelEfficiency: 8.5,
          fleetUtilization: 85,
        },
        monthlyTrends: [
          { month: 'Jan', deliveries: 12, revenue: 32000 },
          { month: 'Feb', deliveries: 15, revenue: 41000 },
          { month: 'Mar', deliveries: 18, revenue: 52000 },
        ],
        topRoutes: [
          { route: 'Mumbai → Delhi', trips: 8, revenue: 28000 },
          { route: 'Delhi → Bangalore', trips: 6, revenue: 22000 },
          { route: 'Bangalore → Chennai', trips: 5, revenue: 18000 },
        ],
        performanceMetrics: [
          { metric: 'On-Time Delivery', value: '92%', trend: 'up', change: '+5%' },
          { metric: 'Customer Rating', value: '4.8/5', trend: 'up', change: '+0.2' },
          { metric: 'Fuel Efficiency', value: '8.5 km/l', trend: 'up', change: '+0.3' },
          { metric: 'Fleet Utilization', value: '85%', trend: 'down', change: '-2%' },
        ],
        recentDeliveries: [
          { id: 1, route: 'Mumbai → Delhi', status: 'completed', revenue: 8500, date: '2024-03-20' },
          { id: 2, route: 'Delhi → Bangalore', status: 'in-transit', revenue: 7200, date: '2024-03-21' },
          { id: 3, route: 'Bangalore → Chennai', status: 'pending', revenue: 6800, date: '2024-03-22' },
        ],
      });
    } else {
      setReportData({
        summary: {
          totalShipments: 23,
          completedShipments: 20,
          pendingShipments: 3,
          totalSpent: 89000,
          averageRating: 4.6,
          onTimeDelivery: 87,
          averageCost: 3870,
          savedCarriers: 15,
        },
        monthlyTrends: [
          { month: 'Jan', shipments: 8, spent: 28000 },
          { month: 'Feb', shipments: 10, spent: 35000 },
          { month: 'Mar', shipments: 12, spent: 42000 },
        ],
        topCarriers: [
          { carrier: 'ABC Trucking', shipments: 8, spent: 32000, rating: 4.8 },
          { carrier: 'XYZ Transport', shipments: 6, spent: 24000, rating: 4.6 },
          { carrier: 'PQR Logistics', shipments: 4, spent: 16000, rating: 4.4 },
        ],
        performanceMetrics: [
          { metric: 'On-Time Delivery', value: '87%', trend: 'up', change: '+3%' },
          { metric: 'Cost per Ton', value: '₹3,870', trend: 'down', change: '-5%' },
          { metric: 'Carrier Rating', value: '4.6/5', trend: 'up', change: '+0.1' },
          { metric: 'Active Carriers', value: '15', trend: 'up', change: '+2' },
        ],
        recentShipments: [
          { id: 1, route: 'Mumbai → Delhi', status: 'completed', cost: 8500, date: '2024-03-20' },
          { id: 2, route: 'Delhi → Bangalore', status: 'in-transit', cost: 7200, date: '2024-03-21' },
          { id: 3, route: 'Bangalore → Chennai', status: 'pending', cost: 6800, date: '2024-03-22' },
        ],
      });
    }
  }, [userType, timeRange]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-transit':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
  };

  const handleExportReport = () => {
    // In real app, this would generate and download a report
    console.log('Exporting report...');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Reports & Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {userType === 'trucker' ? 'Total Deliveries' : 'Total Shipments'}
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {userType === 'trucker' ? reportData.summary?.totalDeliveries : reportData.summary?.totalShipments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userType === 'trucker' ? 'Completed: ' + reportData.summary?.completedDeliveries : 'Completed: ' + reportData.summary?.completedShipments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {userType === 'trucker' ? 'Total Revenue' : 'Total Spent'}
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ₹{(userType === 'trucker' ? reportData.summary?.totalRevenue : reportData.summary?.totalSpent) / 1000}K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This {timeRange}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">On-Time Delivery</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {reportData.summary?.onTimeDelivery}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Rating</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {reportData.summary?.averageRating}/5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer satisfaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                {reportData.performanceMetrics?.map((metric, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {metric.metric}
                          </Typography>
                          <Typography variant="h6">
                            {metric.value}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getTrendIcon(metric.trend)}
                          <Typography
                            variant="body2"
                            color={metric.trend === 'up' ? 'success.main' : 'error.main'}
                            sx={{ ml: 0.5 }}
                          >
                            {metric.change}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                {userType === 'trucker' ? 'Top Routes' : 'Top Carriers'}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{userType === 'trucker' ? 'Route' : 'Carrier'}</TableCell>
                      <TableCell align="right">{userType === 'trucker' ? 'Trips' : 'Shipments'}</TableCell>
                      <TableCell align="right">{userType === 'trucker' ? 'Revenue' : 'Spent'}</TableCell>
                      {userType === 'shipper' && <TableCell align="right">Rating</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(userType === 'trucker' ? reportData.topRoutes : reportData.topCarriers)?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.route || item.carrier}</TableCell>
                        <TableCell align="right">{item.trips || item.shipments}</TableCell>
                        <TableCell align="right">₹{(item.revenue || item.spent) / 1000}K</TableCell>
                        {userType === 'shipper' && (
                          <TableCell align="right">{item.rating}/5</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Recent {userType === 'trucker' ? 'Deliveries' : 'Shipments'}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">{userType === 'trucker' ? 'Revenue' : 'Cost'}</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(userType === 'trucker' ? reportData.recentDeliveries : reportData.recentShipments)?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.route}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status.toUpperCase()}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">₹{item.revenue || item.cost}</TableCell>
                    <TableCell>{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports; 