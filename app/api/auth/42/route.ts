import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

// 42 OAuth authorization route
export async function GET(request: NextRequest) {
  try {
    // Create a random state parameter to prevent CSRF attacks
    const state = nanoid();
    
    // Store state in a cookie to verify in the callback
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, { 
      maxAge: 10 * 60, // 10 minutes
      path: '/',
      httpOnly: true,
      sameSite: 'lax'
    });
    
    // Construct the authorization URL
    const authUrl = new URL('https://api.intra.42.fr/oauth/authorize');
    authUrl.searchParams.append('client_id', process.env.FORTY_TWO_CLIENT_ID || '');
    authUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/42/callback`);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'public');
    
    // Redirect to the 42 authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_init_failed', request.url));
  }
} 