import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../../config/msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);

interface InfrastructureProvidersProps {
    children: React.ReactNode;
}

/**
 * InfrastructureProviders - Handles all infrastructure-level providers
 * 
 * Includes:
 * - MsalProvider: Microsoft Authentication Library
 * - BrowserRouter: React Router for navigation
 * 
 * These are foundational providers that don't belong to any specific domain
 * but are required for the application to function.
 */
export const InfrastructureProviders: React.FC<InfrastructureProvidersProps> = ({ children }) => {
    return (
        <MsalProvider instance={msalInstance}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </MsalProvider>
    );
};
