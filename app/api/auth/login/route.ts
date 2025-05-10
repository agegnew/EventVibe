import { NextRequest, NextResponse } from 'next/server';
import { serverValidateCredentials } from '@/lib/server-data-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    const user = await serverValidateCredentials(email, password);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Don't send password back to the client
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
} 