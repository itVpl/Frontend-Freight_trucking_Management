// OPTIMIZATION: Import createSelector from reselect for memoized selectors
import { createSelector } from 'reselect';

// Base selectors - these select raw state values
export const selectDashboardState = (state) => state.dashboard;
export const selectDashboardData = (state) => state.dashboard.dashboardData;
export const selectDashboardLoading = (state) => state.dashboard.dashboardLoading;
export const selectDashboardError = (state) => state.dashboard.dashboardError;

// Actual counts selectors
export const selectActualCounts = (state) => state.dashboard.actualCounts;
export const selectActualCountsLoading = (state) => state.dashboard.actualCountsLoading;

// Map data selectors
export const selectMapData = (state) => state.dashboard.mapData;
export const selectMapLoading = (state) => state.dashboard.mapLoading;

// Table data selectors
export const selectTableData = (state) => state.dashboard.tableData;
export const selectTableLoading = (state) => state.dashboard.tableLoading;
export const selectSelectedCard = (state) => state.dashboard.selectedCard;
export const selectCurrentPage = (state) => state.dashboard.currentPage;
export const selectItemsPerPage = (state) => state.dashboard.itemsPerPage;

// ===== OPTIMIZATION: Memoized Computed Selectors =====
// These only recompute when their input selectors change (not on every render)
export const selectPaginatedTableData = createSelector(
  [selectTableData, selectCurrentPage, selectItemsPerPage],
  (tableData, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tableData.slice(startIndex, endIndex);
  }
);

export const selectTotalPages = createSelector(
  [selectTableData, selectItemsPerPage],
  (tableData, itemsPerPage) => Math.ceil(tableData.length / itemsPerPage)
);

// ===== OPTIMIZATION: Combined loading states selector =====
// Memoized selector to check if any data is loading
export const selectIsAnyLoading = createSelector(
  [selectDashboardLoading, selectActualCountsLoading, selectMapLoading, selectTableLoading],
  (dashboard, actualCounts, map, table) => 
    dashboard || actualCounts || map || table
);

// ===== OPTIMIZATION: Combined error states selector =====
// Memoized selector to check for any errors
export const selectAnyError = createSelector(
  [selectDashboardError],
  (dashboardError) => dashboardError
);

// ===== OPTIMIZATION: Memoized dashboard value selector with fallback logic =====
export const selectDashboardValue = createSelector(
  [selectDashboardData, selectActualCounts, (state, key) => key],
  (dashboardData, actualCounts, key) => {
    // Pending Delivery / In Transit: prefer actualCounts so card matches the table (same my-loads-detailed API)
    if (key === 'pendingDeliveries' || key === 'inTransitLoads') {
      if (actualCounts.inTransit !== undefined && actualCounts.inTransit !== null) {
        return actualCounts.inTransit;
      }
      if (dashboardData?.dashboard) {
        const fromDashboard = dashboardData.dashboard.inTransitLoads ?? dashboardData.dashboard.inTransit ?? dashboardData.dashboard[key];
        if (fromDashboard !== undefined && fromDashboard !== null) return fromDashboard;
      }
      return actualCounts.inTransit ?? 0;
    }

    // Bids On Loads: prefer actualCounts.bidding so card matches the table (same my-loads-detailed API)
    if (key === 'bidding') {
      if (actualCounts.bidding !== undefined && actualCounts.bidding !== null) {
        return actualCounts.bidding;
      }
      if (dashboardData?.dashboard && (dashboardData.dashboard.bidding ?? dashboardData.dashboard[key]) != null) {
        return dashboardData.dashboard.bidding ?? dashboardData.dashboard[key];
      }
      return actualCounts.bidding ?? 0;
    }

    // Priority: dashboardData (from main API) > actualCounts (lazy loaded) > defaults
    if (dashboardData?.dashboard) {
      if (key === 'delivered') {
        const dashboardValue = dashboardData.dashboard.statusBreakdown?.delivered;
        if (dashboardValue !== undefined && dashboardValue !== null) {
          return dashboardValue;
        }
      }
      
      const dashboardValue = dashboardData.dashboard[key];
      if (dashboardValue !== undefined && dashboardValue !== null) {
        return dashboardValue;
      }
    }
    
    if (actualCounts[key] !== undefined && actualCounts[key] !== null) {
      return actualCounts[key];
    }
    
    // Default values
    const defaults = {
      totalLoads: 0,
      todayDeliveries: 0,
      pendingDeliveries: 0,
      activeLoads: 0,
      delayedLoads: 0,
      inTransitLoads: 0,
      overdueLoads: 0,
      delivered: 0,
      bills: 0
    };
    return defaults[key] || 0;
  }
);

// ===== OPTIMIZATION: Memoized map coordinates selector =====
// Only recomputes when mapData changes
export const selectMapCoordinates = createSelector(
  [selectMapData],
  (mapData) => {
    if (!mapData || !Array.isArray(mapData)) return [];
    // Transform data only when it changes
    return mapData.filter(coord => coord && coord.lat && coord.lng);
  }
);

// ===== OPTIMIZATION: Memoized table stats selector =====
// Compute statistics only when tableData changes
export const selectTableStats = createSelector(
  [selectTableData],
  (tableData) => ({
    totalItems: tableData.length,
    hasData: tableData.length > 0,
    isEmpty: tableData.length === 0
  })
);

// ===== NEW: Combined error states with details =====
// Memoized selector to check for any errors with details
export const selectAllErrors = createSelector(
  [
    selectDashboardError,
    (state) => state.dashboard.actualCountsError,
    (state) => state.dashboard.mapError,
    (state) => state.dashboard.tableError
  ],
  (dashboard, actualCounts, map, table) => ({
    dashboard,
    actualCounts,
    map,
    table,
    hasError: !!(dashboard || actualCounts || map || table),
    primaryError: dashboard || actualCounts || map || table || null
  })
);
