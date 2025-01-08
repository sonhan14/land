import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAllQuyHoach, fetchKeHoachsdd, fetchQuyHoachTinh, fetchQuyHoachXayDung, fetchQuyHoachDiaChinh, fetchQuyHoach2030, fetchQuyHoach1500 } from '../../services/api';
import { THUNK_API_STATUS } from '../../constants/thunkApiStatus';

const getAllPlannings = createAsyncThunk('api/getAllPlannings', async (_, { rejectWithValue }) => {
    try {
        const data = await fetchAllQuyHoach();
        return data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const getQuyHoach1500 = createAsyncThunk('api/getQuyHoach1500', async (_, { rejectWithValue }) => {
    try {
        const data = await fetchQuyHoach1500();
        return data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const getQuyHoach2030 = createAsyncThunk('api/getQuyHoach2030', async (_, { rejectWithValue }) => {
    try {
        const data = await fetchQuyHoach2030();
        return data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const getQuyHoachDiaChinh = createAsyncThunk('api/getQuyHoachDiaChinh', async (_, { rejectWithValue }) => {
    try {
        const data = await fetchQuyHoachDiaChinh();
        return data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const getQuyHoachXayDung = createAsyncThunk('api/getQuyHoachXayDung', async (_, { rejectWithValue }) => {
    try {
        const data = await fetchQuyHoachXayDung();
        return data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const getKeHoachsdds = createAsyncThunk('api/getKeHoachsdds', async (_, { rejectWithValue }) => {
    try {
        const data = await fetchKeHoachsdd();
        return data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const getQuyHoachTinh = createAsyncThunk('api/getQuyHoachTinh', async (_, { rejectWithValue }) => {
    try {
        const data = await fetchQuyHoachTinh();
        return data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const initialState = {
    allPlannings: [],
    KeHoachsdds: [],
    quyHoach2030: [],
    quyHoachDiaChinh: [],
    quyHoachXayDung: [],
    quyHoachTinh: [],
    QuyHoach1500: [],
    allPlannings_status: THUNK_API_STATUS.DEFAULT,
    KeHoachsdds_status: THUNK_API_STATUS.DEFAULT,
    QuyHoach2030_status: THUNK_API_STATUS.DEFAULT,
    QuyHoachDiaChinh_status: THUNK_API_STATUS.DEFAULT,
    QuyHoachXayDung_status: THUNK_API_STATUS.DEFAULT,
    QuyHoachTinh_status: THUNK_API_STATUS.DEFAULT,
    QuyHoach1500_status: THUNK_API_STATUS.DEFAULT,

};

const allPlansSlice = createSlice({
    name: 'allPlansSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllPlannings.pending, (state) => {
                state.allPlannings_status = THUNK_API_STATUS.PENDING;
                state.allPlannings = [];
            })
            .addCase(getAllPlannings.fulfilled, (state, action) => {
                state.allPlannings = action.payload;
                state.allPlannings_status = THUNK_API_STATUS.FULFILLED;
            })
            .addCase(getAllPlannings.rejected, (state) => {
                state.allPlannings_status = THUNK_API_STATUS.REJECTED;
            })
            //ke hoach su dung dat
            .addCase(getKeHoachsdds.pending, (state) => {
                state.KeHoachsdds_status = THUNK_API_STATUS.PENDING;
                state.KeHoachsdds = [];
            })
            .addCase(getKeHoachsdds.fulfilled, (state, action) => {
                state.KeHoachsdds = action.payload;
                state.KeHoachsdds_status = THUNK_API_STATUS.FULFILLED;
            })
            .addCase(getKeHoachsdds.rejected, (state) => {
                state.KeHoachsdds_status = THUNK_API_STATUS.REJECTED;
            })
            // quy hoach 1 :500
            .addCase(getQuyHoach1500.pending, (state) => {
                state.QuyHoach1500_status = THUNK_API_STATUS.PENDING;
                state.QuyHoach1500 = [];
            })
            .addCase(getQuyHoach1500.fulfilled, (state, action) => {
                state.QuyHoach1500 = action.payload;
                state.QuyHoach1500_status = THUNK_API_STATUS.FULFILLED;
            })
            .addCase(getQuyHoach1500.rejected, (state) => {
                state.QuyHoach1500_status = THUNK_API_STATUS.REJECTED;
            })
            // quy hoach sau 20030
            .addCase(getQuyHoach2030.pending, (state) => {
                state.QuyHoach2030_status = THUNK_API_STATUS.PENDING;
                state.quyHoach2030 = [];
            })
            .addCase(getQuyHoach2030.fulfilled, (state, action) => {
                state.quyHoach2030 = action.payload;
                state.QuyHoach2030_status = THUNK_API_STATUS.FULFILLED;
            })
            .addCase(getQuyHoach2030.rejected, (state) => {
                state.QuyHoach2030_status = THUNK_API_STATUS.REJECTED;
            })
            // quy hoach dia chinh
            .addCase(getQuyHoachDiaChinh.pending, (state) => {
                state.QuyHoachDiaChinh_status = THUNK_API_STATUS.PENDING;
                state.quyHoachDiaChinh = [];
            })
            .addCase(getQuyHoachDiaChinh.fulfilled, (state, action) => {
                state.quyHoachDiaChinh = action.payload;
                state.QuyHoachDiaChinh_status = THUNK_API_STATUS.FULFILLED;
            })
            .addCase(getQuyHoachDiaChinh.rejected, (state) => {
                state.QuyHoachDiaChinh_status = THUNK_API_STATUS.REJECTED;
            })
            // quy hoach tinh
            .addCase(getQuyHoachTinh.pending, (state) => {
                state.QuyHoachTinh_status = THUNK_API_STATUS.PENDING;
                state.quyHoachTinh = [];
            })
            .addCase(getQuyHoachTinh.fulfilled, (state, action) => {
                state.quyHoachTinh = action.payload;
                state.QuyHoachTinh_status = THUNK_API_STATUS.FULFILLED;
            })
            .addCase(getQuyHoachTinh.rejected, (state) => {
                state.QuyHoachTinh_status = THUNK_API_STATUS.REJECTED;
            })
            // quy hoach xay dung
            .addCase(getQuyHoachXayDung.pending, (state) => {
                state.QuyHoachXayDung_status = THUNK_API_STATUS.PENDING;
                state.quyHoachXayDung = [];
            })
            .addCase(getQuyHoachXayDung.fulfilled, (state, action) => {
                state.quyHoachXayDung = action.payload;
                state.QuyHoachXayDung_status = THUNK_API_STATUS.FULFILLED;
            })
            .addCase(getQuyHoachXayDung.rejected, (state) => {
                state.QuyHoachXayDung_status = THUNK_API_STATUS.REJECTED;
            });


    },
});

const allPlannings = allPlansSlice.reducer;
export { getAllPlannings, getKeHoachsdds, getQuyHoach1500, getQuyHoach2030, getQuyHoachDiaChinh, getQuyHoachTinh, getQuyHoachXayDung };
export default allPlannings;
