import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPackages } from '../Actions/PackageActions';
import './PackagesComponent.css'; // Make sure to create a CSS file for styling

const PackagesComponent = () => {
  const dispatch = useDispatch();

  // Getting the package state from the Redux store
  const packageState = useSelector((state) => state.getAllPackage);
  const { loading, error, packages } = packageState;

  useEffect(() => {
    // Dispatch the action to fetch all packages when the component mounts
    dispatch(getAllPackages());
  }, [dispatch]);

  return (
    <div className="packages-container">
      <h1>Packages</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div className="cards-container">
        {packages &&
          packages.map((pkg) => (
            <div key={pkg._id} className="card">
                <h3>{pkg._id}</h3>
              <h3>{pkg.name}</h3>
              <p>Price: ${pkg.price}</p>
              <p>Limit: {pkg.limit ? pkg.limit : 'Unlimited'}</p>
              <p>Product Type: {pkg.productType}</p>
              <p>Created At: {new Date(pkg.createdAt).toLocaleDateString()}</p>
              <button className="login-button">Login</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PackagesComponent;
