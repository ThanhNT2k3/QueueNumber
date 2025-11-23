import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import App from './App';
import { QMSProvider } from './stores/QMSContext';
import { AuthProvider } from './stores/AuthContext';
import { BranchProvider } from './stores/BranchContext';
import { msalConfig } from './config/msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <AuthProvider>
          <BranchProvider>
            <QMSProvider>
              <App />
            </QMSProvider>
          </BranchProvider>
        </AuthProvider>
      </BrowserRouter>
    </MsalProvider>
  </React.StrictMode>
);