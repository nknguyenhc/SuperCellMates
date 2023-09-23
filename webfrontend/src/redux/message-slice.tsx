import { createSlice } from "@reduxjs/toolkit";

interface MessageState {
    message: string,
}

const initialState: MessageState = {
    message: '',
};

export const messageSlice = createSlice({
    name: 'bottom',
    initialState,
    reducers: {
        setMessage: (state, action: {
            payload: string,
        }) => {
            state.message = action.payload;
        },
    },
});

export const { setMessage } = messageSlice.actions

export default messageSlice.reducer