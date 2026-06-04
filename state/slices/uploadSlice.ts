import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UploadSuccess } from '@/types/app';

type UploadState = {
	isDragging: boolean;
	error: string | null;
	success: UploadSuccess | null;
};

const initialState: UploadState = {
	isDragging: false,
	error: null,
	success: null,
};

const uploadSlice = createSlice({
	name: 'upload',
	initialState,
	reducers: {
		setDragging(state, action: PayloadAction<boolean>) {
			state.isDragging = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		setSuccess(state, action: PayloadAction<UploadSuccess | null>) {
			state.success = action.payload;
		},
		resetUploadState() {
			return initialState;
		},
	},
});

export const { setDragging, setError, setSuccess, resetUploadState } = uploadSlice.actions;
export default uploadSlice.reducer;
