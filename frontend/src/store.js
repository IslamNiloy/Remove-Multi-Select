// src/store.js
import { legacy_createStore as createStore } from 'redux';
import {  applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from "@redux-devtools/extension";
import {thunk} from 'redux-thunk';


const initialState = {
//   userInfoByID: {
//       userInfo: localStorage.getItem('userInfo')
//         ? JSON.parse(localStorage.getItem('userInfo'))
//         : null,
//     },
};


const rootReducer = combineReducers({
  // Add other reducers here
});

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(thunk))
);

export default store;
