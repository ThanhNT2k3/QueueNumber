# Multi-Provider SSO Integration (Google & Microsoft)

## 🎯 Overview

The QMS application now supports **multiple SSO providers**:
- ✅ **Google OAuth 2.0** - Sign in with Google accounts
- ✅ **Microsoft Azure AD** - Sign in with Microsoft/Office 365 accounts
- ✅ **Traditional Login** - Email/password fallback

## 📦 Implementation Summary

### Backend (.NET 6)
- ✅ Google SSO endpoint: `POST /api/auth/google-login`
- ✅ Microsoft SSO endpoint: `POST /api/auth/microsoft-login`
- ✅ Smart role assignment based on email domain
- ✅ Automatic user creation on first login
- ✅ Avatar sync from SSO providers

### Frontend (React + TypeScript)
- ✅ Google One Tap login
- ✅ Microsoft popup login
- ✅ Unified authentication context
- ✅ Beautiful SSO buttons
- ✅ Error handling & loading states

## 🔧 Setup Instructions

### 1. Google OAuth Setup

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth Client ID**
5. Configure OAuth consent screen:
   - User Type: External
   - App name: "QMS Application"
   - Support email: your-email@example.com
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     https://yourdomain.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5173
     https://yourdomain.com
     ```
7. Copy the **Client ID**

#### B. Configure Frontend

Add to `.env`:
```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

#### C. Configure Backend

Add to `appsettings.json`:
```json
{
  "Google": {
    "ClientId": "123456789-abcdefg.apps.googleusercontent.com"
  }
}
```

### 2. Microsoft Azure AD Setup

#### A. Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - Name: "QMS Application"
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI:
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:5173`
5. Click **Register**
6. Copy the **Application (client) ID**
7. Copy the **Directory (tenant) ID**

#### B. Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add:
   - `User.Read`
   - `openid`
   - `profile`
   - `email`
6. Click **Grant admin consent**

#### C. Configure Authentication

1. Go to **Authentication**
2. Under **Implicit grant and hybrid flows**, enable:
   - ✅ Access tokens
   - ✅ ID tokens
3. Save

#### D. Configure Frontend

Add to `.env`:
```env
VITE_MICROSOFT_CLIENT_ID=your-client-id-here
VITE_MICROSOFT_TENANT_ID=common
```

Use `common` for multi-tenant, or your specific tenant ID for single-tenant.

#### E. Configure Backend

Add to `appsettings.json`:
```json
{
  "Microsoft": {
    "ClientId": "your-client-id-here",
    "TenantId": "common"
  }
}
```

## 🏗️ Architecture

### Authentication Flow

```
┌─────────────┐
│    User     │
│   Clicks    │
│  SSO Button │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
  ┌─────────┐   ┌─────────┐   ┌──────────┐
  │ Google  │   │Microsoft│   │Traditional│
  │  OAuth  │   │  Azure  │   │  Login   │
  └────┬────┘   └────┬────┘   └────┬─────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   Frontend    │
              │  Receives     │
              │  Token/Creds  │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   POST to     │
              │   Backend     │
              │   /auth/*     │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Backend     │
              │   Verifies    │
              │   Token       │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Find/Create   │
              │    User       │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Assign Role   │
              │ Based on Email│
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │  Return User  │
              │     Data      │
              └───────────────┘
```

### Smart Role Assignment

The backend automatically assigns roles based on email patterns:

```csharp
private string DetermineRoleFromEmail(string email)
{
    if (email.EndsWith("@admin.sc.com") || email.Contains("admin"))
        return "ADMIN";
    
    if (email.EndsWith("@manager.sc.com") || email.Contains("manager"))
        return "MANAGER";
    
    return "TELLER"; // Default
}
```

**Customize this logic** for your organization!

## 🔐 Security Features

### 1. Token Verification

**Google:**
```csharp
var payload = await GoogleJsonWebSignature.ValidateAsync(
    credential, 
    new GoogleJsonWebSignature.ValidationSettings {
        Audience = new[] { _configuration["Google:ClientId"] }
    }
);
```

**Microsoft:**
```csharp
var handler = new JwtSecurityTokenHandler();
var token = handler.ReadJwtToken(idToken);

// Verify audience
var audience = token.Claims.FirstOrDefault(c => c.Type == "aud")?.Value;
if (audience != expectedAudience) {
    return Unauthorized();
}
```

### 2. User Data Handling

- ✅ Email is used as unique identifier
- ✅ Avatar URLs synced automatically
- ✅ User profiles updated on each login
- ✅ No passwords stored for SSO users

### 3. HTTPS Requirements

**Production checklist:**
- ✅ Use HTTPS for all endpoints
- ✅ Update redirect URIs to HTTPS
- ✅ Configure SSL certificates
- ✅ Enable HSTS headers

## 📱 Frontend Components

### AuthContext Methods

```typescript
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithGoogle: (credential: string) => Promise<boolean>;
    loginWithMicrosoft: (idToken: string, accessToken: string) => Promise<boolean>;
    logout: () => void;
    updateAssignedCounter: (counterId: string) => void;
    isLoading: boolean;
}
```

### Usage Example

```tsx
import { useAuth } from '../stores/AuthContext';

function MyComponent() {
    const { loginWithGoogle, loginWithMicrosoft } = useAuth();
    
    // Google login handled by GoogleLogin component
    
    // Microsoft login
    const handleMicrosoftLogin = async () => {
        const response = await instance.loginPopup(loginRequest);
        await loginWithMicrosoft(response.idToken, response.accessToken);
    };
}
```

## 🎨 UI Components

### Google SSO Button

```tsx
<GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={handleGoogleError}
    useOneTap
    theme="outline"
    size="large"
    text="signin_with"
    shape="rectangular"
/>
```

### Microsoft SSO Button

```tsx
<button onClick={handleMicrosoftLogin}>
    <svg>{/* Microsoft logo */}</svg>
    <span>Sign in with Microsoft</span>
</button>
```

## 🧪 Testing

### Test Accounts

**Google:**
- Use any Google account
- Role assigned based on email pattern

**Microsoft:**
- Use any Microsoft/Office 365 account
- Role assigned based on email pattern

**Traditional:**
- `admin@sc.com` / `password` → ADMIN
- `manager@sc.com` / `password` → MANAGER
- `teller@sc.com` / `password` → TELLER

### Test Scenarios

1. **First-time Google login**
   - New user created
   - Role assigned automatically
   - Avatar synced from Google

2. **First-time Microsoft login**
   - New user created
   - Role assigned automatically
   - Avatar synced from Microsoft

3. **Returning user**
   - User found by email
   - Avatar updated if changed
   - Existing role preserved

4. **Fallback to traditional**
   - SSO fails gracefully
   - Can still use email/password

## 🐛 Troubleshooting

### Google Issues

**Issue: "Invalid Client ID"**
```
Solution:
1. Check VITE_GOOGLE_CLIENT_ID in .env
2. Restart dev server after changing .env
3. Verify Client ID in Google Cloud Console
```

**Issue: "Redirect URI mismatch"**
```
Solution:
1. Add http://localhost:5173 to authorized origins
2. Wait 5 minutes for changes to propagate
3. Clear browser cache
```

### Microsoft Issues

**Issue: "AADSTS50011: Redirect URI mismatch"**
```
Solution:
1. Add http://localhost:5173 to redirect URIs in Azure
2. Use "Single-page application" platform
3. Ensure URI matches exactly (no trailing slash)
```

**Issue: "AADSTS65001: Consent required"**
```
Solution:
1. Go to API permissions in Azure
2. Click "Grant admin consent"
3. Wait a few minutes
```

**Issue: "Token validation failed"**
```
Solution:
1. Verify VITE_MICROSOFT_CLIENT_ID matches Azure
2. Check tenant ID is correct
3. Ensure ID tokens are enabled in Azure
```

### Backend Issues

**Issue: "Invalid Google token"**
```
Solution:
1. Check Google:ClientId in appsettings.json
2. Ensure Google.Apis.Auth package is installed
3. Verify token hasn't expired
```

**Issue: "Email not found in Microsoft token"**
```
Solution:
1. Check API permissions include email scope
2. Grant admin consent in Azure
3. Re-authenticate to get new token
```

## 📊 Monitoring & Analytics

### Track SSO Usage

```csharp
// Add logging in AuthController
_logger.LogInformation("User {Email} logged in via {Provider}", 
    user.Username, 
    "Google"); // or "Microsoft" or "Traditional"
```

### Metrics to Track

- SSO vs traditional login ratio
- Provider preference (Google vs Microsoft)
- New user creation rate
- Failed authentication attempts
- Average login time

## 🚀 Production Deployment

### Environment Variables

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SIGNALR_URL=https://api.yourdomain.com/qmsHub
VITE_GOOGLE_CLIENT_ID=prod-google-client-id.apps.googleusercontent.com
VITE_MICROSOFT_CLIENT_ID=prod-microsoft-client-id
VITE_MICROSOFT_TENANT_ID=your-tenant-id
```

**Backend (appsettings.Production.json):**
```json
{
  "Google": {
    "ClientId": "prod-google-client-id.apps.googleusercontent.com"
  },
  "Microsoft": {
    "ClientId": "prod-microsoft-client-id",
    "TenantId": "your-tenant-id"
  }
}
```

### Update OAuth Providers

1. **Google Cloud Console:**
   - Add production domain to authorized origins
   - Add production domain to redirect URIs

2. **Azure Portal:**
   - Add production domain to redirect URIs
   - Update app registration settings

### SSL/TLS Configuration

```csharp
// Program.cs
app.UseHttpsRedirection();
app.UseHsts();
```

## 📚 References

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- [@azure/msal-react](https://www.npmjs.com/package/@azure/msal-react)
- [Google.Apis.Auth](https://www.nuget.org/packages/Google.Apis.Auth/)

## 🎯 Next Steps

1. **Enhanced Security:**
   - Implement JWT tokens
   - Add refresh token support
   - Enable MFA for sensitive roles

2. **User Management:**
   - Admin panel for SSO users
   - Bulk user import
   - Role override capability

3. **Additional Providers:**
   - Facebook Login
   - LinkedIn Login
   - SAML 2.0 (already implemented)

4. **Analytics:**
   - Login success/failure dashboard
   - User onboarding metrics
   - Provider usage statistics
