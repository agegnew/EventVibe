import { NextRequest, NextResponse } from 'next/server';
import { serverGetAllEvents, serverCreateEvent } from '@/lib/server-data-service';

export async function GET() {
  try {
    const events = await serverGetAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const eventDataJson = formData.get('data') as string;
    const eventData = JSON.parse(eventDataJson);
    
    // Get the image file if it exists
    const imageFile = formData.get('image') as File | null;
    
    // Process image if provided
    let imageBuffer: Buffer | undefined;
    let fileName: string | undefined;
    
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      fileName = imageFile.name;
    }
    
    // Create new event
    const newEvent = await serverCreateEvent(eventData, imageBuffer, fileName);
    
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
} 