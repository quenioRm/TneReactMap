import React from 'react';
import { Spinner } from 'react-bootstrap';
import '../css/MapSpinner.css';

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner-container">
            <Spinner animation="border" variant="primary" />
            <span>Loading...</span> {/* Optional text */}
        </div>
    );
};

export default LoadingSpinner;
