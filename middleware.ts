import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  
  // Check if the path is for the admin section
  if (pathname.startsWith('/admin')) {
    // Get the user from cookies
    const userCookie = request.cookies.get('user')?.value;
    
    // If no user is found, redirect to login page
    if (!userCookie) {
      // Create a new URL for the login page and add a message parameter
      const url = new URL('/login', request.url);
      url.searchParams.set('message', 'You must be logged in as an admin to access this page');
      url.searchParams.set('redirect', pathname);
      
      // Redirect to the login page
      return NextResponse.redirect(url);
    }
    
    try {
      // Parse the user cookie
      const userData = JSON.parse(userCookie);
      
      // Check if the user object has the expected properties
      if (!userData || !userData.id || !userData.role) {
        throw new Error('Invalid user data format');
      }
      
      // Check if the user has admin role
      if (userData.role !== 'admin') {
        // Create a new URL for dashboard with access denied message
        const url = new URL('/dashboard', request.url);
        url.searchParams.set('message', 'You do not have permission to access the admin area');
        
        // Redirect to the dashboard with access denied message
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // If there's an error parsing the user data, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('message', 'Authentication error. Please log in again.');
      url.searchParams.set('redirect', pathname);
      
      return NextResponse.redirect(url);
    }
  }
  
  // Continue to the requested page for all other routes
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/admin/:path*']
}; 