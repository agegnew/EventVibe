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
    const formData = await request.formData();
    const eventDataJson = formData.get('data') as string;
    const eventData = JSON.parse(eventDataJson);
    
    console.log(`[API] Updating event ${id} with data:`, eventData);
    
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