import { createSlice } from "@reduxjs/toolkit";

interface MessageState {
    message: string,
    isNewMessage: boolean,
}

const initialState: MessageState = {
    message: '',
    isNewMessage: false,
};

export const messageSlice = createSlice({
    name: 'bottom',
    initialState,
    reducers: {
        setMessage: (state, action: {
            payload: string,
        }) => {
            state.message = action.payload;
            state.isNewMessage = true;
        },
        hide: state => {
            state.isNewMessage = false;
        }
    },
});

export const { setMessage, hide } = messageSlice.actions

export default messageSlice.reducer