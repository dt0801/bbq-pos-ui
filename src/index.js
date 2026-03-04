import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider apiUrl={API_URL}>
    <App />
  </AuthProvider>
);