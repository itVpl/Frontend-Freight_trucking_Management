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
import Yard from './pages/trucker/Yard';
import YardDropContainer from './pages/trucker/YardDropContainer';
import Reports from './pages/reports/Reports';
import Bills from './pages/shipper/Bills';
import Loadboard from './pages/shipper/Loadboard';
import Profile from './pages/profile/Profile';
import Email from './pages/email/Email';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Completed from './pages/reports/Completed';
import LoadCalculator from './loadshippertruckercalculator/LoadCalculator';
import LandingPage from './pages/auth/LandingPage';
import './App.css';

// Optional: RootGate—agar logged-in hai to dashboard bhej do, warna LandingPage dikhao
import { useAuth } from './context/AuthContext';
function RootGate() {
  const { user } = useAuth?.() || {};
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function App() {
  return (
    <AuthProvider>
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
              <Route path="/add-customer" element={<ProtectedRoute userType="trucker"><AddCustomer /></ProtectedRoute>} />
              <Route path="/add-load" element={<ProtectedRoute userType="trucker"><AddLoad /></ProtectedRoute>} />
              <Route path="/yard" element={<ProtectedRoute userType="trucker"><Yard /></ProtectedRoute>} />
              <Route path="/yard-drop-container" element={<ProtectedRoute userType="trucker"><YardDropContainer /></ProtectedRoute>} />

              {/* Shipper Only Routes */}
              <Route path="/bills" element={<ProtectedRoute userType="shipper"><Bills /></ProtectedRoute>} />
              <Route path="/loadboard" element={<ProtectedRoute userType="shipper"><Loadboard /></ProtectedRoute>} />
            </Route>

            {/* Fallback: unknown routes -> Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
