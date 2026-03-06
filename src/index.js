import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './AuthContext';
import { LanguageProvider } from './i18n';        // ← thêm dòng này

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <LanguageProvider>                               
    <AuthProvider apiUrl={API_URL}>
      <App />
    </AuthProvider>
  </LanguageProvider>                              
);