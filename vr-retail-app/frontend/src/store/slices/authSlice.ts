import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = { id: string; name: string; email: string };

type AuthState = {
  user: User | null;
  token: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    }
  }
});

export const { setAuth, logout } = slice.actions;
export default slice.reducer;
