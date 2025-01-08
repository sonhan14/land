import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    location: {
        lat: '',
        lng: '',
        planningId: 0,
    },
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setLocation: (state, action) => {
            state.location = { ...state.location, ...action.payload };
        },
    },
});

export const { setLocation } = locationSlice.actions;
const locationReducer = locationSlice.reducer;
export default locationReducer;
