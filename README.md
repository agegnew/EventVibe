# EventVibe Event Management Website

This is an event management website with offline functionality and 42 OAuth authentication.

## Features

- Event management system
- Progressive Web App (PWA) with offline support
- Service worker for caching
- IndexedDB for offline data storage
- Synchronization when back online
- 42 OAuth Authentication

## 42 OAuth Setup

To set up 42 OAuth authentication:

1. Register a new application on the 42 intranet website (https://profile.intra.42.fr/oauth/applications/new)
   - Application name: EventVibe (or your preferred name)
   - Redirect URI: `http://localhost:3000/api/auth/42/callback` (for development)
   - Scopes: `public`

2. Create a `.env.local` file in the root directory with the following variables:
   ```
   FORTY_TWO_CLIENT_ID=your_42_client_id
   FORTY_TWO_CLIENT_SECRET=your_42_client_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. Replace `your_42_client_id` and `your_42_client_secret` with the values from your registered application.

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication Flow

The 42 OAuth authentication flow works as follows:

1. User clicks the "42" button on the login page
2. User is redirected to the 42 authorization page
3. After authorizing, 42 redirects to `/api/auth/42/callback` with an authorization code
4. The server exchanges the code for an access token
5. The server fetches the user's profile from the 42 API
6. If the user doesn't exist in the database, a new user is created
7. The user is logged in and redirected to the dashboard 