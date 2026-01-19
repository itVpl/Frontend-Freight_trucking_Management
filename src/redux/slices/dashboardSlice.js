import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_API_URL } from '../../apiConfig';

// ===== AUTH HELPERS =====
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }
  return token;
};

const createHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// ===== OPTIMIZATION: Request Deduplication & Caching =====
// Load cache from localStorage on initialization to persist across page refreshes
const loadCacheFromStorage = (cacheKey) => {
  try {
    const stored = localStorage.getItem(`dashboardCache_${cacheKey}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore parse errors
  }
  return { data: null, timestamp: 0 };
};

const requestCache = {
  dashboardData: loadCacheFromStorage('dashboardData'),
  actualCounts: loadCacheFromStorage('actualCounts'),
  mapData: loadCacheFromStorage('mapData'),
  detailedLoads: loadCacheFromStorage('detailedLoads'),
  bills: loadCacheFromStorage('bills'),
  pendingDelivery: loadCacheFromStorage('pendingDelivery'),
};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Helper to check if cache is still valid
const isCacheValid = (cacheKey) => {
  const cached = requestCache[cacheKey];
  return cached && (Date.now() - cached.timestamp) < CACHE_TTL && cached.data;
};

// Helper to update cache
const updateCache = (cacheKey, data) => {
  const cacheEntry = { data, timestamp: Date.now() };
  requestCache[cacheKey] = cacheEntry;
  // Persist to localStorage for page refresh
  try {
    localStorage.setItem(`dashboardCache_${cacheKey}`, JSON.stringify(cacheEntry));
  } catch (e) {
    // Ignore storage errors (e.g., quota exceeded)
  }
};

// ===== OPTIMIZATION: AbortController for request cancellation =====
const requestControllers = {
  dashboardData: null,
  actualCounts: null,
  mapData: null,
  detailedLoads: null,
  bills: null,
  pendingDelivery: null,
};

// Helper to setup abort controller
const setupController = (controllerKey) => {
  // Cancel previous request if still in flight
  if (requestControllers[controllerKey]) {
    requestControllers[controllerKey].abort();
  }
  requestControllers[controllerKey] = new AbortController();
  return requestControllers[controllerKey];
};

// Async thunk for fetching dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async ({ userType, token }, { rejectWithValue }) => {
    // OPTIMIZATION: Check cache first
    if (isCacheValid('dashboardData')) {
      return requestCache.dashboardData.data;
    }

    const controller = setupController('dashboardData');
    try {
      const authToken = token || getAuthToken();
      const endpoint = userType === 'shipper' 
        ? '/api/v1/load/shipper/dashboard'
        : '/api/v1/load/trucker/dashboard';
      
      const response = await fetch(`${BASE_API_URL}${endpoint}`, {
        method: 'GET',
        headers: createHeaders(authToken),
        signal: controller.signal,
      });

      // Handle 403 Forbidden
      if (response.status === 403) {
        return rejectWithValue('Access denied. Please check your permissions.');
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('token');
        return rejectWithValue('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // OPTIMIZATION: Cache the result
        updateCache('dashboardData', data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      // Don't reject if request was intentionally aborted - silently ignore
      if (error.name === 'AbortError') {
        // Return a special marker that the reducer will ignore
        return rejectWithValue({ __aborted: true });
      }
      console.error('Dashboard fetch error:', error);
      return rejectWithValue(error.message || 'Failed to load dashboard data');
    }
  }
);

// Async thunk for fetching actual counts
export const fetchActualCounts = createAsyncThunk(
  'dashboard/fetchActualCounts',
  async ({ userType, token }, { rejectWithValue }) => {
    // OPTIMIZATION: Check cache first
    if (isCacheValid('actualCounts')) {
      return requestCache.actualCounts.data;
    }

    const controller = setupController('actualCounts');
    try {
      const authToken = token || getAuthToken();
      const role = userType === 'trucker' ? 'trucker' : 'shipper';
      const headers = createHeaders(authToken);
      
      const [totalResponse, biddingResponse, deliveredResponse, inTransitResponse, billsResponse] = await Promise.all([
        fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed`, {
          headers,
          signal: controller.signal,
        }),
        fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed?status=Bidding`, {
          headers,
          signal: controller.signal,
        }),
        fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed?status=Delivered`, {
          headers,
          signal: controller.signal,
        }),
        fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed?status=In Transit`, {
          headers,
          signal: controller.signal,
        }),
        fetch(`${BASE_API_URL}/api/v1/bill/my-bills`, {
          headers,
          signal: controller.signal,
        })
      ]);

      // Handle 403 on bills endpoint gracefully
      let billsData = { success: false, bills: [] };
      if (billsResponse.status === 403) {
        console.warn('Access denied to bills endpoint.');
      } else if (billsResponse.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      } else if (!billsResponse.ok) {
        console.warn(`Bills endpoint error: ${billsResponse.status}`);
      } else {
        billsData = await billsResponse.json();
      }

      // Handle other response errors
      if (totalResponse.status === 401 || inTransitResponse.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }

      const [totalData, biddingData, deliveredData, inTransitData] = await Promise.all([
        totalResponse.json(),
        biddingResponse.json(),
        deliveredResponse.json(),
        inTransitResponse.json(),
      ]);

      const inTransitCount = inTransitData.success ? inTransitData.data.loads.length : 0;
      const billsCount = billsData.success && billsData.bills ? billsData.bills.length : 0;
      
      const counts = {
        totalLoads: totalData.success ? totalData.data.loads.length : 0,
        bidding: biddingData.success ? biddingData.data.loads.length : 0,
        delivered: deliveredData.success ? deliveredData.data.loads.length : 0,
        inTransit: inTransitCount,
        pendingDeliveries: inTransitCount,
        bills: billsCount
      };
      
      // OPTIMIZATION: Cache the result
      updateCache('actualCounts', counts);
      return counts;
    } catch (error) {
      // Don't reject if request was intentionally aborted - silently ignore
      if (error.name === 'AbortError') {
        return rejectWithValue({ __aborted: true });
      }
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching map data
export const fetchMapData = createAsyncThunk(
  'dashboard/fetchMapData',
  async ({ userType, token, getCoordinatesFromCity }, { rejectWithValue }) => {
    // OPTIMIZATION: Check cache first
    if (isCacheValid('mapData')) {
      return requestCache.mapData.data;
    }

    const controller = setupController('mapData');
    try {
      const authToken = token || getAuthToken();
      const role = userType === 'trucker' ? 'trucker' : 'shipper';
      
      const response = await fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed`, {
        method: 'GET',
        headers: createHeaders(authToken),
        signal: controller.signal,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.success && Array.isArray(data?.data?.loads)) {
        const processedData = data.data.loads.map(load => {
          const originObj = Array.isArray(load.origin) ? (load.origin[0] || {}) : (load.origin || {});
          const destinationObj = Array.isArray(load.destination) ? (load.destination[0] || {}) : (load.destination || {});
          const originCity = originObj.city || '';
          const originState = originObj.state || '';
          const destCity = destinationObj.city || '';
          const destState = destinationObj.state || '';
          const originCoords = getCoordinatesFromCity(originCity, originState);
          const destinationCoords = getCoordinatesFromCity(destCity, destState);
          return {
            id: load._id,
            shipmentNumber: load.shipmentNumber,
            status: load.status,
            origin: { city: originCity, state: originState, coordinates: originCoords },
            destination: { city: destCity, state: destState, coordinates: destinationCoords },
            pickupDate: load.pickupDate,
            deliveryDate: load.deliveryDate,
            rate: load.rate,
            loadType: load.loadType,
            weight: load.weight,
          };
        }).filter(item => Array.isArray(item.origin.coordinates) && Array.isArray(item.destination.coordinates));
        
        // OPTIMIZATION: Cache the result
        updateCache('mapData', processedData);
        return processedData;
      }
      return [];
    } catch (error) {
      // Don't reject if request was intentionally aborted - silently ignore
      if (error.name === 'AbortError') {
        return rejectWithValue({ __aborted: true });
      }
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching detailed loads
export const fetchDetailedLoads = createAsyncThunk(
  'dashboard/fetchDetailedLoads',
  async ({ userType, token, status = null }, { rejectWithValue }) => {
    const cacheKey = `detailedLoads_${status || 'all'}`;
    
    // OPTIMIZATION: Check cache first
    if (isCacheValid(cacheKey)) {
      return requestCache[cacheKey]?.data;
    }

    const controller = setupController('detailedLoads');
    try {
      const authToken = token || getAuthToken();
      const role = userType === 'trucker' ? 'trucker' : 'shipper';
      
      let url = `${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed`;
      if (status) {
        url += `?status=${encodeURIComponent(status)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders(authToken),
        signal: controller.signal,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.loads) {
        // Format the API data for table display
        const formattedData = data.data.loads.map(load => {
          // Helper function to format location from origins/destinations array
          const formatLocationFromArray = (locationArray) => {
            if (!locationArray || !Array.isArray(locationArray) || locationArray.length === 0) {
              return 'N/A';
            }
            
            // Take the first location from the array
            const firstLocation = locationArray[0];
            if (firstLocation.city && firstLocation.state) {
              return `${firstLocation.city}, ${firstLocation.state}`;
            }
            if (firstLocation.city) {
              return firstLocation.city;
            }
            if (firstLocation.extractedCity) {
              return firstLocation.extractedCity;
            }
            return 'N/A';
          };
          
          return {
            id: load.shipmentNumber || load._id || 'N/A',
            type: load.loadType || 'OTR',
            from: formatLocationFromArray(load.origins),
            to: formatLocationFromArray(load.destinations),
            eta: load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'N/A',
            status: load.status || 'N/A',
            weight: load.weight || 'N/A',
            rate: load.rate || 'N/A',
            pickupDate: load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'N/A',
            driverName: load.acceptedBid?.driverName || 'N/A',
            vehicleNumber: load.acceptedBid?.vehicleNumber || 'N/A',
            commodity: load.commodity || 'N/A',
            vehicleType: load.vehicleType || 'N/A'
          };
        });
        
        // OPTIMIZATION: Cache the result
        updateCache(cacheKey, { loads: formattedData, status });
        return { loads: formattedData, status };
      }
      return { loads: [], status };
    } catch (error) {
      // Don't reject if request was intentionally aborted - silently ignore
      if (error.name === 'AbortError') {
        return rejectWithValue({ __aborted: true });
      }
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching bills
export const fetchBills = createAsyncThunk(
  'dashboard/fetchBills',
  async ({ token }, { rejectWithValue }) => {
    // OPTIMIZATION: Check cache first
    if (isCacheValid('bills')) {
      return requestCache.bills.data;
    }

    const controller = setupController('bills');
    try {
      const authToken = token || getAuthToken();
      
      const response = await fetch(`${BASE_API_URL}/api/v1/bill/my-bills`, {
        method: 'GET',
        headers: createHeaders(authToken),
        signal: controller.signal,
      });

      // Handle 403 Forbidden - user may not have access to bills
      if (response.status === 403) {
        console.warn('User does not have access to bills endpoint');
        return [];
      }

      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.bills && Array.isArray(data.bills)) {
        return data.bills;
      }
      return [];
    } catch (error) {
      // Don't reject if request was intentionally aborted - silently ignore
      if (error.name === 'AbortError') {
        return rejectWithValue({ __aborted: true });
      }
      console.error('Bills fetch error:', error);
      return rejectWithValue(error.message || 'Failed to load bills');
    }
  }
);

// Async thunk for fetching pending delivery data
export const fetchPendingDeliveryData = createAsyncThunk(
  'dashboard/fetchPendingDeliveryData',
  async ({ userType, token }, { rejectWithValue }) => {
    // OPTIMIZATION: Check cache first
    if (isCacheValid('pendingDelivery')) {
      return requestCache.pendingDelivery.data;
    }

    const controller = setupController('pendingDelivery');
    try {
      const role = userType === 'trucker' ? 'trucker' : 'shipper';
      
      // Fetch only In Transit status loads
      const inTransitResponse = await fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed?status=In%20Transit`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!inTransitResponse.ok) {
        throw new Error('Failed to fetch pending delivery data');
      }

      const inTransitData = await inTransitResponse.json();

      // Get loads from In Transit response
      const allLoads = [];
      if (inTransitData.success && inTransitData.data.loads) {
        allLoads.push(...inTransitData.data.loads);
      }

      // Format the combined data for table display
      const formattedData = allLoads.map(load => {
        // Helper function to format location from origins/destinations array
        const formatLocationFromArray = (locationArray) => {
          if (!locationArray || !Array.isArray(locationArray) || locationArray.length === 0) {
            return 'N/A';
          }
          
          // Take the first location from the array
          const firstLocation = locationArray[0];
          if (firstLocation.city && firstLocation.state) {
            return `${firstLocation.city}, ${firstLocation.state}`;
          }
          if (firstLocation.city) {
            return firstLocation.city;
          }
          if (firstLocation.extractedCity) {
            return firstLocation.extractedCity;
          }
          return 'N/A';
        };
        
        return {
          id: load.shipmentNumber || load._id || 'N/A',
          type: load.loadType || 'OTR',
          from: formatLocationFromArray(load.origins),
          to: formatLocationFromArray(load.destinations),
          eta: load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'N/A',
          status: load.status || 'N/A',
          weight: load.weight || 'N/A',
          rate: load.rate || 'N/A',
          pickupDate: load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'N/A',
          driverName: load.acceptedBid?.driverName || 'N/A',
          vehicleNumber: load.acceptedBid?.vehicleNumber || 'N/A',
          commodity: load.commodity || 'N/A',
          vehicleType: load.vehicleType || 'N/A'
        };
      });
      
      // OPTIMIZATION: Cache the result
      updateCache('pendingDelivery', formattedData);
      return formattedData;
    } catch (error) {
      // Don't reject if request was intentionally aborted - silently ignore
      if (error.name === 'AbortError') {
        return rejectWithValue({ __aborted: true });
      }
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Main dashboard data
  dashboardData: null,
  dashboardLoading: true,
  dashboardError: null,
  
  // Actual counts (lazy loaded)
  actualCounts: {
    totalLoads: 0,
    pendingDeliveries: 0,
    delivered: 0,
    inTransit: 0,
    bidding: 0,
    bills: 0
  },
  actualCountsLoading: false,
  actualCountsError: null,
  
  // Map data
  mapData: [],
  mapLoading: false,
  mapError: null,
  
  // Table data
  tableData: [],
  tableLoading: false,
  tableError: null,
  selectedCard: 'Bid Management',
  
  // Pagination
  currentPage: 1,
  itemsPerPage: 5,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Synchronous actions
    setSelectedCard: (state, action) => {
      state.selectedCard = action.payload;
      state.currentPage = 1; // Reset pagination when card changes
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    resetTableData: (state) => {
      state.tableData = [];
      state.currentPage = 1;
    },
    resetDashboardState: () => {
      return initialState;
    },
    // Clear error messages
    clearDashboardError: (state) => {
      state.dashboardError = null;
    },
    clearTableError: (state) => {
      state.tableError = null;
    },
    clearActualCountsError: (state) => {
      state.actualCountsError = null;
    },
    clearMapError: (state) => {
      state.mapError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.dashboardData = action.payload;
        state.dashboardLoading = false;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        // Ignore aborted requests - don't set error state for page refreshes
        if (action.payload && typeof action.payload === 'object' && action.payload.__aborted) {
          state.dashboardLoading = false;
          // Keep existing error state or null - don't update for aborted requests
          return;
        }
        state.dashboardError = action.payload;
        state.dashboardLoading = false;
      });

    // Fetch Actual Counts
    builder
      .addCase(fetchActualCounts.pending, (state) => {
        state.actualCountsLoading = true;
        state.actualCountsError = null;
      })
      .addCase(fetchActualCounts.fulfilled, (state, action) => {
        state.actualCounts = action.payload;
        state.actualCountsLoading = false;
      })
      .addCase(fetchActualCounts.rejected, (state, action) => {
        // Ignore aborted requests - don't set error state for page refreshes
        if (action.payload && typeof action.payload === 'object' && action.payload.__aborted) {
          state.actualCountsLoading = false;
          return;
        }
        state.actualCountsError = action.payload;
        state.actualCountsLoading = false;
      });

    // Fetch Map Data
    builder
      .addCase(fetchMapData.pending, (state) => {
        state.mapLoading = true;
        state.mapError = null;
      })
      .addCase(fetchMapData.fulfilled, (state, action) => {
        state.mapData = action.payload;
        state.mapLoading = false;
      })
      .addCase(fetchMapData.rejected, (state, action) => {
        // Ignore aborted requests - don't set error state for page refreshes
        if (action.payload && typeof action.payload === 'object' && action.payload.__aborted) {
          state.mapLoading = false;
          return;
        }
        state.mapError = action.payload;
        state.mapLoading = false;
      });

    // Fetch Detailed Loads
    builder
      .addCase(fetchDetailedLoads.pending, (state) => {
        state.tableLoading = true;
        state.tableError = null;
      })
      .addCase(fetchDetailedLoads.fulfilled, (state, action) => {
        state.tableData = action.payload.loads;
        state.tableLoading = false;
        state.currentPage = 1;
      })
      .addCase(fetchDetailedLoads.rejected, (state, action) => {
        // Ignore aborted requests - don't set error state for page refreshes
        if (action.payload && typeof action.payload === 'object' && action.payload.__aborted) {
          state.tableLoading = false;
          return;
        }
        state.tableError = action.payload;
        state.tableLoading = false;
        state.tableData = [];
      });

    // Fetch Bills
    builder
      .addCase(fetchBills.pending, (state) => {
        state.tableLoading = true;
        state.tableError = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.tableData = action.payload;
        state.tableLoading = false;
        state.currentPage = 1;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        // Ignore aborted requests - don't set error state for page refreshes
        if (action.payload && typeof action.payload === 'object' && action.payload.__aborted) {
          state.tableLoading = false;
          return;
        }
        state.tableError = action.payload;
        state.tableLoading = false;
        state.tableData = [];
      });

    // Fetch Pending Delivery Data
    builder
      .addCase(fetchPendingDeliveryData.pending, (state) => {
        state.tableLoading = true;
        state.tableError = null;
      })
      .addCase(fetchPendingDeliveryData.fulfilled, (state, action) => {
        state.tableData = action.payload;
        state.tableLoading = false;
        state.currentPage = 1;
      })
      .addCase(fetchPendingDeliveryData.rejected, (state, action) => {
        // Ignore aborted requests - don't set error state for page refreshes
        if (action.payload && typeof action.payload === 'object' && action.payload.__aborted) {
          state.tableLoading = false;
          return;
        }
        state.tableError = action.payload;
        state.tableLoading = false;
        state.tableData = [];
      });
  }
});

export const { 
  setSelectedCard, 
  setCurrentPage, 
  resetTableData,
  resetDashboardState,
  clearDashboardError,
  clearTableError,
  clearActualCountsError,
  clearMapError
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
