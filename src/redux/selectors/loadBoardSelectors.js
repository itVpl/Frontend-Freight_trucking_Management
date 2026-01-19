import { createSelector } from 'reselect';

// Base selectors
export const selectLoadBoardState = (state) => state.loadBoard;

export const selectLoads = (state) => state.loadBoard.loads;
export const selectOriginalLoads = (state) => state.loadBoard.originalLoads;
export const selectLoadBoardLoading = (state) => state.loadBoard.loading;
export const selectLoadBoardError = (state) => state.loadBoard.error;
export const selectLastFetched = (state) => state.loadBoard.lastFetched;

// Memoized selector to derive tab counts similar to existing component logic
export const selectTabCounts = createSelector([selectLoads], (loads) => {
  if (!loads || loads.length === 0) return [0, 0, 0, 0];

  const normalize = (status) => (status ? status.toLowerCase() : '');

  const pending = loads.filter((load) =>
    ['pending', 'approval', 'pending approval', 'posted'].includes(normalize(load.status))
  ).length;

  const bidding = loads.filter((load) =>
    ['bidding', 'bid received', 'posted'].includes(normalize(load.status))
  ).length;

  const inTransit = loads.filter((load) =>
    ['assigned', 'in transit', 'picked up'].includes(normalize(load.status))
  ).length;

  const delivered = loads.filter((load) =>
    ['delivered', 'completed'].includes(normalize(load.status))
  ).length;

  return [pending, bidding, inTransit, delivered];
});


