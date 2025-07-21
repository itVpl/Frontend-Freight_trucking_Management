import { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  LocalShipping,
  Assignment,
  CheckCircle,
  Schedule,
  Cancel,
  DirectionsCar,
  Build,
  TrendingUp,
  LocationOn,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, userType } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const StatCard = ({ title, value, icon, extraContent }) => (
    <Card
      sx={{
        width: '100%',
        height: 200,
        borderRadius: 2,
        boxShadow: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56, mr: 2 }}>{icon}</Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {extraContent && <Box mt={2}>{extraContent}</Box>}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Stat Cards in Fixed 3-Card Rows */}
      <Grid container spacing={3}>
        {[
          { title: 'Total Delivery Today', value: '60', icon: <LocalShipping /> },
          {
            title: 'Pending DOCS',
            value: '0',
            icon: <Assignment />,
            extraContent: (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <LocalShipping sx={{ color: '#f44336' }} />
                <LocationOn sx={{ color: '#f44336', fontSize: 16 }} />
              </Box>
            ),
          },
          {
            title: 'Active',
            value: '40',
            icon: <Assignment />,
            extraContent: (
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: '#4caf50',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle sx={{ color: '#fff' }} />
              </Box>
            ),
          },
          {
            title: 'Delayed',
            value: '5',
            icon: <Schedule />,
            extraContent: (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#1976d2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 'auto',
                }}
              >
                <Schedule sx={{ color: 'white', fontSize: 18 }} />
              </Box>
            ),
          },
          {
            title: 'In Transit',
            value: '15',
            icon: <TrendingUp />,
            extraContent: <LocalShipping sx={{ color: '#ff9800', fontSize: 28, ml: 'auto' }} />,
          },
          {
            title: 'Missed Delivery',
            value: '0',
            icon: <Cancel />,
            extraContent: (
              <Box sx={{ position: 'relative', ml: 'auto' }}>
                <LocalShipping sx={{ color: '#f44336', fontSize: 28 }} />
                <Cancel
                  sx={{
                    color: 'white',
                    fontSize: 16,
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    bgcolor: '#f44336',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </Box>
            ),
          },
        ].map((card, index) => (
          <Grid key={index} item xs={12} sm={6} md={4}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Table Section */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Recent Shipments
        </Typography>
        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shipment ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Origin</TableCell>
                <TableCell>Destination</TableCell>
                <TableCell>ETA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>#123456</TableCell>
                <TableCell>In Transit</TableCell>
                <TableCell>Houston, TX</TableCell>
                <TableCell>Los Angeles, CA</TableCell>
                <TableCell>22 July 2025</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>#123457</TableCell>
                <TableCell>Delivered</TableCell>
                <TableCell>Chicago, IL</TableCell>
                <TableCell>Newark, NJ</TableCell>
                <TableCell>18 July 2025</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;