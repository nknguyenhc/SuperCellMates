import { createSlice } from '@reduxjs/toolkit'

// Define a type for the slice state
interface AuthState {
  isLoggedIn: boolean,
  isStaff: boolean,
  isSuperuser: boolean,
}

// Define the initial state using that type
const initialState: AuthState = {
  isLoggedIn: true,
  isStaff: true,
  isSuperuser: true,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: state => {
      state.isLoggedIn = true;
    },
    setStaff: state => {
      state.isStaff = true;
    },
    setSuperuser: state => {
      state.isSuperuser = true;
    },
    logout: state => {
      state.isLoggedIn = false;
      state.isStaff = false;
      state.isSuperuser = false;
    }
  }
})

export const { login, logout } = authSlice.actions

export default authSlice.reducer