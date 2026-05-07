import React from 'react';
import './Loader.css';

const Loader = ({ message = 'Загрузка...', progress }) => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>{message}</p>
      {progress !== undefined && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Loader;