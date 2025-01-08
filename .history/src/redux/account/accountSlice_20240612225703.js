import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {

  isLoading: true,
  isAuthenticated: false,
  Users: {
    Username: '',
    FullName: '',
    Password: '',
    Gender: 'Nam',
    Latitude: null,
    Longitude: null,
    avatarLink: null,
    Email: '',
    LastLoginIP: ''
  }
};


export const accountSlice = createSlice({
  name: 'account',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    doLoginAction: (state,action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.isAuthenticated= true;
      state.Users= action.payload;
      state.Users= action.payload.Users
    },

    doLGetAccountAction: (state,action) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes
        state.isAuthenticated= true
        state.Users= action.payload.Users
      },

   
   
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
     
  },
});

export const { doLoginAction,doLGetAccountAction } = accountSlice.actions;



export default accountSlice.reducer;
