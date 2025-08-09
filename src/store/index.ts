import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { customerApi } from './api/customerApi';
import { transactionApi } from './api/transactionApi';
import customerReducer from './slices/customerSlice';
import transactionReducer from './slices/transactionSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    transaction: transactionReducer,
    ui: uiReducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      customerApi.middleware,
      transactionApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
