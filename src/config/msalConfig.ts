import { Configuration, PopupRequest } from '@azure/msal-browser';
import { MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID } from './constants';

export const msalConfig: Configuration = {
    auth: {
        clientId: MICROSOFT_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
    },
};

export const loginRequest: PopupRequest = {
    scopes: ['User.Read', 'openid', 'profile', 'email'],
};
