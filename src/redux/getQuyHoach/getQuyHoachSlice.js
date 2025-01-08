import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    itemQuyHoach: null,
}


export const getQuyHoachSlice = createSlice({
    name: 'getquyhoach',
    initialState,
    reducers: {
        doGetQuyHoach: (state, action) => {
            state.itemQuyHoach = action.payload;
        },
        doClearQuyHoach: (state) => {
            state.itemQuyHoach = null;
        },
    }
});

export const { doGetQuyHoach, doClearQuyHoach } = getQuyHoachSlice.actions;

export default getQuyHoachSlice.reducer;