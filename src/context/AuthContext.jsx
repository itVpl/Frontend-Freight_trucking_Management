import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BASE_API_URL } from '../apiConfig';

const AuthContext = createContext();

/** Normalize permissions for trucker: backend may send loadBoard (legacy), we use addLoad in UI. */
function normalizeTruckerPermissions(perms) {
  if (!perms || typeof perms !== 'object') return perms;
  return { ...perms, addLoad: perms.addLoad ?? perms.loadBoard };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // On app load: for trucker use GET /api/v1/shipper_driver/trucker as single source of truth for data.permissions; for shipper use my-permissions
  useEffect(() => {
    if (!user || loading) return;
    const ut = user.type || user.userType;
    if (ut !== 'shipper' && ut !== 'shipper_driver' && ut !== 'trucker') return;
    const token = localStorage.getItem('token');
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        if (ut === 'trucker') {
          // Trucker: call trucker profile first (single source of truth for permissions per frontend guide)
          const profileRes = await fetch(`${BASE_API_URL}/api/v1/shipper_driver/trucker`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          });
          if (cancelled) return;
          if (profileRes.ok) {
            const result = await profileRes.json();
            const data = result.data || result;
            if (result.success && data && (data.permissions != null || result.permissions != null)) {
              const rawPerms = data.permissions ?? result.permissions;
              const perms = normalizeTruckerPermissions(rawPerms);
              const isSub = data.isSubUser ?? result.isSubUser;
              setUser((prev) => {
                if (!prev) return prev;
                const updated = { ...prev, permissions: perms, isSubUser: !!isSub };
                if (data.displayName != null || result.displayName != null) updated.name = data.displayName ?? result.displayName;
                if (data.displayEmail != null || result.displayEmail != null) updated.email = data.displayEmail ?? result.displayEmail;
                if (data.subUserId != null || result.subUserId != null) updated.subUserId = data.subUserId ?? result.subUserId;
                localStorage.setItem('user', JSON.stringify(updated));
                return updated;
              });
              return;
            }
          }
          // Fallback: my-permissions
        }
        const permsRes = await fetch(`${BASE_API_URL}/api/v1/shipper_driver/my-permissions`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (cancelled || !permsRes.ok) return;
        const data = await permsRes.json();
        if (data.success && data.permissions) {
          const perms = ut === 'trucker' ? normalizeTruckerPermissions(data.permissions) : data.permissions;
          setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, permissions: perms, isSubUser: !!data.isSubUser };
            if (data.name != null) updated.name = data.name;
            if (data.email != null) updated.email = data.email;
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
          });
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [loading]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  /** Merge profile response into user (permissions, isSubUser, etc.). Call after GET profile (e.g. trucker or shipper). */
  const updateUserFromProfile = useCallback((profileData) => {
    if (!profileData) return;
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (profileData.permissions != null && typeof profileData.permissions === 'object') {
        const ut = prev.type || prev.userType;
        updated.permissions = ut === 'trucker' ? normalizeTruckerPermissions(profileData.permissions) : profileData.permissions;
      }
      if (profileData.isSubUser != null) updated.isSubUser = !!profileData.isSubUser;
      if (profileData.subUserId != null) updated.subUserId = profileData.subUserId;
      if (profileData.displayName != null) updated.name = profileData.displayName;
      if (profileData.displayEmail != null) updated.email = profileData.displayEmail;
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Refresh permissions from backend (GET my-permissions). Used for shipper and trucker. */
  const refreshPermissions = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${BASE_API_URL}/api/v1/shipper_driver/my-permissions`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.success && data.permissions) {
        setUser((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, permissions: data.permissions, isSubUser: !!data.isSubUser };
          if (data.name != null) updated.name = data.name;
          if (data.email != null) updated.email = data.email;
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    userType: user?.type || user?.userType || null,
    isSubUser: !!user?.isSubUser,
    permissions: user?.permissions || null,
    refreshPermissions,
    updateUserFromProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 