import React from 'react';
import { InfrastructureProviders } from './infrastructure/InfrastructureProviders';

interface AppProvidersProps {
    children: React.ReactNode;
}

/**
 * AppProviders - Main application provider wrapper
 * 
 * 1. Infrastructure Layer (InfrastructureProviders)
 *    - MSAL (Microsoft Authentication)
 *    - React Router (Navigation)
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <InfrastructureProviders>
            {children}
        </InfrastructureProviders>
    );
};
