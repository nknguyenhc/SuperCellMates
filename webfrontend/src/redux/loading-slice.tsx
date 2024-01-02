import { createSlice } from "@reduxjs/toolkit";

interface LoadingState {
    isLoading: boolean,
}

const initialState: LoadingState = {
    isLoading: false,
};

export const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        setLoading: (state) => {
            state.isLoading = true;
        },
        setNotLoading: (state) => {
            state.isLoading = false;
        },
    },
});

export const { setLoading, setNotLoading } = loadingSlice.actions;

export default loadingSlice.reducer;
