import { ALL_PACKAGE_FAIL, 
    ALL_PACKAGE_REQUEST, 
    ALL_PACKAGE_SUCCESS } from "../Constants/PackageConstants.js";

export const getAllPackageReducer = (state = [], action) => {
    switch (action.type) {
      case ALL_PACKAGE_REQUEST:
        return { loading: true };
      case ALL_PACKAGE_SUCCESS:
        return { loading: false, packages: action.payload };
      case ALL_PACKAGE_FAIL:
        return { loading: false, error: action.payload };
      default:
        return state;
    }
  };
