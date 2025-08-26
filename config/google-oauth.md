# Google OAuth Configuration Guide

## ✅ Your Google OAuth Credentials:

**Client ID:** `1015139019509-na1airmo1cqvjt82mm8kjr5uc7goaf8f.apps.googleusercontent.com`
**Client Secret:** `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`

## Setup Steps:

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

### 3. Environment Variables
Add these to your `.env` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID="1015139019509-na1airmo1cqvjt82mm8kjr5uc7goaf8f.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 4. Frontend Configuration
Add this to your frontend `.env` file:

```bash
REACT_APP_GOOGLE_CLIENT_ID="1015139019509-na1airmo1cqvjt82mm8kjr5uc7goaf8f.apps.googleusercontent.com"
```

## Security Features:

✅ **Real Gmail Verification**: Only actual @vutto.in Gmail accounts can access
✅ **Google Account Ownership**: Users must own the Gmail account
✅ **Email Verification**: Google verifies the email is real
✅ **Domain Restriction**: Only @vutto.in emails allowed
✅ **JWT Tokens**: Secure session management

## How It Works:

1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User logs into their Google account
4. Google verifies the account and returns an ID token
5. Backend verifies the token with Google
6. Backend checks if email ends with @vutto.in
7. Backend creates/updates user account
8. User gets JWT token and access to system

## Benefits:

- **No Fake Emails**: Impossible to create fake @vutto.in accounts
- **Professional**: Users already have Google accounts
- **Secure**: Google handles password security
- **User-Friendly**: One-click login
- **Audit Trail**: Google logs all authentication attempts
