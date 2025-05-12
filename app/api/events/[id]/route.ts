import { NextRequest, NextResponse } from 'next/server';
import { serverGetEventById, serverUpdateEvent, serverDeleteEvent } from '@/lib/server-data-service';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;
    const event = await serverGetEventById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;
    
    let eventData: any;
    let imageBuffer: Buffer | undefined;
    let fileName: string | undefined;

    // Check the content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON requests (better for serverless environments with no file uploads)
      console.log(`[API] Processing JSON request for event ${id}`);
      const jsonData = await request.json();
      eventData = jsonData.data;
    } else {
      // Handle multipart/form-data requests (for image uploads)
      console.log(`[API] Processing FormData request for event ${id}`);
      const formData = await request.formData();
      const eventDataJson = formData.get('data') as string;
      eventData = JSON.parse(eventDataJson);
      
      // Get the image file if it exists
      const imageFile = formData.get('image') as File | null;
      
      // Process image if provided
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        fileName = imageFile.name;
      }
    }
    
    console.log(`[API] Updating event ${id} with data:`, eventData);
    
    // Update the event
    const updatedEvent = await serverUpdateEvent(id, eventData, imageBuffer, fileName);
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    console.log(`[API] Event ${id} updated successfully:`, {
      id: updatedEvent.id,
      title: updatedEvent.title,
      status: updatedEvent.status,
      registrations: updatedEvent.registrations
    });
    
    // Make sure we return the complete event object
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;
    
    const success = await serverDeleteEvent(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
} 