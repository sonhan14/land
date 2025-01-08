import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllImageInBoundingBox } from '../../services/api';
import { THUNK_API_STATUS } from '../../constants/thunkApiStatus';
import _ from 'lodash';

const getBoundingboxData = createAsyncThunk('api/getBoudingBox', async (args, { getState, rejectWithValue }) => {
    try {
        const { southWest, northEast } = args;
        // const currentData = getState();
        const data = await getAllImageInBoundingBox(southWest, northEast);
        // if (!_.isEqual(currentData.boundingboxSlice.boundingboxData, data)) {
        return data;
        // } else {
        //     return currentData;
        // }
    } catch (error) {
        return rejectWithValue(error);
    }
});

const initialState = {
    boundingboxData: {},
    currentBoundingBox: {
        minLat: 0,
        maxLat: 0,
        minLng: 0,
        maxLng: 0,
    },
    status: THUNK_API_STATUS.DEFAULT,
    initialBoundingBox: {
        southWest: {
            lat: 0,
            lng: 0,
        },
        northEast: {
            lat: 0,
            lng: 0,
        },
    },
    error: null,
};

const boundingboxSlice = createSlice({
    name: 'boundingboxData',
    initialState,
    reducers: {
        setCurrentBoundingBox: (state, action) => {
            state.currentBoundingBox = action.payload;
        },
        setInitialBoundingBox: (state, action) => {
            state.initialBoundingBox = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getBoundingboxData.pending, (state) => {
                state.status = THUNK_API_STATUS.PENDING;
                state.boundingboxData = {};
            })
            .addCase(getBoundingboxData.fulfilled, (state, action) => {
                state.status = THUNK_API_STATUS.SUCCESS;
                state.boundingboxData = action.payload;
            })
            .addCase(getBoundingboxData.rejected, (state) => {
                state.status = THUNK_API_STATUS.REJECTED;
            });
    },
});

// export const {} = boundingboxData.actions;

export { getBoundingboxData };
export const { setCurrentBoundingBox, setInitialBoundingBox } = boundingboxSlice.actions;
export default boundingboxSlice.reducer;
