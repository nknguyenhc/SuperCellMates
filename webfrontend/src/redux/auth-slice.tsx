import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
  username: string;
  isStaff: boolean;
  isSuperuser: boolean;
  isVerified: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  username: "",
  isStaff: false,
  isSuperuser: false,
  isVerified: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: {
        payload: {
          username: string;
        };
      }
    ) => {
      state.isLoggedIn = true;
      state.username = action.payload.username;
      state.isVerified = true;
    },
    setStaff: (state) => {
      state.isStaff = true;
      state.isVerified = true;
    },
    setSuperuser: (state) => {
      state.isSuperuser = true;
      state.isVerified = true;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.isStaff = false;
      state.isSuperuser = false;
      state.isVerified = true;
    },
    updateUsername: (
      state,
      action: {
        payload: string;
      }
    ) => {
      state.username = action.payload;
    },
  },
});

export const { login, logout, setStaff, setSuperuser, updateUsername } = authSlice.actions;

export default authSlice.reducer;
