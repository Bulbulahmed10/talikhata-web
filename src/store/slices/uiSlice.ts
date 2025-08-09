import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  isRefreshing: boolean;
  showSkeleton: boolean;
  animationKey: number;
  lastAction: string | null;
  actionTimestamp: number | null;
}

const initialState: UIState = {
  isLoading: false,
  isRefreshing: false,
  showSkeleton: false,
  animationKey: 0,
  lastAction: null,
  actionTimestamp: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.showSkeleton = true;
      }
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    setShowSkeleton: (state, action: PayloadAction<boolean>) => {
      state.showSkeleton = action.payload;
    },
    triggerAnimation: (state, action: PayloadAction<string>) => {
      state.animationKey += 1;
      state.lastAction = action.payload;
      state.actionTimestamp = Date.now();
    },
    clearLastAction: (state) => {
      state.lastAction = null;
      state.actionTimestamp = null;
    },
  },
});

export const {
  setLoading,
  setRefreshing,
  setShowSkeleton,
  triggerAnimation,
  clearLastAction,
} = uiSlice.actions;

export default uiSlice.reducer;
