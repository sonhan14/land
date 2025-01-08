import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeLayer: 'VE_TINH',
};

const mapLayerSlice = createSlice({
    name: 'mapLayer',
    initialState,
    reducers: {
        setActiveLayer: (state, action) => {
            state.activeLayer = action.payload;
        },
    },
});

export const { setActiveLayer } = mapLayerSlice.actions;
const mapLayer = mapLayerSlice.reducer;

export default mapLayer;
