import { createSlice } from '@reduxjs/toolkit';

type ReplyPost = {
    id: string,
    creator: {
        link: string,
        img: string,
    },
    title: string,
    content: string,
}

interface PostState {
    reply: ReplyPost | undefined,
}

const initialState: PostState = {
    reply: undefined
}

export const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers: {
        reply: (state, action: {
            payload: ReplyPost,
        }) => {
            state.reply = action.payload;
        },
        clearReply: (state) => {
            state.reply = undefined;
        }
    },
});

export const { reply, clearReply } = postSlice.actions;

export default postSlice.reducer;
