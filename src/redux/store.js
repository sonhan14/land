import { combineReducers, configureStore } from '@reduxjs/toolkit';
import accountReducer from '../redux/account/accountSlice';
import listBoxReducer from './listForum/lisForumSlice';
import searchQueryReducer from './search/searchSlice';
import getQuyHoachSliceReducer from './getQuyHoach/getQuyHoachSlice';
import filterReducer from './filter/filterSlice';
import planMapReducer from './planMap/planMapSlice';
import listMarkerReducer from './listMarker/listMarkerSllice';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import listGroupReducer from './getId/getIDSlice';
import setPolygonsReducer from './polygonSlice/polygonSlice';
import treePlans from './apiCache/treePlans';
import allPlansByProvinceSlice from './apiCache/allPlansByProvinceSlice';
import filterSliceTable from './filterSliceTable/filterSliceTable';
import plansSelected from './plansSelected/plansSelected';
import { planTableExtend } from './planTableExtend/planTableExtend';
import boundingboxReducer from './boundingMarkerBoxSlice/boundingMarkerBoxSlice';
import locationReducer from './LocationSlice/locationSlice';
// import baseApi from './apis/baseApi';
import listRegulationReducer from './ListRegulations/ListRegulationsSlice';
import allPlannings from './AllPlansSlice/AllPlansSlice';
import mapLayer from './mapLayer/mapLayerSlice';
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    blacklist: ['plansSelected', 'treePlans', 'boundingboxSlice', 'listRegulationsSlice', 'searchQuery'],
};

const rootReducer = combineReducers({
    // [baseApi.reducerPath]: baseApi.reducer,
    account: accountReducer,
    listbox: listBoxReducer,
    getid: listGroupReducer,
    getquyhoach: getQuyHoachSliceReducer,
    searchQuery: searchQueryReducer,
    filter: filterReducer,
    map: planMapReducer,
    listMarker: listMarkerReducer,
    polygonsStore: setPolygonsReducer,
    filterSliceTable: filterSliceTable.reducer,
    planTableExtend: planTableExtend.reducer,
    plansSelected: plansSelected.reducer,
    treePlans: treePlans,
    allPlansByProvinceSlice: allPlansByProvinceSlice,
    boundingboxSlice: boundingboxReducer,
    locationSlice: locationReducer,
    listRegulationsSlice: listRegulationReducer,
    allPlannings,
    mapLayer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

const persistor = persistStore(store);

export { store, persistor };
