import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { serverGetUserById, serverUpdateUser } from '@/lib/server-data-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const avatarFile = formData.get('avatar') as File | null;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!avatarFile) {
      return NextResponse.json({ error: 'Avatar file is required' }, { status: 400 });
    }
    
    // Get user to make sure they exist
    const user = await serverGetUserById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Update user with new avatar using server update function (which handles image saving)
    const updatedUser = await serverUpdateUser(
      userId, 
      { avatar: '' }, // The avatar path will be set by serverUpdateUser
      buffer,
      avatarFile.name
    );
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
    
    // Don't send password back to the client
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 });
  }
} 