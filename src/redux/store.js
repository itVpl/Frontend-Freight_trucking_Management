import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import loadBoardReducer from './slices/loadBoardSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    loadBoard: loadBoardReducer,
  },
});
