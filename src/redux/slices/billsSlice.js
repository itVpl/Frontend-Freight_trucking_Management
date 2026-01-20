import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_API_URL } from '../../apiConfig';

// ===== AUTH HELPERS (mirrors Bills page logic) =====
const getAuthToken = () => {
  const token =
    sessionStorage.getItem('token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('authToken') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('accessToken');

  return token;
};

// ===== SIMPLE IN-MEMORY CACHE PER SHIPPER =====
const requestCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (cacheKey) => {
  const cached = requestCache[cacheKey];
  return cached && cached.data && Date.now() - cached.timestamp < CACHE_TTL;
};

const updateCache = (cacheKey, data) => {
  requestCache[cacheKey] = {
    data,
    timestamp: Date.now(),
  };
};

// ===== THUNK: Fetch VERIFIED loads for a shipper (used by Bills page) =====
export const fetchVerifiedLoadsForShipper = createAsyncThunk(
  'bills/fetchVerifiedLoadsForShipper',
  async ({ shipperId }, { rejectWithValue }) => {
    if (!shipperId) {
      const msg = 'Missing shipperId. Please login or pass shipperId via navigation.';
      // Match Bills page error format
      return rejectWithValue(`API Error: ${msg}`);
    }

    const cacheKey = `verifiedLoads_${shipperId}`;

    // Use cache if still valid
    if (isCacheValid(cacheKey)) {
      return requestCache[cacheKey].data;
    }

    try {
      let url = `${BASE_API_URL}/api/v1/accountant/shipper/all-verified-loads?shipperId=${shipperId}`;

      const token = getAuthToken();

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Transform VERIFIED DOs to match existing Bills table structure
      let transformedData = [];

      if (data.success && Array.isArray(data?.data?.verifiedDOs)) {
        transformedData = data.data.verifiedDOs.map((doItem) => {
          const lr = doItem.loadReference || {};
          const cust = Array.isArray(doItem.customers) ? doItem.customers[0] : undefined;
          const amount = Number(
            cust?.calculatedTotal ?? cust?.totalAmount ?? lr?.rate ?? 0
          ) || 0;

          // Origin/Destination best-effort extraction
          const origin =
            lr.origins?.[0] ||
            lr.originPlace ||
            (doItem.shipper?.pickUpLocations?.[0]
              ? {
                  city: doItem.shipper.pickUpLocations[0].city,
                  state: doItem.shipper.pickUpLocations[0].state,
                  zipCode: doItem.shipper.pickUpLocations[0].zipCode,
                  address: doItem.shipper.pickUpLocations[0].address,
                }
              : undefined);

          const destination =
            lr.destinations?.[0] ||
            lr.destinationPlace ||
            (doItem.shipper?.dropLocations?.[0]
              ? {
                  city: doItem.shipper.dropLocations[0].city,
                  state: doItem.shipper.dropLocations[0].state,
                  zipCode: doItem.shipper.dropLocations[0].zipCode,
                  address: doItem.shipper.dropLocations[0].address,
                }
              : undefined);

          // Dates
          const pickupDate =
            lr.pickupDate ||
            doItem.shipper?.pickUpLocations?.[0]?.pickUpDate ||
            doItem.date;
          const deliveryDate =
            lr.deliveryDate ||
            doItem.shipper?.dropLocations?.[0]?.dropDate ||
            doItem.date;

          return {
            billId: lr.shipmentNumber || doItem._id,
            chargeSetId: lr.poNumber || doItem._id,
            containerId: lr.containerNo || doItem.shipper?.containerNo || 'N/A',
            secondaryRef: lr.bolNumber || doItem.bols?.[0]?.bolNo || doItem._id,
            date: pickupDate ? new Date(pickupDate).toISOString().slice(0, 10) : 'N/A',
            dueDate: deliveryDate
              ? new Date(deliveryDate).toISOString().slice(0, 10)
              : 'N/A',
            amount,
            status: doItem.paymentStatus?.status || 'Pending',
            amount0_30: amount, // treat verified DOs as current
            amount30_60: 0,
            amount60_90: 0,
            loadData: {
              origin,
              destination,
              weight: lr.weight ?? doItem.shipper?.weight,
              commodity: lr.commodity ?? doItem.shipper?.commodity,
              vehicleType: lr.vehicleType ?? doItem.shipper?.containerType,
              carrier: doItem.carrier,
              shipper: doItem.shipper,
              acceptedBid: lr.acceptedBid,
              deliveryOrder: {
                customers: doItem.customers,
              },
              verificationStatus:
                doItem.assignmentStatus ||
                doItem.accountantApproval?.status ||
                doItem.salesApproval?.status,
            },
          };
        });
      }

      const payload = {
        apiData: data,
        originalBillsData: transformedData,
      };

      // Cache full payload so component gets identical data without refetch
      updateCache(cacheKey, payload);

      return payload;
    } catch (err) {
      let errorMessage = `API Error: ${err.message}`;

      // Preserve Bills page special handling for auth-type messages if needed later
      if (
        err.message &&
        err.message.includes('Please login to access this resource')
      ) {
        errorMessage =
          'Authentication required. Please login to access load data.';
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  apiData: null,
  originalBillsData: [],
};

const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    setBillsError: (state, action) => {
      state.error = action.payload || null;
    },
    clearBillsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerifiedLoadsForShipper.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerifiedLoadsForShipper.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.apiData = action.payload?.apiData || null;
        state.originalBillsData = action.payload?.originalBillsData || [];
      })
      .addCase(fetchVerifiedLoadsForShipper.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || 'Failed to load bills data';
        state.apiData = null;
        state.originalBillsData = [];
      });
  },
});

export const { setBillsError, clearBillsError } = billsSlice.actions;

export default billsSlice.reducer;


