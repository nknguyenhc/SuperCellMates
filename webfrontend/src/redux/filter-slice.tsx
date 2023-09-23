import { createSlice } from "@reduxjs/toolkit";

interface FilterState {
    isNewFilter: boolean,
    timeout: number,
};

const initialState: FilterState = {
    isNewFilter: false,
    timeout: -1,
};

export const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        turnoff: state => {
            state.isNewFilter = false;
        },
        turnon: state => {
            state.isNewFilter = true;
        },
    },
});

export const { turnoff, turnon } = filterSlice.actions;

export default filterSlice.reducer;