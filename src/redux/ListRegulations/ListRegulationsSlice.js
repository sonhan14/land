import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { THUNK_API_STATUS } from '../../constants/thunkApiStatus'; // Assuming constants are defined here
import { getListRegulations } from '../../services/api'; // Your API service to fetch data

// Create asyncThunk to fetch regulations
const fetchListRegulations = createAsyncThunk(
    'api/getListRegulations',
    async (args, { rejectWithValue }) => {
        try {
            const { southWest, northEast } = args;
            const data = await getListRegulations(southWest, northEast);
            return data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const initialState = {
    listRegulations: [],
    status: THUNK_API_STATUS.DEFAULT,
    error: null,
};

const listRegulationsSlice = createSlice({
    name: 'listRegulations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchListRegulations.pending, (state) => {
                state.status = THUNK_API_STATUS.PENDING;
                state.listRegulations = [];
            })
            .addCase(fetchListRegulations.fulfilled, (state, action) => {
                state.status = THUNK_API_STATUS.SUCCESS;
                state.listRegulations = action.payload;
            })
            .addCase(fetchListRegulations.rejected, (state) => {
                state.status = THUNK_API_STATUS.REJECTED;
            });
    },
});


export { fetchListRegulations };

export default listRegulationsSlice.reducer;
