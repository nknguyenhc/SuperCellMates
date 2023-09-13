import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  isLoggedIn: boolean,
  username: string,
  isStaff: boolean,
  isSuperuser: boolean,
}

const initialState: AuthState = {
  isLoggedIn: false,
  username: '',
  isStaff: false,
  isSuperuser: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: {
      payload: {
        username: string,
      },
    }) => {
      state.isLoggedIn = true;
      state.username = action.payload.username;
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

export const { login, logout, setStaff, setSuperuser } = authSlice.actions

export default authSlice.reducer