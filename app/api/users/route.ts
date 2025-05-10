import { NextRequest, NextResponse } from 'next/server';
import { serverGetAllUsers, serverCreateUser } from '@/lib/server-data-service';

export async function GET() {
  try {
    const users = await serverGetAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userDataJson = formData.get('data') as string;
    const userData = JSON.parse(userDataJson);
    
    // Get the avatar file if it exists
    const avatarFile = formData.get('avatar') as File | null;
    
    // Process avatar if provided
    let imageBuffer: Buffer | undefined;
    let fileName: string | undefined;
    
    if (avatarFile) {
      const arrayBuffer = await avatarFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      fileName = avatarFile.name;
    }
    
    // Create new user
    const newUser = await serverCreateUser(userData, imageBuffer, fileName);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle known errors with appropriate status codes
    if (error.message === 'Email is already in use') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 