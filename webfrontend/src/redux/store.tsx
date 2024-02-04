import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import bottomReducer from './message-slice';
import filterReducer from './filter-slice';
import postReducer from './post-slice';
import loadingReducer from './loading-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bottom: bottomReducer,
    filter: filterReducer,
    post: postReducer,
    loading: loadingReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;