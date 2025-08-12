import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import LiveTracker from './pages/tracking/LiveTracker';
import Fleet from './pages/trucker/Fleet';
import Billing from './pages/trucker/Billing';
import Driver from './pages/trucker/Driver';
import Consignment from './pages/consignment/Consignment';
import BidManagement from './pages/trucker/BidManagement';
import Reports from './pages/reports/Reports';
import Bills from './pages/shipper/Bills';
import Loadboard from './pages/shipper/Loadboard';
import Profile from './pages/profile/Profile';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Completed from './pages/reports/Completed';
import LoadCalculator from './loadshippertruckercalculator/LoadCalculator';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="live-tracker" element={<LiveTracker />} />
              <Route path="consignment" element={<Consignment />} />
              <Route path="reports" element={<Reports />} />
              <Route path="/reports/complete" element={<Completed />} />
              <Route path="profile" element={<Profile />} />
              <Route path="loadcalculator" element={<LoadCalculator />} />
              
              {/* Trucker Only Routes */}
              <Route path="fleet" element={<ProtectedRoute userType="trucker"><Fleet /></ProtectedRoute>} />
              <Route path="billing" element={<ProtectedRoute userType="trucker"><Billing /></ProtectedRoute>} />
              <Route path="driver" element={<ProtectedRoute userType="trucker"><Driver /></ProtectedRoute>} />
              <Route path="bid-management" element={<ProtectedRoute userType="trucker"><BidManagement /></ProtectedRoute>} />
              
              {/* Shipper Only Routes */}
              <Route path="bills" element={<ProtectedRoute userType="shipper"><Bills /></ProtectedRoute>} />
              <Route path="loadboard" element={<ProtectedRoute userType="shipper"><Loadboard /></ProtectedRoute>} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
