import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Path to the notifications JSON file
const notificationsFilePath = path.join(process.cwd(), 'public', 'data', 'notifications.json');

// Helper function to read notifications from the file
async function readNotificationsFile() {
  try {
    const data = await fsPromises.readFile(notificationsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading notifications file:', error);
    return [];
  }
}

// Helper function to write notifications to the file
async function writeNotificationsFile(notifications: any[]) {
  try {
    await fsPromises.writeFile(
      notificationsFilePath,
      JSON.stringify(notifications, null, 2),
      'utf8'
    );
    return true;
  } catch (error) {
    console.error('Error writing notifications file:', error);
    return false;
  }
}

// GET handler to fetch notifications
export async function GET() {
  try {
    const fileExists = fs.existsSync(notificationsFilePath);
    
    const notifications = await readNotificationsFile();
    
    return NextResponse.json({ 
      notifications
    });
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch notifications',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST handler to update notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.notifications || !Array.isArray(body.notifications)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected "notifications" array.' },
        { status: 400 }
      );
    }
    
    // Write notifications to file
    const success = await writeNotificationsFile(body.notifications);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error('Failed to write notifications file');
    }
  } catch (error) {
    console.error('Error in POST /api/notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
} 