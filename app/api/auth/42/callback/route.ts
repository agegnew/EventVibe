import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverGetUserByEmail, serverCreateUser } from '@/lib/server-data-service';

// 42 OAuth callback handler
export async function GET(request: NextRequest) {
  try {
    console.log('OAuth callback initiated');
    
    // Get the authorization code from the URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    console.log('Callback parameters:', { 
      code: code ? `${code.substring(0, 5)}...` : null, 
      state: state ? `${state.substring(0, 5)}...` : null,
      fullUrl: url.toString()
    });
    
    // Verify state to prevent CSRF attacks
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    console.log('Stored state:', storedState ? `${storedState.substring(0, 5)}...` : null);
    
    if (!state || state !== storedState) {
      console.error('State validation failed', { state, storedState });
      return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
    }
    
    // Clear the state cookie
    cookieStore.set('oauth_state', '', { maxAge: 0, path: '/' });
    
    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }
    
    // Log environment variables (without exposing full values)
    console.log('Environment check:', {
      clientIdExists: !!process.env.FORTY_TWO_CLIENT_ID,
      clientSecretExists: !!process.env.FORTY_TWO_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/42/callback`,
    });
    
    // Exchange code for an access token using x-www-form-urlencoded format
    console.log('Attempting to exchange code for token...');
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.FORTY_TWO_CLIENT_ID || '',
      client_secret: process.env.FORTY_TWO_CLIENT_SECRET || '',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/42/callback`,
    });
    
    console.log('Token request parameters:', tokenParams.toString());
    
    const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: errorText
      });
      return NextResponse.redirect(new URL(`/login?error=token_exchange_failed&status=${tokenResponse.status}`, request.url));
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Token received successfully');
    const accessToken = tokenData.access_token;
    
    // Fetch user profile from 42 API
    console.log('Fetching user profile...');
    const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('User profile fetch failed:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        response: errorText
      });
      return NextResponse.redirect(new URL('/login?error=profile_fetch_failed', request.url));
    }
    
    const profileData = await userResponse.json();
    console.log('Profile fetched successfully:', {
      login: profileData.login,
      email: profileData.email,
      hasEmail: !!profileData.email
    });
    
    // Check if user exists in our database
    let user = await serverGetUserByEmail(profileData.email);
    
    if (!user) {
      console.log('Creating new user from 42 profile');
      // Create a new user if they don't exist
      user = await serverCreateUser({
        name: profileData.displayname || profileData.login,
        email: profileData.email,
        password: '', // No password needed for OAuth
        role: 'user',
        avatar: profileData.image?.link || '/placeholder.svg',
        events: [],
      });
    } else {
      console.log('User already exists in database');
    }
    
    // Don't return password to client
    const { password: _, ...userWithoutPassword } = user;
    
    // Set a cookie with user info for client-side access
    console.log('Setting auth cookies');
    cookieStore.set('user', JSON.stringify(userWithoutPassword), { 
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      path: '/',
      httpOnly: false, // Accessible from client-side JavaScript
      sameSite: 'lax'
    });
    
    // Store login timestamp
    cookieStore.set('auth_timestamp', String(Date.now()), {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      path: '/',
      httpOnly: false,
      sameSite: 'lax'
    });
    
    // Redirect to dashboard after successful login
    console.log('OAuth login successful, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
} 