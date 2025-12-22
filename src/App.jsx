import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import LiveTracker from './pages/tracking/LiveTracker';
import Fleet from './pages/trucker/Fleet';
import Billing from './pages/trucker/Billing';
import Driver from './pages/trucker/Driver';
import Consignment from './pages/consignment/Consignment';
import BidManagement from './pages/trucker/BidManagement';
import AddCustomer from './pages/trucker/AddCustomer';
import AddLoad from './pages/trucker/AddLoad';
import AddUserTrucker from './pages/trucker/AddUserTrucker';
import Reports from './pages/reports/Reports';
import Bills from './pages/shipper/Bills';
import Loadboard from './pages/shipper/Loadboard';
import AddUserShipper from './pages/shipper/AddUserShipper';
import Profile from './pages/profile/Profile';
import Email from './pages/email/Email';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Completed from './pages/reports/Completed';
import LoadCalculator from './loadshippertruckercalculator/LoadCalculator';
import LandingPage from './pages/auth/LandingPage';
import './App.css';
import { ThemeProvider, useThemeConfig } from './context/ThemeContext';
import { NegotiationProvider } from './context/NegotiationContext';
import UniversalNegotiationPopup from './components/UniversalNegotiationPopup';
import { ThemeProvider as MuiThemeProvider, createTheme, alpha } from '@mui/material/styles';
import { useMemo } from 'react';

// Optional: RootGate—agar logged-in hai to dashboard bhej do, warna LandingPage dikhao
import { useAuth } from './context/AuthContext';
function RootGate() {
  const { user } = useAuth?.() || {};
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function App() {
  const UiThemeWrapper = ({ children }) => {
    const { themeConfig } = useThemeConfig();
    const muiTheme = useMemo(() => {
      const brand = themeConfig.tokens?.primary || '#1976d2';
      const textColor = themeConfig.tokens?.text || '#333333';
      const headerBg = (themeConfig.header?.bg && themeConfig.header.bg !== 'white') ? themeConfig.header.bg : brand;
      const headerText = themeConfig.header?.text || '#ffffff';
      const tableBg = themeConfig.table?.bg || '#ffffff';
      const tableText = themeConfig.table?.text || textColor;
      const tableHeaderBg = themeConfig.table?.headerBg || '#f0f4f8';
      const tableHeaderText = themeConfig.table?.headerText || tableText;
      const contrastRows = Boolean(themeConfig.content?.bgImage) || Boolean(themeConfig.table?.bgImage);
      return createTheme({
        palette: {
          mode: 'light',
          primary: { main: brand },
          text: { primary: textColor },
          background: { default: themeConfig.content?.bg || '#f8f9fa' },
        },
        components: {
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                color: headerText,
                backgroundColor: headerBg,
                borderBottom: `1px solid ${alpha(brand, 0.3)}`,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                color: contrastRows ? '#111' : tableText,
                fontWeight: contrastRows ? 600 : undefined,
                letterSpacing: contrastRows ? '0.2px' : undefined,
                textShadow: 'none',
                '& .MuiTypography-root': { 
                  color: contrastRows ? '#111' : tableText,
                  fontWeight: contrastRows ? 600 : undefined,
                  letterSpacing: contrastRows ? '0.2px' : undefined,
                  textShadow: 'none',
                },
                '& p, & span': { 
                  color: contrastRows ? '#111' : tableText,
                  fontWeight: contrastRows ? 500 : undefined,
                  letterSpacing: contrastRows ? '0.15px' : undefined,
                  textShadow: 'none',
                },
              },
              head: {
                backgroundColor: tableHeaderBg,
                color: contrastRows ? '#111' : tableHeaderText,
                fontWeight: contrastRows ? 700 : 600,
                letterSpacing: contrastRows ? '0.25px' : undefined,
                textShadow: 'none',
              },
            },
          },
          MuiTableBody: {
            styleOverrides: {
              root: {
                '& td': { color: tableText },
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                '& td, & th': { borderColor: alpha(brand, 0.08) },
                textShadow: 'none',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              label: {
                fontWeight: 600,
                textShadow: 'none',
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& th': {
                  backgroundColor: tableHeaderBg,
                  color: tableHeaderText,
                  fontWeight: 600,
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              containedPrimary: {
                backgroundImage: `linear-gradient(90deg, ${brand}, ${alpha(brand, 0.85)})`,
                color: '#111',
              },
              outlinedPrimary: {
                borderColor: brand,
                color: brand,
              },
              textPrimary: { color: brand },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                '&:hover': { backgroundColor: alpha(brand, 0.12) },
                '&.Mui-selected': { backgroundColor: alpha(brand, 0.25), color: '#fff' },
              },
            },
          },
        },
      });
    }, [themeConfig]);
    return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <UiThemeWrapper>
          <Router>
            <div className="App">
              <Routes>
            {/* Public Routes */}
            <Route path="/root" element={<RootGate />} />
            <Route path="/landingpage" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Layout wrapper with no path */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Keep absolute paths as-is so URLs don't change */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/live-tracker" element={<LiveTracker />} />
              <Route path="/consignment" element={<ErrorBoundary><Consignment /></ErrorBoundary>} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/complete" element={<Completed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/loadcalculator" element={<LoadCalculator />} />
              <Route path="/email" element={<Email />} />

              {/* Trucker Only Routes */}
              <Route path="/fleet" element={<ProtectedRoute userType="trucker"><Fleet /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute userType="trucker"><Billing /></ProtectedRoute>} />
              <Route path="/driver" element={<ProtectedRoute userType="trucker"><Driver /></ProtectedRoute>} />
              <Route path="/bid-management" element={<ProtectedRoute userType="trucker"><BidManagement /></ProtectedRoute>} />
              <Route path="/add-customer" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
              <Route path="/add-load" element={<ProtectedRoute userType="trucker"><AddLoad /></ProtectedRoute>} />

              {/* Shipper Only Routes */}
              <Route path="/bills" element={<ProtectedRoute userType="shipper"><Bills /></ProtectedRoute>} />
              <Route path="/loadboard" element={<ProtectedRoute userType="shipper"><Loadboard /></ProtectedRoute>} />
              <Route path="/add-user-shipper" element={<ProtectedRoute userType="shipper"><AddUserShipper /></ProtectedRoute>} />
              <Route path="/add-user-trucker" element={<ProtectedRoute userType="trucker"><AddUserTrucker /></ProtectedRoute>} />
            </Route>

            {/* Fallback: unknown routes -> Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </UiThemeWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
