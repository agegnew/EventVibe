import { NextRequest, NextResponse } from 'next/server';
import { serverGetUserById, serverUpdateUser, serverDeleteUser } from '@/lib/server-data-service';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;
    const user = await serverGetUserById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;
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
    
    // Update the user
    const updatedUser = await serverUpdateUser(id, userData, imageBuffer, fileName);
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    // Handle known errors with appropriate status codes
    if (error.message === 'Email is already in use') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;
    
    // Try to delete the user
    const success = await serverDeleteUser(id);
    
    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Handle known errors with appropriate status codes
    if (error.message === 'Cannot delete the main admin account') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 