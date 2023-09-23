import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import bottomReducer from './message-slice';
import filterReducer from './filter-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bottom: bottomReducer,
    filter: filterReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;