import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { THUNK_API_STATUS } from '../../constants/thunkApiStatus';
import { getUserCoins } from '../../services/api';

const getCoins = createAsyncThunk('api/getCoins', async (args, { rejectWithValue }) => {
    try {
        const  userId  = args;
        const data = await getUserCoins(userId);
        return data?.[0]?.coin;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const initialState = {
    isAuthenticated: false,
    Users: {
        Username: '',
        FullName: '',
        Password: '',
        Gender: '',
        Latitude: null,
        Longitude: null,
        avatarLink: null,
        Email: '',
        LastLoginIP: '',
    },
    status: THUNK_API_STATUS.DEFAULT,
    coins: 0,
    dataUser: {},
};

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        doLoginAction: (state, action) => {
            state.isAuthenticated = true;
            state.Users = {
                ...action.payload.userData,
            };
            state.dataUser = action.payload;
        },

        doLGetAccountAction: (state, action) => {
            state.isAuthenticated = true;
            state.Users = action.payload;
        },

        doLogoutAction: (state) => {
            state.isAuthenticated = false;
            state.Users = {
                Username: '',
                FullName: '',
                Password: '',
                Gender: '',
                Latitude: null,
                Longitude: null,
                avatarLink: null,
                Email: '',
                LastLoginIP: '',
            };
            state.dataUser = {};
        },

        doLoginDataUser: (state, action) => {
            state.dataUser = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCoins.pending, (state) => {
                state.status = THUNK_API_STATUS.PENDING;
                state.coins = 0;
            })
            .addCase(getCoins.fulfilled, (state, action) => {
                state.status = THUNK_API_STATUS.fulfilled;
                state.coins = action.payload;
            })
            .addCase(getCoins.rejected, (state) => {
                state.status = THUNK_API_STATUS.REJECTED;
            });
    },
});

export const { doLoginAction, doLGetAccountAction, doLogoutAction, doLoginDataUser } = accountSlice.actions;
export { getCoins };
export default accountSlice.reducer;
