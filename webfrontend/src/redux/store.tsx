import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import bottomReducer from './message-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bottom: bottomReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;