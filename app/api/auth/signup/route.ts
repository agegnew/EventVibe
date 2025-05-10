import { NextRequest, NextResponse } from 'next/server';
import { serverCreateUser, serverGetUserByEmail } from '@/lib/server-data-service';
import { User } from '@/lib/data-service';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Check if the request has a Content-Type of multipart/form-data
    const contentType = request.headers.get('Content-Type') || '';
    let name, email, password, avatarPath;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await request.formData();
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      password = formData.get('password') as string;
      
      // Handle avatar upload
      const avatarFile = formData.get('avatar') as File | null;
      
      if (avatarFile) {
        // Create directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'data', 'images', 'users');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Generate unique filename using UUID
        const fileExtension = avatarFile.name.split('.').pop() || 'jpeg';
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);
        
        // Convert file to ArrayBuffer
        const arrayBuffer = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Save file
        fs.writeFileSync(filePath, buffer);
        
        // Set avatar path
        avatarPath = `/data/images/users/${fileName}`;
      } else {
        // Use default avatar
        avatarPath = '/data/images/users/default.png';
      }
    } else {
      // Handle JSON request
      const { name: reqName, email: reqEmail, password: reqPassword } = await request.json();
      name = reqName;
      email = reqEmail;
      password = reqPassword;
      avatarPath = '/data/images/users/default.png';
    }
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    
    // Check if email already exists
    const existingUser = await serverGetUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 400 });
    }
    
    // Create new user
    const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      email,
      password,
      role: 'user', // Default role for new sign-ups
      avatar: avatarPath,
      events: []
    };
    
    const newUser = await serverCreateUser(userData);
    
    // Don't send password back to the client
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
} 