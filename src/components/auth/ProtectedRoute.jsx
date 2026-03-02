import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.userType] - 'shipper' | 'trucker' to restrict by user type
 * @param {string} [props.requiredPermission] - For sub-users: only allow if user has this permission (e.g. 'dashboard', 'loadBoard')
 */
const ProtectedRoute = ({ children, userType = null, requiredPermission = null }) => {
  const { isAuthenticated, userType: currentUserType, loading, isSubUser, permissions } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType && currentUserType !== userType) {
    return <Navigate to="/dashboard" replace />;
  }

  // Sub-user (shipper or trucker): require permission for this module (guide §5: redirect when no access)
  if (requiredPermission && (currentUserType === 'shipper' || currentUserType === 'trucker') && isSubUser && permissions) {
    if (!permissions[requiredPermission]) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 