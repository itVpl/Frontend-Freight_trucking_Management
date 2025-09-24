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
  TableContainer,
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
import group23 from "../../assets/Icons super admin/Group23.png"
import group22 from "../../assets/Icons super admin/Group22.png"
import group26 from "../../assets/Icons super admin/Group26.png"
import group21 from "../../assets/Icons super admin/Group21.png"
import group28 from "../../assets/Icons super admin/Group28.png"
import cancel from "../../assets/Icons super admin/cancel.png"
import group29 from "../../assets/Icons super admin/Group29.png"
import group20 from "../../assets/Icons super admin/Vectors/Group20.png"
import group30 from "../../assets/Icons super admin/Vectors/Group30.png"
import group27 from "../../assets/Icons super admin/Vectors/Group27.png"
import CardBoard from "../../assets/Icons super admin/Vectors/CardBoard.png"
import Deliver from "../../assets/Icons super admin/Vectors/deliver.png"
import USA from "../../assets/Icons super admin/Vectors/USA.png"
import localshipping from "../../assets/Icons super admin/Vectors/localshipping.png"
import autotowing from "../../assets/Icons super admin/Vectors/autotowing.png"

const Dashboard = () => {
  const { user, userType } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  
  const StatCard = ({ title, value, icon, image }) => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Header */}
      <Box display="flex" alignItems="center" gap={1}>
        <Box
        // sx={{
        //   backgroundColor: '#1E293B',
        //   p: 1,
        //   borderRadius: '50%',
        //   display: 'flex',
        //   alignItems: 'center',
        //   justifyContent: 'center',
        // }}
        >
          <img src={icon} alt={title} width={50} />
        </Box>
        <Typography fontWeight="bold" fontSize={20}>
          {title}
        </Typography>
      </Box>

      {/* Value & Image */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography fontWeight="bold" fontSize={24}>
          {value}
        </Typography>
        {image && <img src={image} alt={title} width={100} />}
      </Box>
    </Paper>
  );
  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, auto)',
          gap: 2,
          p: 2,
        }}
      >
        {/* Row 1 */}
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard title="Total Delivery Today" value="60" icon={group23} image={CardBoard} />
        </Box>
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard title="Pending DOCS" value="0" icon={group22} image={Deliver} />
        </Box>
        <Box sx={{ gridColumn: 'span 2', gridRow: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 5, height: '100%' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <img src={USA} alt="Map" style={{ width: '100%', height: "300px", maxWidth: 300 }} />
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 2, borderRadius: 8, textTransform: 'none' }}
              >
                Track Shipment In Real-Time
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Row 2 */}
        <Box sx={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
          <StatCard title="Active" value="40" icon={group26} image={group20} />
        </Box>
        <Box sx={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
          <StatCard title="Delayed" value="05" icon={group21} image={group30} />
        </Box>
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard title="In Transit" value="15" icon={group28} image={group27} />
        </Box>
        <Box sx={{ gridColumn: 'span 2' }}>
          <StatCard title="Missed Delivery" value="0" icon={cancel} image={localshipping} />
        </Box>

        {/* Row 3 */}
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard title="Fleet Breakdown" value="0" icon={group29} image={autotowing} />
        </Box>
      </Box>
      <Box mt={4}>
        <Paper
          elevation={3}
          sx={{ borderRadius: 3, overflow: 'hidden' }}
        >
          <Box
            sx={{
              bgcolor: '#1976d2',
              color: '#fff',
              py: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Bid Management
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Load ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Load Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>From</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>To</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ETA</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>LD0331</TableCell>
                  <TableCell>OTR</TableCell>
                  <TableCell>New York</TableCell>
                  <TableCell>Dallas</TableCell>
                  <TableCell>1d</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LD0331</TableCell>
                  <TableCell>OTR</TableCell>
                  <TableCell>San Diego</TableCell>
                  <TableCell>Dallas</TableCell>
                  <TableCell>3d</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LD0331</TableCell>
                  <TableCell>OTR</TableCell>
                  <TableCell>Dallas</TableCell>
                  <TableCell>New York</TableCell>
                  <TableCell>5d</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LD0331</TableCell>
                  <TableCell>OTR</TableCell>
                  <TableCell>Dallas</TableCell>
                  <TableCell>Houston</TableCell>
                  <TableCell>7d</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>LD0331</TableCell>
                  <TableCell>OTR</TableCell>
                  <TableCell>Houston</TableCell>
                  <TableCell>Phoenix</TableCell>
                  <TableCell>1d</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* <Box textAlign="center" py={2}>
          <Button
            variant="contained"
            sx={{
              borderRadius: 10,
              textTransform: 'none',
              backgroundColor: '#2196f3',
              px: 4,
              '&:hover': { backgroundColor: '#1976d2' },
            }}
          >
            View all
          </Button>
        </Box> */}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
