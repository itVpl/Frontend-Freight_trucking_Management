import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_API_URL } from '../../apiConfig';

// Async thunk to fetch shipper loads for the Load Board
export const fetchShipperLoads = createAsyncThunk(
  'loadBoard/fetchShipperLoads',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/load/shipper`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        return rejectWithValue('Session expired. Please log in again.');
      }

      if (!response.ok) {
        return rejectWithValue(`Failed to fetch loads. Status: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.loads)) {
        return data.loads;
      }

      if (Array.isArray(data)) {
        return data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching shipper loads:', error);
      return rejectWithValue(error.message || 'Failed to load data');
    }
  }
);

const initialState = {
  loads: [],
  originalLoads: [],
  loading: false,
  error: null,
  lastFetched: null, // Timestamp of last successful fetch for cache validation
};

const loadBoardSlice = createSlice({
  name: 'loadBoard',
  initialState,
  reducers: {
    // Reset current view back to the original unfiltered loads
    resetLoadsToOriginal(state) {
      state.loads = state.originalLoads;
    },
    // Allow overriding the current view (e.g., search filter)
    setLoads(state, action) {
      state.loads = action.payload || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShipperLoads.pending, (state) => {
        // Only set loading=true if we don't have cached data (to show UI immediately)
        if (!state.loads || state.loads.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchShipperLoads.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.loads = action.payload || [];
        state.originalLoads = action.payload || [];
        state.lastFetched = Date.now(); // Store timestamp for cache validation
      })
      .addCase(fetchShipperLoads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load data';
        state.loads = [];
        state.originalLoads = [];
      });
  },
});

export const { resetLoadsToOriginal, setLoads } = loadBoardSlice.actions;

export default loadBoardSlice.reducer;


