import axios from 'axios';
import {
  ALL_PACKAGE_REQUEST,
  ALL_PACKAGE_SUCCESS,
  ALL_PACKAGE_FAIL,
} from '../Constants/PackageConstants';

// Fetch all packages action
export const getAllPackages = () => async (dispatch) => {
  try {
    dispatch({ type: ALL_PACKAGE_REQUEST });

    // Making a GET request to the API
    const { data } = await axios.get(stripe_admin_panel_api+'/api/products/app/Remove Multi-Select Property Option/products');

    // Dispatch success action with the retrieved data
    dispatch({
      type: ALL_PACKAGE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    // Dispatch failure action with error message
    dispatch({
      type: ALL_PACKAGE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};
