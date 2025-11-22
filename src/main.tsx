import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { QMSProvider } from './stores/QMSContext';
import { AuthProvider } from './stores/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <QMSProvider>
          <App />
        </QMSProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);