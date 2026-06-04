import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { snaphostApi } from './api';
import uploadReducer from './slices/uploadSlice';

export const store = configureStore({
	reducer: {
		upload: uploadReducer,
		[snaphostApi.reducerPath]: snaphostApi.reducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(snaphostApi.middleware),
	devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
